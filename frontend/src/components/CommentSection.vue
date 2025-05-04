<template>
  <div class="comment-section">
    <h1>Comments</h1>
    <ul>
      <li v-for="comment in comments" :key="comment.id">
        <p><strong>{{ comment.username }}:</strong> {{ comment.content }}</p>
        <button @click="likeComment(comment.id)">Like</button>
      </li>
    </ul>
    <form @submit.prevent="addComment">
      <textarea v-model="newComment" placeholder="Add a comment..." required></textarea>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  name: "CommentSection",
  props: ["postId"],
  data() {
    return {
      token: localStorage.getItem("userToken"), // Retrieve the JWT token
      comments: [],
      newComment: "",
      error: null,
    };
  },
  async mounted() {
    try {
      const response = await api.get(`/comment/${this.postId}`);
      this.comments = response.data;
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  },
  methods: {
    async addComment() {
      try {
        const token = localStorage.getItem("userToken"); // Retrieve JWT token
        const csrfToken = localStorage.getItem("csrfToken"); // Retrieve CSRF token

        await api.post(`/comment/${this.postId}`, { content: this.newComment }, {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT token
            "X-CSRF-Token": csrfToken, // Include CSRF token
          },
        });
        this.comments.push({ username: "You", content: this.newComment });
        this.newComment = "";
      } catch (err) {
        console.error("Error adding comment:", err);
      }
    },
    async likeComment(commentId) {
      try {
        const token = localStorage.getItem("userToken"); // Retrieve JWT token
        const csrfToken = localStorage.getItem("csrfToken"); // Retrieve CSRF token

        await api.post(`/comment/${commentId}/like`, {}, {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT token
            "X-CSRF-Token": csrfToken, // Include CSRF token
          },
        });
        console.log("Comment liked successfully");
      } catch (err) {
        console.error("Error liking comment:", err);
        this.error = err.response?.data?.error || "Failed to like comment. Please try again.";
      }
    },
  },
};
</script>

<style scoped>
.comment-section {
  max-width: 800px;
  margin: 0 auto;
}
</style>
