<template>
  <div id="app">
    <nav class="navbar">
      <div class="site-name">
        <router-link to="/" class="site-link">TravelTales</router-link>
      </div>
      <div class="search-container">
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
            <img :src="result.image_path || fallbackImage" alt="Post Image" class="result-image" />
            <span>{{ result.title }}</span>
          </li>
        </ul>
      </div>
      <ul class="nav-items">
        <li><router-link to="/" class="nav-link">Home</router-link></li>
        <li><router-link to="/follow/feed" class="nav-link">Follow Feed</router-link></li>
        <li v-if="!isLoggedIn"><router-link to="/user/signup" class="nav-link">Sign Up</router-link></li>
        <li v-if="!isLoggedIn"><router-link to="/user/login" class="nav-link">Login</router-link></li>
        <li v-if="isLoggedIn" class="profile-dropdown">
          <div class="profile-container">
            <img :src="userProfileImage || fallbackImage" alt="Profile" class="profile-image" />
          </div>
          <ul class="dropdown-menu">
            <li><router-link to="/user/dashboard" class="dropdown-item">Dashboard</router-link></li>
            <li><router-link to="/blogs/add" class="dropdown-item">Add Blog</router-link></li>
            <li><button @click="logout" class="dropdown-item">Logout</button></li>
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
      isLoggedIn: !!localStorage.getItem("userToken") && this.checkUserData(),
      searchQuery: "",
      searchResults: [],
      userProfileImage: localStorage.getItem("userProfileImage") || null,
      fallbackImage: "https://via.placeholder.com/50x50?text=No+Image",
    };
  },
  methods: {
    async fetchUserProfileImage() {
      try {
        const response = await fetch("http://localhost:3000/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });
        const user = await response.json();
        if (user.image_path) {
          this.userProfileImage = `http://localhost:3000${user.image_path}`;
          localStorage.setItem("userProfileImage", this.userProfileImage);
        } else {
          this.userProfileImage = this.fallbackImage;
        }
      } catch (err) {
        console.error("Error fetching user profile image:", err);
        this.userProfileImage = this.fallbackImage;
      }
    },
    checkUserData() {
      const userToken = localStorage.getItem("userToken");
      if (!userToken) {
        console.warn("No user token found. Login failed.");
        return false;
      }
      this.fetchUserProfileImage();
      return true;
    },
    handleLoginSuccess() {
      this.isLoggedIn = true;
      this.fetchUserProfileImage();
    },
    logout() {
      const countriesData = localStorage.getItem("countries");
      localStorage.clear();
      if (countriesData) {
        localStorage.setItem("countries", countriesData);
      }
      localStorage.removeItem("userToken");
      localStorage.removeItem("csrfToken");
      this.isLoggedIn = false;

      // Handle redundant navigation gracefully
      this.$router.push("/").catch((err) => {
        if (err.name !== "NavigationDuplicated") {
          console.error(err);
        }
      });
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
            : this.fallbackImage,
        }));
      } catch (err) {
        console.error("Error fetching search results:", err);
      }
    },
    redirectToPost(postId) {
      this.searchQuery = "";
      this.searchResults = [];
      this.$router.push({ name: "BlogDetails", params: { id: postId } });
      window.location.reload();

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
  background-color: #000000;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
  max-width: 100%;
  height: 60px;
}

.site-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.site-link {
  text-decoration: none;
  color: white;
}

.site-link:hover {
  color: #42b983;
}

.search-container {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  position: relative;
}

.search-input {
  width: 50%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

.dropdown-results {
  position: absolute;
  top: 100%;
  left: 25%;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  list-style: none;
  padding: 0;
  margin: 0;
  width: 50%;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  max-height: 300px;
  overflow-y: auto;
}

.nav-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 20px;
  align-items: center;
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
  background-color: #787070;
}

.profile-dropdown {
  position: relative;
}

.profile-container {
  background-color: white;
  padding: 5px;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}

.profile-dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  list-style: none;
  padding: 10px 0;
  margin: 0;
  z-index: 1000;
}

.dropdown-item {
  padding: 10px 20px;
  text-decoration: none;
  color: #000000;
  display: block;
}

.dropdown-item:hover {
  background-color: #ecf0f1;
}

.result-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 10px;
}

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
