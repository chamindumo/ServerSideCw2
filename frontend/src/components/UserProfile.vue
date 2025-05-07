<template>
  <div class="user-profile">
    <div v-if="loading" class="loading">Loading profile...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <img :src="'http://localhost:3000' + user.image_path" alt="Profile Image" class="profile-image" />
      <h1>{{ user.firstname }} {{ user.lastname }}</h1>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <div class="stats">
        <p><strong>Followers:</strong> {{ stats.followers }}</p>
        <p><strong>Likes:</strong> {{ stats.likes }}</p>
      </div>
      <h2>User's Posts</h2>
      <div v-if="posts.length === 0" class="no-posts">This user has not uploaded any posts yet.</div>
      <div v-else class="post-cards">
        <div v-for="post in posts" :key="post.id" class="post-card">
          <img v-if="post.image_path" :src="post.image_path" alt="Post Image" class="post-image" />
          <h3>{{ post.title }}</h3>
          <p>{{ stripHtml(post.content).slice(0, 100) }}...</p>
          <router-link :to="{ name: 'BlogDetails', params: { id: post.id } }" class="view-btn">View Post</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UserProfile",
  props: ["id"],
  data() {
    return {
      user: null,
      stats: { followers: 0, likes: 0 },
      posts: [],
      loading: true,
      error: null,
    };
  },
  async mounted() {
    try {
      const userResponse = await axios.get(`http://localhost:3000/user/${this.id}`);
      this.user = userResponse.data;

      const statsResponse = await axios.get(`http://localhost:3000/user/${this.id}/stats`);
      this.stats = statsResponse.data;

      const postsResponse = await axios.get(`http://localhost:3000/blog/user/${this.id}`);
      this.posts = postsResponse.data;
    } catch (err) {
      console.error("Error loading user profile:", err);
      this.error = "Failed to load user profile. Please try again.";
    } finally {
      this.loading = false;
    }
  },
  methods: {
    stripHtml(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },
  },
};
</script>

<style scoped>
.user-profile {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.profile-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 20px;
}

.stats {
  margin: 20px 0;
}

.post-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.post-card {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.post-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 10px;
}

.view-btn {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}

.view-btn:hover {
  background-color: #369f6e;
}

.loading,
.error,
.no-posts {
  font-size: 16px;
  color: #2c3e50;
  margin-top: 20px;
}
</style>
