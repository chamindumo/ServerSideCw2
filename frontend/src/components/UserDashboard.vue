<template>
  <div class="dashboard">
    <h1>User Dashboard</h1>
    <div class="user-details" v-if="userDetails">
      <h3>Welcome, {{ userDetails.firstname }} {{ userDetails.lastname }}!</h3>
      <p><strong>Email:</strong> {{ userDetails.email }}</p>
      <p><strong>Created At:</strong> {{ userDetails.created_at }}</p>
    </div>
    <nav class="navbar">
      <ul>
        <li><button @click="showCountryForm = true">Get Country Data</button></li>
      </ul>
    </nav>

    <div v-if="showCountryForm" class="form-container">
      <h3>Get Country Data</h3>
      <form @submit.prevent="getCountryData">
        <input v-model="countryName" placeholder="Country Name" required />
        <button type="submit">Get Data</button>
        <button type="button" @click="showCountryForm = false">Cancel</button>
      </form>
    </div>

    <div v-if="response" class="response-container">
      <h3>API Response</h3>
      <pre>{{ response }}</pre>
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
    async getCountryData() {
      try {
        const response = await this.callApi(`/countries/${this.countryName}`, "GET");
        this.response = response;
      } catch (err) {
        console.error("Error fetching country data:", err);
        this.response = err.response ? err.response.data : "An error occurred.";
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
</style>
