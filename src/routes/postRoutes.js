const express = require('express');
const {
  getPosts,
  getPostBySlug,
  getDrafts,
  createPost,
  updatePost,
  deletePost,
  publishPost
} = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Optional protect middleware for GET posts allows admin to see drafts.
// But we can just make it public and check req.cookies manually if we want,
// For simplicity, we define public routes explicitly.

// Public routes
router.get('/', getPosts);
router.get('/drafts', protect, getDrafts);
router.get('/:slug', getPostBySlug);

// Private routes
router.use(protect); // All routes below this will require authentication

const uploadFields = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'contentImages', maxCount: 20 }
]);

router.post('/', (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'La imagen no puede superar los 5MB' });
      }
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
}, createPost);

router.put('/:id', (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'La imagen no puede superar los 5MB' });
      }
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
}, updatePost);
router.patch('/:id/publish', publishPost);
router.delete('/:id', deletePost);

module.exports = router;
