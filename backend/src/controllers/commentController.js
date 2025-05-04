const CommentDAO = require('../dao/CommentDAO');

exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  try {
    const commentId = await CommentDAO.addComment(postId, req.userId, content);
    res.status(201).json({ message: 'Comment added successfully', commentId });
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
    const changes = await CommentDAO.toggleLikeDislike(postId, true);
    if (changes === 0) return res.status(404).json({ error: 'Blog post not found' });
    res.json({ message: 'Post liked successfully' });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

exports.dislikePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const changes = await CommentDAO.toggleLikeDislike(postId, false);
    if (changes === 0) return res.status(404).json({ error: 'Blog post not found' });
    res.json({ message: 'Post disliked successfully' });
  } catch (err) {
    console.error('Error disliking post:', err);
    res.status(500).json({ error: 'Failed to dislike post' });
  }
};
