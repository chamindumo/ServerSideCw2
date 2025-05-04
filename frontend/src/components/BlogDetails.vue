<template>
  <div class="blog-details">
    <h1>{{ blog.title }}</h1>
    <p>{{ blog.content }}</p>
    <p><strong>Country:</strong> {{ blog.country }}</p>
    <p><strong>Visit Date:</strong> {{ blog.visitDate }}</p>
    <p><strong>Likes:</strong> {{ blog.likes }}</p>
    <p><strong>Dislikes:</strong> {{ blog.dislikes }}</p>
    <button @click="likeBlog">Like</button>
    <button @click="dislikeBlog">Dislike</button>
    <router-link :to="{ name: 'CommentSection', params: { postId: blog.id } }">View Comments</router-link>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  name: "BlogDetails",
  props: ["id"],
  data() {
    return {
      blog: null,
    };
  },
  async mounted() {
    try {
      const response = await api.get(`/blog/${this.id}`);
      this.blog = response.data;
    } catch (err) {
      console.error("Error fetching blog details:", err);
    }
  },
  methods: {
    async likeBlog() {
      try {
        const token = localStorage.getItem("userToken"); // Retrieve JWT token
        const csrfToken = localStorage.getItem("csrfToken"); // Retrieve CSRF token

        await api.post(`/comment/${this.id}/like`, {}, {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT token
            "X-CSRF-Token": csrfToken, // Include CSRF token
          },
        });
        this.blog.likes++;
      } catch (err) {
        console.error("Error liking blog:", err);
      }
    },
    async dislikeBlog() {
      try {
        const token = localStorage.getItem("userToken"); // Retrieve JWT token
        const csrfToken = localStorage.getItem("csrfToken"); // Retrieve CSRF token

        await api.post(`/comment/${this.id}/dislike`, {}, {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT token
            "X-CSRF-Token": csrfToken, // Include CSRF token
          },
        });
        this.blog.dislikes++;
      } catch (err) {
        console.error("Error disliking blog:", err);
      }
    },
  },
};
</script>

<style scoped>
.blog-details {
  max-width: 800px;
  margin: 0 auto;
}
</style>
