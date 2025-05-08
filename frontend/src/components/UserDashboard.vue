<template>
  <div class="dashboard">
    <h1 v-if="!editingPost">User Dashboard</h1>

    <!-- Profile Section -->
    <div v-if="!editingPost && !editingAccount" class="user-profile">
      <div v-if="!userDetails" class="loading">Loading your profile...</div>
      <div v-else>
        <img :src="'http://localhost:3000' + userDetails.image_path" alt="Profile" class="profile-image" />
        <h3><strong></strong> {{ userDetails.firstname }} {{ userDetails.lastname }}</h3>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">{{ posts.length }}</span>
            <span class="stat-label">posts</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.followers }}</span>
            <span class="stat-label">followers</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.likes }}</span>
            <span class="stat-label">likes</span>
          </div>
        </div>
        <button @click="editingAccount = true">Edit Account</button>
      </div>
    </div>

    <!-- Edit Account Form -->
    <div v-if="editingAccount" class="edit-post-form">
      <h2>Edit Account</h2>
      <form @submit.prevent="updateAccount">
        <div class="form-group">
          <label for="firstname">First Name:</label>
          <input type="text" id="firstname" v-model="editForm.firstname" required />
        </div>
        <div class="form-group">
          <label for="lastname">Last Name:</label>
          <input type="text" id="lastname" v-model="editForm.lastname" required />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="editForm.email" required />
        </div>
        <div class="form-group">
          <label for="password">Password (leave blank to keep current):</label>
          <input type="password" id="password" v-model="editForm.password" />
        </div>
        <div class="form-group">
          <label for="image">Profile Image:</label>
          <input type="file" id="image" @change="handleImageUpload" />
        </div>
        <div class="form-actions">

        <button type="submit"  class="btn save-btn">Save Changes</button>
        <button type="button" @click="cancelEdit" class="btn cancel-btn">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Tabs Section -->
    <div v-if="!editingPost && !editingAccount" class="tabs">
      <button :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">Your Posts</button>
      <button :class="{ active: activeTab === 'followers' }" @click="activeTab = 'followers'">Your Followers</button>
    </div>

    <!-- Posts Tab -->
    <div v-if="!editingPost && !editingAccount && activeTab === 'posts'" class="user-posts">
      <h2>Your Posts</h2>
      <div v-if="loadingPosts" class="loading">Loading your posts...</div>
      <div v-else-if="posts.length === 0" class="no-posts">You have not uploaded any posts yet.</div>
      <div v-else class="post-cards">
        <div v-for="post in posts" :key="post.id" class="post-card">
          <div class="post-image-container">
            <img
              v-if="post.image_path"
              :src= post.image_path
              alt="Blog Image"
              class="post-image"
            />
            <img
              v-else
              src="https://via.placeholder.com/300x200?text=No+Image"
              alt="No Image"
              class="post-image"
            />
          </div>
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-snippet">{{ stripHtml(post.content).slice(0, 100) }}...</p>
          <div class="post-actions">
            <router-link :to="{ name: 'BlogDetails', params: { id: post.id } }" class="view-btn">View</router-link>
            <button @click="deletePost(post.id)" class="delete-btn">Delete</button>
            <button @click="editPost(post)" class="edit-btn">Edit Inline</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Followers Tab -->
    <div v-if="!editingPost && !editingAccount && activeTab === 'followers'" class="user-followers">
      <h2>Your Followers</h2>
      <div v-if="loadingFollowers" class="loading">Loading your followers...</div>
      <div v-else-if="followers.length === 0" class="no-followers">You have no followers yet.</div>
      <div v-else class="follower-cards">
        <div v-for="follower in followers" :key="follower.id" class="follower-card">
          <img :src="'http://localhost:3000' + follower.image_path" alt="Profile" class="follower-image" />
          <h3>{{ follower.name }}</h3>
          <p>{{ follower.email }}</p>
          <button @click="unfollowUser(follower.id)" class="unfollow-btn">Unfollow</button>
        </div>
      </div>
    </div>

    <!-- Edit Post Form -->
    <div v-if="editingPost" class="edit-post-form">
      <h2>Edit Post</h2>
      <form @submit.prevent="submitEditPost">
        <div class="form-group">
          <label for="title">Title:</label>
          <input type="text" id="title" v-model="editForm.title" required />
        </div>
        <div class="form-group">
          <label for="content">Content:</label>
          <ckeditor :editor="editor" v-model="editForm.content" :config="editorConfig" />
        </div>
        <div class="form-group">
          <label for="country">Country:</label>
          <select id="country" v-model="editForm.country" required>
            <option value="" disabled>Select a country</option>
            <option v-for="country in countries" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="visitDate">Visit Date:</label>
          <input type="date" id="visitDate" v-model="editForm.visitDate" required />
        </div>
        <div class="form-group">
          <label for="image">Image:</label>
          <input type="file" id="image" @change="handleImageUpload" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn save-btn">Save Changes</button>
          <button type="button" @click="cancelEdit" class="btn cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import CKEditor from "@ckeditor/ckeditor5-vue2";

