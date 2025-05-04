<template>
  <div class="blog-list">
    <h1>All Blogs</h1>
    <ul>
      <li v-for="blog in blogs" :key="blog.id">
        <router-link :to="{ name: 'BlogDetails', params: { id: blog.id } }">
          {{ blog.title }}
        </router-link>
      </li>
    </ul>
    <p v-if="loading" class="loading">Loading...</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  name: "BlogList",
  data() {
    return {
      blogs: [], // List of blogs
      loading: false, // Loading state
      error: null, // Error message
    };
  },
  async mounted() {
    this.fetchBlogs(); // Fetch blogs when the component is mounted
  },
  methods: {
    async fetchBlogs() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get("/blog"); // Fetch all blogs from the backend
        this.blogs = response.data; // Store the blogs in the component's state
      } catch (err) {
        console.error("Error fetching blogs:", err);
        this.error = "Failed to load blogs. Please try again later.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.blog-list {
  max-width: 800px;
  margin: 0 auto;
}
.loading {
  text-align: center;
  margin-top: 10px;
}
.error {
  color: red;
  text-align: center;
}
</style>
