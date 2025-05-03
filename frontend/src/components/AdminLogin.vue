<template>
  <div class="login">
    <h1>Admin Login</h1>
    <form @submit.prevent="login">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminLogin",
  data() {
    return {
      username: "",
      password: "",
      error: null,
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
          withCredentials: true,
        });
        const csrfToken = csrfResponse.data.csrfToken;

        // Perform login
        const response = await axios.post(
          "http://localhost:3000/admin/login",
          {
            username: this.username,
            password: this.password,
          },
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );

        const token = response.data.token;
        localStorage.setItem("adminToken", token);

        // Pass the token to the admin dashboard
        this.$router.push({ path: "/admin/dashboard", query: { token } });
      } catch (err) {
        this.error = "Invalid credentials or server error. Please try again.";
      }
    },
  },
};
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}
.error {
  color: red;
}
</style>
