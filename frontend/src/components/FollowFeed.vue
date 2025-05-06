<template>
  <div class="blog-list">
    <h1>Followed Blogs</h1>
    <div class="blog-cards">
      <div v-for="blog in posts" :key="blog.id" class="blog-card">
        <router-link :to="{ name: 'BlogDetails', params: { id: blog.id } }">
          <img :src="blog.imageUrl" alt="Blog Image" class="blog-image" />
        </router-link>
        <div class="blog-meta">
          <span v-for="(category, index) in blog.categories" :key="index" class="category">
            {{ category }}
          </span>
        </div>
        <h2>{{ blog.title }}</h2>
        <div v-html="blog.content.slice(0, 150) + '...'"></div>
        <router-link :to="{ name: 'BlogDetails', params: { id: blog.id } }" class="read-more">
          Read More
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
      limit: 10,
      offset: 0,
      allPostsLoaded: false,
    };
  },
  async mounted() {
    await this.fetchPosts();
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    async fetchPosts() {
      if (this.loading || this.allPostsLoaded) return;
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem("userToken");
        const csrfToken = localStorage.getItem("csrfToken");

        const response = await api.get("/follow/feed", {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-Token": csrfToken,
          },
          params: { limit: this.limit, offset: this.offset },
        });

        const newPosts = response.data.map(post => ({
          ...post,
          imageUrl: post.image_path
            ? `http://localhost:3000${post.image_path}`
            : "https://via.placeholder.com/300x200?text=No+Image", // Dummy image URL
          categories: post.categories || ["General"],
        }));
        if (newPosts.length === 0) {
          this.allPostsLoaded = true;
        } else {
          this.posts = [...this.posts, ...newPosts];
          this.offset += this.limit;
        }
      } catch (err) {
        console.error("Error fetching followed posts:", err);
        this.error = err.response?.data?.error || "Failed to fetch followed posts. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    handleScroll() {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - 100) {
        this.fetchPosts();
      }
    },
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
  grid-template-columns: repeat(3, 1fr); /* Ensure 3 blogs per row */
  gap: 20px;
}

.blog-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  text-align: center;
  padding: 20px;
  height: 400px; /* Set a fixed height for the card */
  width: 300px;

}

.blog-card img {
  width: 100%;
  height: 200px; /* Set a fixed height for the image */
  object-fit: cover;
  border-radius: 10px;
  background-color: #f4f4f4; /* Placeholder background for missing images */
}

.blog-meta {
  margin: 10px 0;
  font-size: 14px;
  color: #e67e22;
}

.blog-meta .category {
  margin-right: 5px;
}

.blog-card h2 {
  margin: 10px 0;
  font-size: 18px;
  color: #2c3e50;
  height: 40px; /* Ensure consistent height for titles */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.blog-card p {
  font-size: 14px;
  color: #7f8c8d;
  height: 60px; /* Ensure consistent height for content */
  overflow: hidden;
  text-overflow: ellipsis;
}

.read-more {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #e67e22;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 14px;
}

.read-more:hover {
  background-color: #d35400;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #2c3e50;
}

.error {
  text-align: center;
  color: red;
}
</style>
