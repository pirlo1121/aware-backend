const Post = require('../models/Post');
const slugify = require('slugify');
const { notifyNewPost } = require('../services/notificationService');
const { deletePostImages } = require('../services/s3CleanupService');
const { sanitizePost } = require('../middlewares/sanitizeMiddleware');
const postsCache = require('../utils/simpleCache');

const POSTS_CACHE_TTL_MS = 30_000; // alineado con el Cache-Control de abajo

// @desc    Get all posts (con paginación, lean, y caché)
// @route   GET /api/posts
// @access  Public (only published) or Private (all for admin/author)
exports.getPosts = async (req, res) => {
  try {
    let query = { status: 'published' };
    const isAdmin = req.user && req.user.role === 'admin';

    // If admin, they can see all posts
    if (isAdmin) {
      query = {};
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    // Solo cacheamos la vista pública (posts publicados), que es la que recibe
    // la mayoría del tráfico. La vista admin siempre va directo a la DB.
    const cacheKey = !isAdmin ? `public:${page}:${limit}` : null;
    const cached = cacheKey ? postsCache.get(cacheKey) : null;

    if (cached) {
      res.set('Cache-Control', 'public, max-age=30');
      return res.status(200).json(cached);
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .select('-content') // el listado no necesita el contenido completo del post
        .populate('author', 'name email')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    const responseBody = {
      success: true,
      count: total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
      data: posts,
    };

    if (cacheKey) {
      postsCache.set(cacheKey, responseBody, POSTS_CACHE_TTL_MS);
    }

    res.set('Cache-Control', 'public, max-age=30');
    res.status(200).json(responseBody);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single post by slug
// @route   GET /api/posts/:slug
// @access  Public
exports.getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('author', 'name email')
      .lean();

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.set('Cache-Control', 'public, max-age=60');
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    // Add user to req.body con postman
    // const data = JSON.parse(req.body.data); 

    // sin postman
    const data = req.body

    // Parse JSON-stringified fields (multipart/form-data sends all values as strings)
    if (typeof data.tags === 'string') {
      try { data.tags = JSON.parse(data.tags); } catch (e) { /* leave as-is */ }
    }
    if (typeof data.content === 'string') {
      try { data.content = JSON.parse(data.content); } catch (e) { /* leave as-is */ }
    }

    sanitizePost(data);

    data.author = req.user.id;

    // Handle uploaded files (multipart fields → req.files)
    if (req.files) {
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        data.coverImage = req.files.coverImage[0].location;
      }
      if (req.files.contentImages && req.files.contentImages.length > 0) {
        let imgIndex = 0;
        for (const block of data.content) {
          if (block.type === 'image' && imgIndex < req.files.contentImages.length) {
            if (!block.imageUrl || block.imageUrl === '__UPLOAD__') {
              block.imageUrl = req.files.contentImages[imgIndex].location;
              imgIndex++;
            }
          }
        }
      }
    }

    // Auto-generate slug from title
    let slug = slugify(data.title, { lower: true, strict: true });
    let counter = 1;
    let baseSlug = slug;

    while (await Post.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    data.slug = slug;

    const post = await Post.create(data);

    postsCache.clear();

    // Si el post se crea directamente como publicado, notificar a los subscriptores
    if (post.status === 'published') {
      notifyNewPost(post);
    }

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id).select('author status').lean();

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Make sure user is post owner or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'User not authorized to update this post' });
    }

    const data = req.body;

    // Parse JSON-stringified fields (for multipart/form-data requests)
    if (typeof data.tags === 'string') {
      try { data.tags = JSON.parse(data.tags); } catch (e) { /* leave as-is */ }
    }
    if (typeof data.content === 'string') {
      try { data.content = JSON.parse(data.content); } catch (e) { /* leave as-is */ }
    }

    sanitizePost(data);

    // Handle uploaded files
    if (req.files) {
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        data.coverImage = req.files.coverImage[0].location;
      }
      if (req.files.contentImages && req.files.contentImages.length > 0) {
        let imgIndex = 0;
        for (const block of data.content) {
          if (block.type === 'image' && imgIndex < req.files.contentImages.length) {
            if (!block.imageUrl || block.imageUrl === '__UPLOAD__') {
              block.imageUrl = req.files.contentImages[imgIndex].location;
              imgIndex++;
            }
          }
        }
      }
    }

    const wasDraft = post.status === 'draft';

    post = await Post.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });

    postsCache.clear();

    // Si era borrador y ahora está publicado, notificar
    if (wasDraft && post.status === 'published') {
      notifyNewPost(post);
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Slug already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all draft posts
// @route   GET /api/posts/drafts
// @access  Private (own drafts) or Admin (all drafts)
exports.getDrafts = async (req, res) => {
  try {
    let query = { status: 'draft' };

    if (req.user.role !== 'admin') {
      query.author = req.user.id;
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    res.set('Cache-Control', 'private, max-age=10');
    res.status(200).json({
      success: true,
      count: total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Publish a post (change status from draft to published)
// @route   PATCH /api/posts/:id/publish
// @access  Private (author or admin)
exports.publishPost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id).select('author status').lean();

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'User not authorized to publish this post' });
    }

    if (post.status === 'published') {
      return res.status(400).json({ success: false, error: 'Post is already published' });
    }

    post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true, runValidators: true }
    );

    postsCache.clear();

    // Notificar a los subscriptores sobre el nuevo post
    notifyNewPost(post);

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('author coverImage content').lean();

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Make sure user is post owner or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'User not authorized to delete this post' });
    }

    // Clean up associated S3 images
    await deletePostImages(post);

    await Post.findByIdAndDelete(req.params.id);

    postsCache.clear();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
