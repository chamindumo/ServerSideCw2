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
        <div v-html="sanitizedContent"></div>
        <p><strong>User ID:</strong> {{ blog.user_id }}</p>
        <p><strong>Country:</strong> {{ blog.country }}</p>
        <p v-if="blog.flagUrl">
          <strong>Flag:</strong>
          <img :src="blog.flagUrl" alt="Country flag" class="country-flag" />
        </p>
        <p><strong>Visit Date:</strong> {{ blog.visitDate }}</p>
        <div class="likes-dislikes">
          <p><strong>Likes:</strong> {{ blog.likes }}</p>
          <p><strong>Dislikes:</strong> {{ blog.dislikes }}</p>
        </div>
        <div class="actions">
          <button @click="likeBlog" class="like-btn">Like</button>
          <button @click="dislikeBlog" class="dislike-btn">Dislike</button>
        </div>
      </div>

      <div class="comments-section">
        <h2>Comments</h2>
        <ul>
          <li v-for="comment in comments" :key="comment.id">
            <p><strong>{{ comment.username }}:</strong> {{ comment.content }}</p>
          </li>
        </ul>
        <form @submit.prevent="addComment">
          <textarea v-model="newComment" placeholder="Add a comment..." required></textarea>
          <button type="submit">Submit</button>
        </form>
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
    };
  },
  async mounted() {
    try {
      const response = await api.get(`/blog/${this.id}`);
      this.blog = {
        ...response.data,
        image_path: response.data.image_path ? `http://localhost:3000${response.data.image_path}` : null,
      };

      const commentsResponse = await api.get(`/comment/${this.id}`);
      this.comments = commentsResponse.data;

      const followResponse = await api.get(`/follow/${this.blog.user_id}/status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      this.isFollowing = followResponse.data.isFollowing;
    } catch (err) {
      console.error("Error fetching blog details or comments:", err);
      this.error = "Failed to load blog details or comments. Please try again.";
    } finally {
      this.loading = false;
    }
  },
  computed: {
    sanitizedContent() {
      return DOMPurify.sanitize(this.blog.content); // Sanitize HTML content
    },
  },
  methods: {
    async likeBlog() {
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
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.blog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.follow-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
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
}

.blog-image-container {
  text-align: center;
  margin-bottom: 20px;
}

.blog-image {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
}

.country-flag {
  width: 100px;
  height: auto;
  margin-top: 10px;
}

.likes-dislikes {
  display: flex;
  gap: 20px;
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
  margin-right: 10px;
}

.like-btn:hover {
  background-color: #34495e;
}

.dislike-btn:hover {
  background-color: #34495e;
}

.comments-section {
  margin-top: 30px;
}

.comments-section h2 {
  margin-bottom: 15px;
}

.comments-section ul {
  list-style: none;
  padding: 0;
}

.comments-section li {
  margin-bottom: 10px;
}

.comments-section textarea {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.comments-section button {
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.comments-section button:hover {
  background-color: #369f6e;
}

.error {
  color: red;
  text-align: center;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #2c3e50;
}
</style>
