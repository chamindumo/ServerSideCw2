<template>
  <div class="blog-list">
    <h1>Follow user posts</h1>
    <div class="blog-cards">
      <div v-for="blog in posts" :key="blog.id" class="blog-card">
        <router-link :to="{ name: 'BlogDetails', params: { id: blog.id } }">
          <h2>{{ blog.title }}</h2>
          <p>{{ blog.content.slice(0, 100) }}...</p>
        </router-link>
      </div>
    </div>
    <p v-if="loading" class="loading">Loading...</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  name: "FollowFeed",
  data() {
    return {
      posts: [],
      loading: false,
      error: null,
    };
  },
  async mounted() {
    try {
      const token = localStorage.getItem("userToken"); // Retrieve JWT token
      const csrfToken = localStorage.getItem("csrfToken"); // Retrieve CSRF token

      const response = await api.get("/follow/feed", {
        headers: {
          Authorization: `Bearer ${token}`, // Include JWT token
          "X-CSRF-Token": csrfToken, // Include CSRF token
        },
      });
      this.posts = response.data; // Ensure the API includes the username of the followed user
    } catch (err) {
      console.error("Error fetching followed posts:", err);
      this.error = err.response?.data?.error || "Failed to fetch followed posts. Please try again.";
    }
  },
};
</script>

<style scoped>
.blog-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.blog-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.blog-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.blog-card h2 {
  margin: 0 0 10px;
  color: #2c3e50;
}

.blog-card p {
  color: #7f8c8d;
}
</style>
