<template>
  <div id="app">
    <nav class="navbar">
      <ul>
        <li><router-link to="/" class="nav-link">Home</router-link></li>
        <li><router-link to="/follow/feed" class="nav-link">Follow Feed</router-link></li>
        <li v-if="!isLoggedIn"><router-link to="/user/signup" class="nav-link">Sign Up</router-link></li>
        <li v-if="!isLoggedIn"><router-link to="/user/login" class="nav-link">Login</router-link></li>
        <li v-if="isLoggedIn"><router-link to="/blogs/add" class="nav-link">Add Blog</router-link></li>
        <li v-if="isLoggedIn" class="dropdown">
          <span class="nav-link">User</span>
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
      isLoggedIn: !!localStorage.getItem("userToken"), // Check if the user is logged in
    };
  },
  methods: {
    handleLoginSuccess() {
      this.isLoggedIn = true; // Update the login state
    },
    logout() {
      localStorage.removeItem("userToken"); // Remove the JWT token
      localStorage.removeItem("csrfToken"); // Remove the CSRF token
      this.isLoggedIn = false; // Update the login state
      this.$router.push("/"); // Redirect to the home page
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
</style>
