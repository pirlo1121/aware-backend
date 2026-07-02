const sanitizeHtml = require('sanitize-html');

const sanitizeText = (value) => {
  if (typeof value !== 'string') return value;
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    stripIgnoreAll: true,
  }).trim();
};

const sanitizeRichText = (value) => {
  if (typeof value !== 'string') return value;
  return sanitizeHtml(value, {
    allowedTags: [
      'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's',
      'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code', 'span',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard',
  }).trim();
};

const sanitizePost = (data) => {
  if (data.title) data.title = sanitizeText(data.title);
  if (data.excerpt) data.excerpt = sanitizeRichText(data.excerpt);

  if (Array.isArray(data.content)) {
    for (const block of data.content) {
      if (block.type === 'heading' || block.type === 'paragraph' || block.type === 'quote') {
        if (block.content) block.content = sanitizeRichText(block.content);
      }
      if (block.type === 'list' && Array.isArray(block.items)) {
        block.items = block.items.map((item) => sanitizeRichText(item));
      }
    }
  }
};

const sanitizePostData = (req, res, next) => {
  const data = req.body;

  if (typeof data.tags === 'string') {
    try { data.tags = JSON.parse(data.tags); } catch (e) { /* ignore */ }
  }
  if (typeof data.content === 'string') {
    try { data.content = JSON.parse(data.content); } catch (e) { /* ignore */ }
  }

  sanitizePost(data);

  next();
};

module.exports = { sanitizePostData, sanitizePost, sanitizeText, sanitizeRichText };
