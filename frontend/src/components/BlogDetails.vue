<template>
  <div class="blog-details">
    <div v-if="loading" class="loading">Loading blog details...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="blog-container">
      <div class="blog-header">
        <h1>{{ blog.title }}</h1>
        <button v-if="!isFollowing" @click="followUser(blog.user_id)" class="follow-btn">Follow</button>
        <p v-else class="followed-text">You are following this user</p>
      </div>
      <div v-if="blog.image_path" class="blog-image-container">
        <img :src="blog.image_path" alt="Blog Image" class="blog-image" />
      </div>
      <div class="blog-content">
        <div v-html="sanitizedContent" class="sanitized-content"></div>
        <p><strong>Country:</strong> {{ blog.country }}</p>
        <p v-if="blog.flagUrl">
          <strong>Flag:</strong>
          <img :src="blog.flagUrl" alt="Country flag" class="country-flag" />
        </p>
        <div class="likes-dislikes">
          <p><strong>Likes:</strong> {{ blog.likes }}</p>
          <p><strong>Dislikes:</strong> {{ blog.dislikes }}</p>
        </div>
        <div class="actions" v-if="isLoggedIn">
          <button @click="likeBlog" class="like-btn">Like</button>
          <button @click="dislikeBlog" class="dislike-btn">Dislike</button>
        </div>
        <p v-else class="login-prompt">Log in to like or dislike this post.</p>
      </div>

      <div class="comments-section">
        <h2>Comments</h2>
        <ul>
          <li v-for="comment in comments" :key="comment.id">
            <p><strong>{{ comment.username }}:</strong> {{ comment.content }}</p>
          </li>
        </ul>
        <form v-if="isLoggedIn" @submit.prevent="addComment">
          <textarea v-model="newComment" placeholder="Add a comment..." required></textarea>
          <button type="submit">Submit</button>
        </form>
        <p v-else class="login-prompt">Log in to add a comment.</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../services/api";
import DOMPurify from "dompurify";

export default {
  name: "BlogDetails",
  props: ["id"],
  data() {
    return {
      blog: null,
      comments: [],
      newComment: "",
      loading: true,
      error: null,
      isFollowing: false,
      isLoggedIn: !!localStorage.getItem("userToken"), // Check login status
    };
  },
  async mounted() {
    try {
      const response = await api.get(`/blog/${this.id}`);
      this.blog = {
        ...response.data,
        image_path: response.data.image_path ? response.data.image_path : null,
      };

      const commentsResponse = await api.get(`/comment/${this.id}`);
      this.comments = commentsResponse.data;

      if (this.isLoggedIn) {
        try {
          const followResponse = await api.get(`/follow/${this.blog.user_id}/status`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          });
          this.isFollowing = followResponse.data.isFollowing;
        } catch (err) {
          console.warn("Unable to fetch follow status. Defaulting to not following.");
          this.isFollowing = false;
        }
      }
    } catch (err) {
      console.error("Error fetching blog details or comments:", err);
      this.error = "Failed to load blog details or comments. Please try again.";
    } finally {
      this.loading = false;
    }
  },
  computed: {
    sanitizedContent() {
      const sanitized = DOMPurify.sanitize(this.blog.content); // Sanitize HTML content
      return `<div class="sanitized-content">${sanitized}</div>`; // Wrap in a styled container
    },
  },
  methods: {
    async likeBlog() {
      if (!this.isLoggedIn) return;
      try {
        await api.post(`/comment/${this.id}/like`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });
        this.blog.likes++;
      } catch (err) {
        console.error("Error liking blog:", err);
      }
    },
    async dislikeBlog() {
      if (!this.isLoggedIn) return;
      try {
        await api.post(`/comment/${this.id}/dislike`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });
        this.blog.dislikes++;
      } catch (err) {
        console.error("Error disliking blog:", err);
      }
    },
    async followUser(userId) {
      if (!this.isLoggedIn) {
        alert("You need to log in or sign up to follow users.");
        return;
      }
      try {
        await api.post(`/follow/${userId}/follow`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });
        this.isFollowing = true;
      } catch (err) {
        console.error("Error following user:", err);
        this.error = "Failed to follow the user. Please try again.";
      }
    },
    async addComment() {
      if (!this.isLoggedIn) return;
      try {
        await api.post(`/comment/${this.id}`, { content: this.newComment }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });
        this.comments.push({ username: "You", content: this.newComment });
        this.newComment = "";
      } catch (err) {
        console.error("Error adding comment:", err);
      }
    },
  },
};
</script>

<style scoped>
.blog-details {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
}
.blog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.blog-header h1 {
  font-size: 24px;
  color: #333;
}
.follow-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}
.follow-btn:hover {
  background-color: #369f6e;
}
.followed-text {
  color: #42b983;
  font-weight: bold;
}
.blog-content {
  margin-top: 20px;
  color: #555;
}
.blog-content img {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 10px 0;
  display: block;
}
.blog-image-container {
  text-align: center;
  margin-bottom: 20px;
}
.blog-image {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.country-flag {
  width: 100px;
  height: auto;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.likes-dislikes {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}
.actions {
  margin-top: 10px;
}
.like-btn,
.dislike-btn {
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}
.like-btn:hover,
.dislike-btn:hover {
  background-color: #34495e;
}
.comments-section {
  margin-top: 30px;
  background: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.comments-section h2 {
  margin-bottom: 15px;
  font-size: 20px;
  color: #333;
}
.comments-section ul {
  list-style: none;
  padding: 0;
}
.comments-section li {
  margin-bottom: 10px;
  padding: 10px;
  background: #f4f4f4;
  border-radius: 5px;
}
.comments-section textarea {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}
.comments-section button {
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}
.comments-section button:hover {
  background-color: #369f6e;
}
.error {
  color: red;
  text-align: center;
  font-size: 16px;
}
.loading {
  text-align: center;
  font-size: 18px;
  color: #2c3e50;
}
.login-prompt {
  color: #e74c3c;
  font-weight: bold;
  margin-top: 10px;
  text-align: center;
}

.sanitized-content {
  word-wrap: break-word;
  color: #444;
  line-height: 1.8;
  font-size: 16px;
  margin-top: 20px;
}

.sanitized-content p {
  margin-bottom: 15px;
}

.sanitized-content a {
  color: #42b983;
  text-decoration: underline;
}

.sanitized-content a:hover {
  text-decoration: none;
}

.sanitized-content ul {
  list-style: disc;
  margin-left: 20px;
}

.sanitized-content ol {
  list-style: decimal;
  margin-left: 20px;
}

.sanitized-content img {
  max-width: 100%; /* Ensure images fit within the container */
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 10px 0;
  display: block; /* Prevent inline image overflow issues */
}

.sanitized-content blockquote {
  margin: 20px 0;
  padding: 10px 20px;
  background: #f9f9f9;
  border-left: 5px solid #42b983;
  color: #555;
  font-style: italic;
}

.sanitized-content h1,
.sanitized-content h2,
.sanitized-content h3,
.sanitized-content h4,
.sanitized-content h5,
.sanitized-content h6 {
  margin: 20px 0 10px;
  font-weight: bold;
  color: #333;
}

.sanitized-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.sanitized-content table th,
.sanitized-content table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.sanitized-content table th {
  background-color: #f4f4f4;
  font-weight: bold;
}
</style>