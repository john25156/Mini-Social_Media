const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const User = require('../models/User');

// Follow a user
router.post('/', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    if (followerId === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });
    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user" });
    }

    const newFollow = new Follow({ follower: followerId, following: followingId });
    await newFollow.save();

    // Update User followers and following arrays
    await User.findByIdAndUpdate(followerId, { $push: { following: followingId } });
    await User.findByIdAndUpdate(followingId, { $push: { followers: followerId } });

    res.status(201).json(newFollow);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow a user
router.delete('/', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    const follow = await Follow.findOneAndDelete({ follower: followerId, following: followingId });
    if (!follow) {
      return res.status(400).json({ message: "Not following this user" });
    }

    // Update User followers and following arrays
    await User.findByIdAndUpdate(followerId, { $pull: { following: followingId } });
    await User.findByIdAndUpdate(followingId, { $pull: { followers: followerId } });

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
