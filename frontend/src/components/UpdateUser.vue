<template>
  <div class="form-container">
    <h1>Update User</h1>
    <form @submit.prevent="updateUser">
      <input v-model="updateUserData.id" placeholder="User ID" required />
      <input v-model="updateUserData.username" placeholder="New Username" />
      <select v-model="updateUserData.role">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <select v-model="updateUserData.plan">
        <option value="basic">Basic</option>
        <option value="pro">Pro</option>
        <option value="pro_plus">Pro Plus</option>
      </select>
      <button type="submit">Update</button>
      <button type="button" @click="cancel">Cancel</button>
    </form>
    <p v-if="response" class="response">{{ response }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UpdateUser",
  data() {
    return {
      updateUserData: {
        id: "",
        username: "",
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
    async updateUser() {
      try {
        await axios.put(
          `http://localhost:3000/admin/users/${this.updateUserData.id}`,
          {
            username: this.updateUserData.username,
            role: this.updateUserData.role,
            plan: this.updateUserData.plan,
          },
          {
            headers: {
              "Authorization": `Bearer ${this.token}`,
              "X-CSRF-Token": this.csrfToken,
            },
            withCredentials: true,
          }
        );
        this.response = "User updated successfully!";
      } catch (err) {
        console.error("Error updating user:", err);
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
