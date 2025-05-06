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
          <h3>{{ post.title }}</h3>
          <p>{{ post.content.slice(0, 100) }}...</p>
          <div class="post-actions">
            <router-link :to="{ name: 'BlogDetails', params: { id: post.id } }" class="view-btn">View</router-link>
            <router-link :to="{ name: 'EditBlog', params: { id: post.id } }" class="edit-btn">Edit</router-link>
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
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}
.navbar ul {
  list-style: none;
  padding: 0;
  display: flex;
  justify-content: space-around;
  background-color: #42b983;
  padding: 10px;
  border-radius: 5px;
}
.navbar ul li {
  display: inline;
}
.navbar ul li button {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
}
.navbar ul li button:hover {
  text-decoration: underline;
}
.form-container {
  margin: 20px 0;
}
.response-container {
  margin: 20px 0;
  text-align: left;
}
pre {
  background: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}
.user-posts {
  margin-top: 30px;
}
.post-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
.post-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: left;
}
.post-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
.view-btn,
.edit-btn,
.delete-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  color: white;
}
.view-btn {
  background-color: #3498db;
}
.edit-btn {
  background-color: #f1c40f;
}
.delete-btn {
  background-color: #e74c3c;
}
.view-btn:hover {
  background-color: #2980b9;
}
.edit-btn:hover {
  background-color: #d4ac0d;
}
.delete-btn:hover {
  background-color: #c0392b;
}
.loading {
  text-align: center;
  font-size: 18px;
  color: #2c3e50;
}
.no-posts {
  text-align: center;
  font-size: 16px;
  color: #7f8c8d;
}
.edit-post-form {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
}
.edit-post-form form div {
  margin-bottom: 15px;
}
.edit-post-form label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}
.edit-post-form input,
.edit-post-form textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.edit-post-form button {
  margin-right: 10px;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
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
