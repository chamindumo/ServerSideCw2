<template>
  <div class="form-container">
    <h1>Create New User</h1>
    <form @submit.prevent="createUser">
      <input v-model="newUser.username" placeholder="Username" required />
      <input v-model="newUser.password" type="password" placeholder="Password" required />
      <select v-model="newUser.role">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <select v-model="newUser.plan">
        <option value="basic">Basic</option>
        <option value="pro">Pro</option>
        <option value="pro_plus">Pro Plus</option>
      </select>
      <button type="submit">Create</button>
      <button type="button" @click="cancel">Cancel</button>
    </form>
    <p v-if="response" class="response">{{ response }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CreateUser",
  data() {
    return {
      newUser: {
        username: "",
        password: "",
        role: "user",
        plan: "basic",
      },
      response: null,
      csrfToken: null,
      token: localStorage.getItem("adminToken"),
    };
  },
  async mounted() {
    if (!this.token) {
      alert("No JWT token found. Redirecting to login.");
      this.$router.push("/admin/login");
      return;
    }

    try {
      const csrfResponse = await axios.get("http://localhost:3000/auth/csrf-token", {
        withCredentials: true,
      });
      this.csrfToken = csrfResponse.data.csrfToken;
    } catch (err) {
      console.error("Failed to fetch CSRF token:", err);
      alert("Failed to fetch CSRF token. Please try again.");
    }
  },
  methods: {
    async createUser() {
      try {
        await axios.post(
          "http://localhost:3000/admin/users",
          this.newUser,
          {
            headers: {
              "Authorization": `Bearer ${this.token}`,
              "X-CSRF-Token": this.csrfToken,
            },
            withCredentials: true,
          }
        );
        this.response = "User created successfully!";
      } catch (err) {
        console.error("Error creating user:", err);
        this.response = err.response ? err.response.data : "An error occurred.";
      }
    },
    cancel() {
      this.$router.push("/admin/dashboard");
    },
  },
};
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}
.response {
  color: green;
  margin-top: 10px;
}
</style>
