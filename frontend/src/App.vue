<template>
  <div id="app">
    <nav class="navbar">
      <ul>
        <li><router-link to="/" class="nav-link">Home</router-link></li>
        <li><router-link to="/follow/feed" class="nav-link">Follow Feed</router-link></li>
        <li v-if="!isLoggedIn"><router-link to="/user/signup" class="nav-link">Sign Up</router-link></li>
        <li v-if="!isLoggedIn"><router-link to="/user/login" class="nav-link">Login</router-link></li>
        <li v-if="isLoggedIn" class="dropdown">
          <span class="nav-link">User</span>
          <ul class="dropdown-menu">
            <li><router-link to="/user/dashboard" class="dropdown-item">Dashboard</router-link></li>
            <li><router-link to="/blogs/add" class="dropdown-item">Add Blog</router-link></li>
            <li><button @click="logout" class="dropdown-item">Logout</button></li>
          </ul>
        </li>
        <li class="search-dropdown">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search posts..."
            @input="searchPosts"
            class="search-input"
          />
          <ul v-if="searchResults.length > 0" class="dropdown-results">
            <li
              v-for="result in searchResults"
              :key="result.id"
              @click="redirectToPost(result.id)"
              class="dropdown-item"
            >
              <img :src="result.image_path" alt="Post Image" class="result-image" />
              <span>{{ result.title }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
    <router-view @login-success="handleLoginSuccess" />
  </div>
</template>

<script>

export default {
  name: "App",
  data() {
    return {
      isLoggedIn: !!localStorage.getItem("userToken") && this.checkUserData(), // Check if user data exists
      searchQuery: "",
      searchResults: [],
    };
  },
  methods: {
    checkUserData() {
      // Add logic to verify if user data exists
      const userToken = localStorage.getItem("userToken");
      return !!userToken; // Return true if token exists, false otherwise
    },
    handleLoginSuccess() {
      this.isLoggedIn = true; // Update the login state
    },
    logout() {
      localStorage.removeItem("userToken"); // Remove the JWT token
      localStorage.removeItem("csrfToken"); // Remove the CSRF token
      this.isLoggedIn = false; // Update the login state
      this.$router.push("/"); // Redirect to the home page
    },
    async searchPosts() {
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        return;
      }
      try {
        const response = await fetch(`http://localhost:3000/blog/search?query=${this.searchQuery}`);
        const results = await response.json();
        this.searchResults = results.map(post => ({
          id: post.id,
          title: post.title,
          image_path: post.image_path
            ? `http://localhost:3000${post.image_path}`
            : "https://via.placeholder.com/50x50?text=No+Image",
        }));
      } catch (err) {
        console.error("Error fetching search results:", err);
      }
    },
    redirectToPost(postId) {
      this.searchQuery = ""; // Clear the search query
      this.searchResults = []; // Clear the search results
      this.$router.push({ name: "BlogDetails", params: { id: postId } }); // Navigate to the BlogDetails route
    },
  },
};
</script>

<style>
body {
  font-family: 'Helvetica, Arial, sans-serif';
  background-color: #f9f9f9;
  margin: 0;
  padding: 0;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  background-color: #2c3e50;
  padding: 10px 20px;
  display: flex;
  justify-content: center;
}

.navbar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 20px;
}

.navbar ul li {
  position: relative;
}

.navbar ul li .nav-link {
  text-decoration: none;
  color: white;
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.navbar ul li .nav-link:hover {
  background-color: #34495e;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  list-style: none;
  padding: 10px 0;
  margin: 0;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  padding: 10px 20px;
  text-decoration: none;
  color: #2c3e50;
  display: block;
}

.dropdown-item:hover {
  background-color: #ecf0f1;
}

.search-dropdown {
  position: relative;
}

.search-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}

.dropdown-results {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%; /* Full width of the input */
  z-index: 1000;
  display: flex;
  flex-direction: column; /* Ensure items are stacked vertically */
  max-height: 300px; /* Set a maximum height for the dropdown */
  overflow-y: auto; /* Enable vertical scrolling */
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid #ddd; /* Add a separator between items */
}

.dropdown-item:last-child {
  border-bottom: none; /* Remove the border for the last item */
}

.dropdown-item:hover {
  background-color: #f4f4f4;
}

.result-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 10px;
}

/* Add a custom scrollbar style */
.dropdown-results::-webkit-scrollbar {
  width: 8px;
}

.dropdown-results::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 5px;
}

.dropdown-results::-webkit-scrollbar-thumb:hover {
  background-color: #aaa;
}
</style>