export default {
  name: "UserDashboard",
  components: {
    ckeditor: CKEditor.component,
  },
  data() {
    return {
      activeTab: "posts", // Track the active tab
      editor: ClassicEditor,
      editorConfig: {
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "link",
          "bulletedList",
          "numberedList",
          "|",
          "blockQuote",
          "undo",
          "redo",
        ],
      },
      token: localStorage.getItem("userToken"),
      csrfToken: null,
      userDetails: null,
      stats: { followers: 0, likes: 0 }, // Store followers and likes count
      posts: [],
      followers: [],
      loadingPosts: true,
      loadingFollowers: true,
      editingPost: false,
      editingAccount: false,
      editForm: {
        id: null,
        title: "",
        content: "",
        country: "",
        visitDate: "",
        image: null,
        firstname: "",
        lastname: "",
        email: "",
        password: "",
      },
      countries: [], // Store the list of countries
    };
  },
  async mounted() {
    if (!this.token) {
      alert("No JWT token found. Redirecting to login.");
      this.$router.push("/user/login");
      return;
    }
    

    try {
      const csrfResponse = await axios.get("http://localhost:3000/auth/csrf-token", {
        withCredentials: true,
      });
      this.csrfToken = csrfResponse.data.csrfToken;

      const userResponse = await this.callApi("/user/profile", "GET");
      this.userDetails = userResponse;
      console.log("User Details:", this.userDetails);

      // Load countries from local storage
      const storedCountries = JSON.parse(localStorage.getItem("countries")) || [];
      this.countries = storedCountries.map((country) => country.name); // Extract only country names

      await this.fetchUserStats(); // Fetch followers and likes count
      await this.fetchUserPosts();
      await this.fetchFollowers();
    } catch (err) {
      console.error("Failed to fetch CSRF token or user details:", err);
      alert("Failed to fetch required data. Please try again.");
    }
  },
  methods: {
    async callApi(endpoint, method, data = null) {
      try {
        const config = {
          method,
          url: `http://localhost:3000${endpoint}`,
          headers: {
            Authorization: `Bearer ${this.token}`,
            "X-CSRF-Token": this.csrfToken,
          },
          data,
          withCredentials: true,
        };

        const apiResponse = await axios(config);
        return apiResponse.data;
      } catch (err) {
        console.error("API call failed:", err);
        throw err.response ? err.response.data : "An error occurred.";
      }
    },
    async fetchUserStats() {
      try {
        const statsResponse = await this.callApi(`/user/${this.userDetails.id}/stats`, "GET");
        this.stats = statsResponse;
      } catch (err) {
        console.error("Error fetching user stats:", err);
        alert("Failed to fetch user stats. Please try again.");
      }
    },
    async fetchUserPosts() {
      try {
        const postresponse = await this.callApi(`/blog/user/${this.userDetails.id}`, "GET");
        this.posts = postresponse;
      } catch (err) {
        console.error("Error fetching user posts:", err);
      } finally {
        this.loadingPosts = false;
      }
    },
    async fetchFollowers() {
      try {
        const followersResponse = await this.callApi(`/follow/${this.userDetails.id}/followers`, "GET");
        this.followers = followersResponse;
      } catch (err) {
        console.error("Error fetching followers:", err);
      } finally {
        this.loadingFollowers = false;
      }
    },
    async deletePost(postId) {
      if (!confirm("Are you sure you want to delete this post?")) return;

      try {
        await this.callApi(`/blog/${postId}`, "DELETE");
        this.posts = this.posts.filter(post => post.id !== postId);
        alert("Post deleted successfully.");
      } catch (err) {
        console.error("Error deleting post:", err);
        alert("Failed to delete the post. Please try again.");
      }
    },
    async unfollowUser(followerId) {
      if (!confirm("Are you sure you want to unfollow this user?")) return;

      try {
        await this.callApi(`/follow/${followerId}/unfollow`, "DELETE");
        this.followers = this.followers.filter(follower => follower.id !== followerId);
        alert("User unfollowed successfully.");
      } catch (err) {
        console.error("Error unfollowing user:", err);
        alert("Failed to unfollow the user. Please try again.");
      }
    },
    editPost(post) {
      this.editingPost = true;
      this.editForm.id = post.id;
      this.editForm.title = post.title;
      this.editForm.content = post.content;
      this.editForm.country = post.country;
      this.editForm.visitDate = post.visitDate;
    },
    handleImageUpload(event) {
      this.editForm.image = event.target.files[0];
    },
    async submitEditPost() {
      const formData = new FormData();
      formData.append("title", this.editForm.title);
      formData.append("content", this.editForm.content);
      formData.append("country", this.editForm.country);
      formData.append("visitDate", this.editForm.visitDate);
      if (this.editForm.image) {
        formData.append("image", this.editForm.image);
      }

      try {
        await this.callApi(`/blog/${this.editForm.id}`, "PUT", formData);
        alert("Post updated successfully.");
        this.editingPost = false;
        await this.fetchUserPosts();
      } catch (err) {
        console.error("Error updating post:", err);
        alert("Failed to update the post. Please try again.");
      }
    },
    async updateAccount() {
      const formData = new FormData();
      formData.append("firstname", this.editForm.firstname);
      formData.append("lastname", this.editForm.lastname);
      formData.append("email", this.editForm.email);
      if (this.editForm.password) {
        formData.append("password", this.editForm.password);
      }
      if (this.editForm.image) {
        formData.append("image", this.editForm.image);
      }

      try {
        await this.callApi("/user/update", "PUT", formData);
        alert("Account updated successfully.");
        this.editingAccount = false;
        await this.fetchUserProfile();
      } catch (err) {
        console.error("Error updating account:", err);
        alert("Failed to update account. Please try again.");
      }
    },
    async fetchUserProfile() {
      const userResponse = await this.callApi("/user/profile", "GET");
      this.userDetails = userResponse;
    },
    cancelEdit() {
      this.editingPost = false;
      this.editingAccount = false;
      this.editForm = { id: null, title: "", content: "", country: "", visitDate: "", image: null, firstname: "", lastname: "", email: "", password: "" };
    },
    stripHtml(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },
  },
};
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 50px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: bold;
}

