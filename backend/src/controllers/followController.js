const FollowDAO = require('../dao/FollowDAO');
const axios = require('axios');

exports.followUser = async (req, res) => {
  const { id: followingId } = req.params;

  try {
    await FollowDAO.followUser(req.userId, followingId);
    res.json({ message: 'Successfully followed the user' });
  } catch (err) {
    console.error('Error following user:', err);
    res.status(500).json({ error: 'Failed to follow user' });
  }
};

exports.unfollowUser = async (req, res) => {
  const { id: followingId } = req.params;

  try {
    const changes = await FollowDAO.unfollowUser(req.userId, followingId);
    if (changes === 0) return res.status(404).json({ error: 'Follow relationship not found' });
    res.json({ message: 'Successfully unfollowed the user' });
  } catch (err) {
    console.error('Error unfollowing user:', err);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
};

exports.getFollowedPosts = async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;

  try {
    const posts = await FollowDAO.getFollowedPosts(req.userId, parseInt(limit), parseInt(offset));

    // Fetch country flags for each post
    const postsWithFlags = await Promise.all(
      posts.map(async (post) => {
        try {
          const countryResponse = await axios.get(`https://restcountries.com/v3.1/name/${post.country}`);
          const countryData = countryResponse.data[0];
          const flagUrl = countryData?.flags?.png || null;
          return { ...post, flagUrl };
        } catch {
          return { ...post, flagUrl: null }; // Default to null if the flag cannot be fetched
        }
      })
    );

    res.json(postsWithFlags);
  } catch (err) {
    console.error("Error fetching followed posts:", err);
    res.status(500).json({ error: "Failed to fetch followed posts" });
  }
};
