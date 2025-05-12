const CommentDAO = require('../dao/CommentDAO');
const UserDAO = require('../dao/UserDAO');

exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  try {
    const commentId = await CommentDAO.addComment(postId, req.userId, content);
    const user = await UserDAO.getUserById(req.userId); // Fetch the user's name
    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: commentId,
        username: `${user.firstname} ${user.lastname}`,
        content,
      },
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

exports.getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await CommentDAO.getCommentsByPost(postId);
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

exports.likePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const result = await CommentDAO.toggleLikeDislike(postId, req.userId, true);
    res.json({ message: 'Post liked successfully', action: result.action });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(400).json({ error: err.message || 'Failed to like post' });
  }
};

exports.dislikePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const result = await CommentDAO.toggleLikeDislike(postId, req.userId, false);
    res.json({ message: 'Post disliked successfully', action: result.action });
  } catch (err) {
    console.error('Error disliking post:', err);
    res.status(400).json({ error: err.message || 'Failed to dislike post' });
  }
};

exports.getUserReaction = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  try {
    const reaction = await CommentDAO.getUserReaction(postId, userId);
    res.json({ reaction });
  } catch (err) {
    console.error('Error getting user reaction:', err);
    res.status(500).json({ error: 'Failed to get user reaction' });
  }
};
