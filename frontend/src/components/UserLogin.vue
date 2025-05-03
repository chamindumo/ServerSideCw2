<template>
  <div class="login">
    <!-- User login form -->
    <h1>User Login</h1>
    <form @submit.prevent="login"> <!-- Prevent default form submission -->
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required /> <!-- Bind username input -->
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required /> <!-- Bind password input -->
      </div>
      <button type="submit">Login</button> <!-- Submit button -->
    </form>
    <p v-if="error" class="error">{{ error }}</p> <!-- Display error message if any -->
  </div>
</template>

<script>
import axios from "axios"; // Import Axios for HTTP requests

export default {
  name: "UserLogin",
  data() {
    return {
      username: "", // User's username
      password: "", // User's password
      error: null, // Error message
    };
  },
  methods: {
    async login() {
      try {
        // Clear all local storage, session storage, and cookies
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((cookie) => {
          const name = cookie.split("=")[0].trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        });

        // Fetch CSRF token
        const csrfResponse = await axios.get("http://localhost:3000/auth/csrf-token", {
          withCredentials: true, // Include cookies in the request
        });
        const csrfToken = csrfResponse.data.csrfToken;

        // Perform login
        const response = await axios.post(
          "http://localhost:3000/user/login",
          {
            username: this.username, // Send username
            password: this.password, // Send password
          },
          {
            headers: {
              "X-CSRF-Token": csrfToken, // Include CSRF token in headers
            },
            withCredentials: true, // Include cookies in the request
          }
        );

        localStorage.setItem("userToken", response.data.token); // Store JWT token in localStorage
        this.$router.push("/user/dashboard"); // Redirect to user dashboard
      } catch (err) {
        this.error = "Invalid credentials or server error. Please try again."; // Set error message
      }
    },
  },
};
</script>

<style scoped>
.login {
  max-width: 400px; /* Center the login form */
  margin: 0 auto;
  text-align: center;
}
.error {
  color: red; /* Style for error messages */
}
</style>
