<template>
  <div class="dashboard">
    <h1>User Dashboard</h1>
    <div class="user-details" v-if="userDetails">
      <h3>Welcome, {{ userDetails.firstname }} {{ userDetails.lastname }}!</h3>
      <p><strong>Email:</strong> {{ userDetails.email }}</p>
      <p><strong>User Id:</strong> {{ userDetails.id }}</p>
      <p><strong>Created At:</strong> {{ userDetails.created_at }}</p>
    </div>
    

    <div class="user-posts">
      <h2>Your Posts</h2>

      <div v-if="loadingPosts" class="loading">Loading your posts...</div>
      <div v-else-if="posts.length === 0" class="no-posts">You have not uploaded any posts yet.</div>
      <div v-else class="post-cards">
        <div v-for="post in posts" :key="post.id" class="post-card">
          <img v-if="post.image_path" :src="post.image_path" alt="Blog" class="post-image" />
          <h3>{{ post.title }}</h3>
          <p>{{ post.content.slice(0, 100) }}...</p>
          <div class="post-actions">
            <router-link :to="{ name: 'BlogDetails', params: { id: post.id } }" class="view-btn">View</router-link>
            <button @click="deletePost(post.id)" class="delete-btn">Delete</button>
            <button @click="editPost(post)" class="edit-btn">Edit Inline</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="editingPost" class="edit-post-form">
      <h2>Edit Post</h2>
      <form @submit.prevent="submitEditPost">
        <div>
          <label for="title">Title:</label>
          <input type="text" id="title" v-model="editForm.title" required />
        </div>
        <div>
          <label for="content">Content:</label>
          <textarea id="content" v-model="editForm.content" required></textarea>
        </div>
        <div>
          <label for="country">Country:</label>
          <input type="text" id="country" v-model="editForm.country" required />
        </div>
        <div>
          <label for="visitDate">Visit Date:</label>
          <input type="date" id="visitDate" v-model="editForm.visitDate" required />
        </div>
        <div>
          <label for="image">Image:</label>
          <input type="file" id="image" @change="handleImageUpload" />
        </div>
        <button type="submit">Save Changes</button>
        <button type="button" @click="cancelEdit">Cancel</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UserDashboard",
  data() {
    return {
      token: localStorage.getItem("userToken"),
      csrfToken: null,
      userDetails: null,
      response: null,
      showCountryForm: false,
      countryName: "",
      posts: [],
      loadingPosts: true,
      editingPost: false,
      editForm: {
        id: null,
        title: "",
        content: "",
        country: "",
        visitDate: "",
        image: null,
      },
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

      await this.fetchUserPosts();
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
    cancelEdit() {
      this.editingPost = false;
      this.editForm = { id: null, title: "", content: "", country: "", visitDate: "", image: null };
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

.post-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 15px;
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

.edit-post-form {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.edit-post-form form div {
  margin-bottom: 15px;
}

.edit-post-form label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #34495e;
}

.edit-post-form input,
.edit-post-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.edit-post-form button {
  margin-right: 10px;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
}

.edit-post-form button[type="submit"] {
  background-color: #42b983;
  color: white;
}

.edit-post-form button[type="button"] {
  background-color: #e74c3c;
  color: white;
}

.edit-post-form button:hover {
  opacity: 0.9;
}
</style>
