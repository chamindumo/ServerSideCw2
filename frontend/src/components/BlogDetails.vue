<template>
  <div class="blog-details">
    <div v-if="loading" class="loading">Loading blog details...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="blog-container">
      <!-- Blog Header with User Details -->
      <h1 class="blog-title">{{ blog.title }}</h1>

      <div class="blog-header">
        <img v-if="blog.posterImage" :src="blog.posterImage" alt="Poster Image" class="poster-image" />
        <div class="poster-details">
          <p class="poster-name"><strong></strong> {{ blog.posterName }}</p>
          <button v-if="!isFollowing" @click="followUser(blog.user_id)" class="follow-btn">
            <i class="fas fa-user-plus"></i> Follow
          </button>
          <p v-else class="followed-text">
            <i class="fas fa-check-circle"></i> Following
          </p>
        </div>
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
          <p><strong>Likes:</strong> {{ blog.likes }} | <strong>Dislikes:</strong> {{ blog.dislikes }}</p>
        </div>
        <div class="actions" v-if="isLoggedIn">
          <button @click="likeBlog" class="like-btn">
            <i class="fas fa-thumbs-up"></i> 
          </button>
          <button @click="dislikeBlog" class="dislike-btn">
            <i class="fas fa-thumbs-down"></i> 
          </button>
        </div>
        <p v-else class="login-prompt">Log in to like or dislike this post.</p>
      </div>
      <div class="comments-section">
        <h2>Comments</h2>
        <ul>
          <li v-for="comment in comments" :key="comment.id">
            <p><strong>{{ comment.username }}</strong> </p>
            <p>{{ comment.content }}</p>
          </li>
        </ul>
        <form v-if="isLoggedIn" @submit.prevent="addComment">
          <textarea v-model="newComment" placeholder="Add a comment..." required class="comment-textarea"></textarea>
          <button type="submit" class="btn btn-primary">Submit</button>
        </form>
        <p v-else class="login-prompt">Log in to add a comment.</p>
      </div>
      <div class="author-blogs" v-if="authorBlogs.length > 0">
        <h2>More Blogs by {{ blog.posterName }}</h2>
        <div class="blog-cards">
          <div v-for="authorBlog in authorBlogs" :key="authorBlog.id" class="blog-card">
  <a
    :href="$router.resolve({ name: 'BlogDetails', params: { id: authorBlog.id } }).href"
    @click.prevent="navigateToBlog(authorBlog.id)"
    class="blog-link"
  >
    <img :src="authorBlog.image_path || fallbackImage" alt="Blog Image" class="blog-thumbnail" />
    <h3>{{ authorBlog.title }}</h3>
    <p>
      <strong>
        <i class="fas fa-thumbs-up"></i> 
      </strong> {{ authorBlog.likes }} &nbsp;&nbsp;
      <strong>
        <i class="fas fa-thumbs-down"></i> 
      </strong> {{ authorBlog.dislikes }}
    </p>
    <p><strong>Posted on:</strong> {{ authorBlog.created_at }}</p>
    <p><strong>Country:</strong> {{ authorBlog.country }}</p>
  </a>
</div>
        </div>
      </div>
    </div>
    <button v-show="showBackToTop" @click="scrollToTop" class="btn back-to-top">
      <i class="fas fa-arrow-up"></i>
    </button>
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
      isLoggedIn: !!localStorage.getItem("userToken"),
      showBackToTop: false,
      authorBlogs: [],
      fallbackImage: "https://via.placeholder.com/300x200?text=No+Image",
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
      // Fetch other blogs by the same author
      const authorBlogsResponse = await api.get(`/blog/user/${this.blog.user_id}`);
      this.authorBlogs = authorBlogsResponse.data.filter((b) => b.id !== this.blog.id);
    } catch (err) {
      console.error("Error fetching blog details or comments:", err);
      this.error = "Failed to load blog details or comments. Please try again.";
    } finally {
      this.loading = false;
    }
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  computed: {
    sanitizedContent() {
      const sanitized = DOMPurify.sanitize(this.blog.content);
      return `<div class="sanitized-content">${sanitized}</div>`;
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
        const response = await api.post(`/comment/${this.id}`, { content: this.newComment }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });
        this.comments.push({
          id: response.data.comment.id,
          username: response.data.comment.username,
          content: this.newComment,
        });
        this.newComment = "";
      } catch (err) {
        console.error("Error adding comment:", err);
      }
    },
    handleScroll() {
      this.showBackToTop = window.scrollY > 300;
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    navigateToBlog(blogId) {
  this.$router.push({ name: "BlogDetails", params: { id: blogId } }).then(() => {
    window.location.reload(); // Refresh the page
  });
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
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}
.poster-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}
.poster-details {
  display: flex;
  align-items: center;
  gap: 10px;
}
.poster-name {
  margin: 0;
  font-size: 14px;
  color: #333;
}
.follow-btn,
.like-btn,
.dislike-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}
.follow-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
}
.follow-btn:hover {
  background-color: #369f6e;
}
.like-btn:hover {
  background-color: #34495e;
}
.dislike-btn:hover {
  background-color: #34495e;
}
.followed-text {
  color: #42b983;
  font-size: 12px;
  font-weight: bold;
}
.blog-title {
  font-size: 20px;
  font-weight: bold;
  margin-top: 10px;
  color: #333;
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
  margin-bottom: 20px;
}
.actions {
  margin-top: 10px;
  display: flex;
  gap: 20px;
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
.comment-textarea {
  width: 100%;
  max-width: 950px;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
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
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 10px 0;
  display: block;
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
.btn {
  padding: 10px 15px 10px 15px;
  padding-left: 10px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  color: rgb(238, 232, 232);
  gap: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background-color: rgb(18, 17, 17);

}

.btn-primary {
  background-color: #42b983;
}

.btn-primary:hover {
  background-color: #369f6e;
}

.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-to-top:hover {
  background-color: #369f6e;
}

.author-blogs {
  margin-top: 40px;
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.author-blogs h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.blog-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.blog-card {
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.blog-link {
  text-decoration: none;
  color: inherit;
}

.blog-thumbnail {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 10px;
}

.blog-card h3 {
  font-size: 16px;
  color: #2c3e50;
  margin: 10px 0;
  text-align: center;
}
</style>