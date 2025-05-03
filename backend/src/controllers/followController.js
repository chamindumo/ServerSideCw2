const FollowDAO = require('../dao/FollowDAO');

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
    res.json(posts);
  } catch (err) {
    console.error('Error fetching followed posts:', err);
    res.status(500).json({ error: 'Failed to fetch followed posts' });
  }
};