.user-profile {
  margin-bottom: 30px;
  text-align: middle;
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 700px;
}

.user-profile img.profile-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 15px;
}

.user-profile p {
  font-size: 1rem;
  color: #34495e;
  margin: 10px 0;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #000;
}

.stat-label {
  font-size: 1rem;
  color: #555;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.tabs button {
  padding: 10px 20px;
  margin: 0 5px;
  border: none;
  border-radius: 5px;
  background-color: #f4f4f4;
  cursor: pointer;
  font-size: 1rem;
}

.tabs button.active {
  background-color: #42b983;
  color: white;
}

.user-details {
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  text-align: left;
}

.user-details h3 {
  font-size: 1.8rem;
  color: #34495e;
  margin-bottom: 10px;
}

.user-details p {
  font-size: 1rem;
  color: #7f8c8d;
  margin: 5px 0;
}

.user-posts {
  margin-top: 30px;
}

h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: bold;
}

.post-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.post-card {
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: left;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.post-image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 10px;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.post-card h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.post-card p {
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 15px;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.view-btn,
.edit-btn,
.delete-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.view-btn {
  background-color: #3498db;
  color: white;
}

.edit-btn {
  background-color: #f1c40f;
  color: white;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.view-btn:hover {
  background-color: #2980b9;
  transform: scale(1.05);
}

.edit-btn:hover {
  background-color: #d4ac0d;
  transform: scale(1.05);
}

.delete-btn:hover {
  background-color: #c0392b;
  transform: scale(1.05);
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #2c3e50;
}

.no-posts {
  text-align: center;
  font-size: 1.2rem;
  color: #7f8c8d;
}

.user-followers {
  margin-top: 30px;
}

.follower-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.follower-card {
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
}

.follower-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 10px;
}

.unfollow-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.unfollow-btn:hover {
  background-color: #c0392b;
}

.edit-post-form {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.edit-post-form h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #34495e;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border: 1px solid #3498db;
  box-shadow: 0 0 5px #3498db;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background-color: #42b983;
  color: white;
}

.save-btn:hover {
  background-color: #369f6e;
}

.cancel-btn {
  background-color: #e74c3c;
  color: white;
}

.cancel-btn:hover {
  background-color: #c0392b;
}
</style>
