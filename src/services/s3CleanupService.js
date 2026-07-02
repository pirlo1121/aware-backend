const { DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/s3');

const extractS3KeyFromUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes(process.env.AWS_BUCKET_NAME)) return null;
    return parsed.pathname.replace(/^\//, '');
  } catch {
    return null;
  }
};

const collectImageUrls = (post) => {
  const urls = [];

  if (post.coverImage) {
    urls.push(post.coverImage);
  }

  if (post.content && Array.isArray(post.content)) {
    for (const block of post.content) {
      if (block.type === 'image' && block.imageUrl) {
        urls.push(block.imageUrl);
      }
    }
  }

  return urls;
};

const deletePostImages = async (post) => {
  const urls = collectImageUrls(post);

  const keys = urls
    .map((url) => extractS3KeyFromUrl(url))
    .filter(Boolean);

  if (keys.length === 0) return;

  const command = new DeleteObjectsCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Delete: {
      Objects: keys.map((key) => ({ Key: key })),
    },
  });

  await s3.send(command);
};

module.exports = { deletePostImages };
