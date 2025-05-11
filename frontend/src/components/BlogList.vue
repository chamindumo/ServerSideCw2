<template>
  <div class="blog-list">
    <h1>All Blogs</h1>
    <div class="sort-options">
      <label for="sort">Sort by:</label>
      <select id="sort" v-model="sortOption" @change="sortBlogs">
        <option value="newest">Newest</option>
        <option value="mostLikes">Most Likes</option>
      </select>
    </div>
    <div class="blog-cards">
      <div v-for="blog in blogs" :key="blog.id" class="blog-card">
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
  name: "BlogList",
  data() {
    return {
      blogs: [],
      loading: false,
      error: null,
      limit: 10,
      offset: 0,
      allBlogsLoaded: false,
      sortOption: "newest", // New property for sorting
    };
  },
  async mounted() {
    await this.fetchBlogs();
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    async fetchBlogs() {
      if (this.loading || this.allBlogsLoaded) return;
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get("/blog", {
          params: { limit: this.limit, offset: this.offset, sortBy: this.sortOption },
        });
        const newBlogs = response.data.map(post => ({
          ...post,
          imageUrl: post.image_path
            ? post.image_path
            : "https://via.placeholder.com/300x200?text=No+Image", // Dummy image URL
          categories: post.categories || ["General"],
        }));
        if (newBlogs.length === 0) {
          this.allBlogsLoaded = true;
        } else {
          this.blogs = [...this.blogs, ...newBlogs];
          this.offset += this.limit;
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        this.error = "Failed to load blogs. Please try again later.";
      } finally {
        this.loading = false;
      }
    },
    handleScroll() {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - 100) {
        this.fetchBlogs();
      }
    },
    sortBlogs() {
      if (this.sortOption === "newest") {
        this.blogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (this.sortOption === "mostLikes") {
        this.blogs.sort((a, b) => b.likes - a.likes);
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
  height: 450px; /* Set a fixed height for the card */
  width: 350px;
}

.blog-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
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
}

.blog-card p {
  font-size: 14px;
  color: #7f8c8d;
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

.sort-options {
  margin-bottom: 20px;
  text-align: right;
}

.sort-options label {
  margin-right: 10px;
  font-size: 16px;
  color: #2c3e50;
}

.sort-options select {
  padding: 5px 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
