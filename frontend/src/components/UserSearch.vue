<template>
  <div class="user-search">
    <h1>Search</h1>
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search users or blog posts by country or poster's name..."
      @input="search"
      class="search-bar"
    />
    <div v-if="loading" class="loading">Searching...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- User Results -->
    <div v-if="users.length > 0" class="user-results">
      <h2>Users</h2>
      <div class="user-cards">
        <div v-for="user in users" :key="user.id" class="user-card">
          <img :src="'http://localhost:3000' + user.image_path" alt="Profile" class="user-image" />
          <h3>{{ user.firstname }} {{ user.lastname }}</h3>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <router-link :to="{ name: 'UserProfile', params: { id: user.id } }" class="view-profile-btn">
            View Profile
          </router-link>
        </div>
      </div>
    </div>

    <!-- Blog Post Results -->
    <div v-if="blogs.length > 0" class="blog-results">
      <h2>Blog Posts</h2>
      <div class="blog-cards">
        <div v-for="blog in blogs" :key="blog.id" class="blog-card">
          <img :src="blog.image_path" alt="Blog Image" class="blog-image" />
          <h3>{{ blog.title }}</h3>
          <p><strong>Country:</strong> {{ blog.country }}</p>
          <p><strong>Posted by:</strong> {{ blog.posterName }}</p>
          <router-link :to="{ name: 'BlogDetails', params: { id: blog.id } }" class="view-post-btn">
            View Post
          </router-link>
        </div>
      </div>
    </div>

    <p v-if="users.length === 0 && blogs.length === 0 && !loading && !error" class="no-results">
      No results found.
    </p>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  name: "UserSearch",
  data() {
    return {
      searchQuery: "",
      users: [],
      blogs: [],
      loading: false,
      error: null,
    };
  },
  methods: {
    async search() {
      if (!this.searchQuery.trim()) {
        this.users = [];
        this.blogs = [];
        return;
      }
      this.loading = true;
      this.error = null;
      try {
        // Search for users
        const userResponse = await api.get("/user/search", {
          params: { query: this.searchQuery },
        });
        this.users = userResponse.data;

        // Search for blog posts
        const blogResponse = await api.get("/blog/search", {
          params: { query: this.searchQuery },
        });
        this.blogs = blogResponse.data.map(blog => ({
          ...blog,
          image_path: blog.image_path ? `http://localhost:3000${blog.image_path}` : null,
        }));
      } catch (err) {
        console.error("Error searching:", err);
        this.error = "Failed to search. Please try again.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.user-search {
  max-width: 800px;
  margin: 20px auto;
  text-align: center;
}

.search-bar {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

.user-cards,
.blog-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.user-card,
.blog-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
}

.user-image,
.blog-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 10px;
}

.view-profile-btn,
.view-post-btn {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}

.view-profile-btn:hover,
.view-post-btn:hover {
  background-color: #369f6e;
}

.loading,
.error,
.no-results {
  margin-top: 20px;
  font-size: 16px;
}
</style>
