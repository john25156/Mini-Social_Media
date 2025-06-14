const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Create a new comment
router.post('/', async (req, res) => {
  try {
    const { postId, author, content } = req.body;
    const newComment = new Comment({ post: postId, author, content });
    await newComment.save();

    // Add comment to post's comments array
    const post = await Post.findById(postId);
    post.comments.push(newComment._id);
    await post.save();

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a comment
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.likes.includes(userId)) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
