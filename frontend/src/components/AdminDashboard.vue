<template>
  <div class="dashboard">
    <nav class="navbar">
      <ul>
        <li><button @click="callApi('/admin/users', 'GET')">Get All Users</button></li>
        <li><button @click="navigateTo('/admin/create-user')">Create User</button></li>
        <li><button @click="navigateTo('/admin/update-user')">Update User</button></li>
        <li><button @click="callApi('/admin/api-keys', 'GET')">Get All API Keys</button></li>
      </ul>
    </nav>

    <div v-if="response && Array.isArray(response)" class="table-container">
      <h3>API Response</h3>
      <table>
        <thead>
          <tr>
            <th v-for="key in Object.keys(response[0])" :key="key">{{ key }}</th>
            <th v-if="currentEndpoint === '/admin/users'">Actions</th> <!-- Show Actions column only for Get All Users -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in response" :key="index">
            <td v-for="key in Object.keys(item)" :key="key">{{ item[key] }}</td>
            <td v-if="currentEndpoint === '/admin/users'">
              <button @click="deleteUser(item.id)">Delete</button> <!-- Show Delete button only for Get All Users -->
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="response && !Array.isArray(response)" class="response-container">
      <h3>API Response</h3>
      <pre>{{ response }}</pre>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminDashboard",
  data() {
    return {
      token: localStorage.getItem("adminToken"),
      csrfToken: null,
      response: null,
      currentEndpoint: null, // Track the current API endpoint
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
    async callApi(endpoint, method, data = null) {
      try {
        this.currentEndpoint = endpoint; // Set the current endpoint
        const config = {
          method,
          url: `http://localhost:3000${endpoint}`,
          headers: {
            "Authorization": `Bearer ${this.token}`,
            "X-CSRF-Token": this.csrfToken,
          },
          data,
          withCredentials: true,
        };

        const apiResponse = await axios(config);
        this.response = apiResponse.data;
      } catch (err) {
        console.error("API call failed:", err);
        this.response = err.response ? err.response.data : "An error occurred.";
      }
    },
    navigateTo(path) {
      this.$router.push(path);
    },
    async deleteUser(userId) {
      // Delete user by ID and refresh the user list
      try {
        await axios.delete(`http://localhost:3000/admin/users/${userId}`, {
          headers: {
            "Authorization": `Bearer ${this.token}`,
            "X-CSRF-Token": this.csrfToken,
          },
          withCredentials: true,
        });
        alert("User deleted successfully!");
        this.callApi('/admin/users', 'GET'); // Refresh the user list
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user. Please try again.");
      }
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
.table-container {
  margin: 20px 0;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f4f4f4;
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
</style>
