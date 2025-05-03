<template>
  <div class="dashboard">
    <h1>User Dashboard</h1>
    <div class="user-details" v-if="userDetails"> <!-- Display user details if available -->
      <h3>Welcome, {{ userDetails.username }}!</h3>
      <p><strong>Plan:</strong> {{ userDetails.plan }}</p>
      <p><strong>Role:</strong> {{ userDetails.role }}</p>
      <p><strong>Created At:</strong> {{ userDetails.created_at }}</p>
    </div>
    <nav class="navbar">
      <ul>
        <!-- Navigation buttons -->
        <li><button @click="showUpdateProfileForm = true">Update Profile</button></li> <!-- Show update profile form -->
        <li><button @click="generateApiKey">Generate API Key</button></li> <!-- Generate API key -->
        <li><button @click="showCountryForm = true">Get Country Data</button></li> <!-- Show country data form -->
      </ul>
    </nav>

    <div v-if="showUpdateProfileForm" class="form-container">
      <!-- Update profile form -->
      <h3>Update Profile</h3>
      <form @submit.prevent="updateProfile">
        <input v-model="updateProfileData.username" placeholder="New Username" /> <!-- Bind new username -->
        <select v-model="updateProfileData.plan"> <!-- Bind new plan -->
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="pro_plus">Pro Plus</option>
        </select>
        <button type="submit">Update</button>
        <button type="button" @click="showUpdateProfileForm = false">Cancel</button>
      </form>
    </div>

    <div v-if="showCountryForm" class="form-container">
      <!-- Get country data form -->
      <h3>Get Country Data</h3>
      <form @submit.prevent="getCountryData">
        <input v-model="countryName" placeholder="Country Name" required /> <!-- Bind country name -->
        <button type="submit">Get Data</button>
        <button type="button" @click="showCountryForm = false">Cancel</button>
      </form>
    </div>

    <!-- Popup for entering API key -->
    <div v-if="showApiKeyPopup" class="popup">
      <div class="popup-content">
        <h3>Enter API Key</h3>
        <input v-model="manualApiKey" placeholder="Enter your API key" /> <!-- Bind manual API key -->
        <button @click="saveApiKey">Save</button> <!-- Save API key -->
        <button @click="closeApiKeyPopup">Cancel</button> <!-- Close popup -->
      </div>
    </div>

    <div v-if="response && Array.isArray(response)" class="table-container">
      <!-- Display API response as a table -->
      <h3>API Response</h3>
      <table>
        <thead>
          <tr>
            <th v-for="key in Object.keys(response[0])" :key="key">{{ key }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in response" :key="index">
            <td v-for="key in Object.keys(item)" :key="key">{{ item[key] }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="response && !Array.isArray(response)" class="response-container">
      <!-- Display API response as plain text -->
      <h3>API Response</h3>
      <pre>{{ response }}</pre>
    </div>
  </div>
</template>

<script>
import axios from "axios"; // Import Axios for HTTP requests

export default {
  name: "UserDashboard",
  data() {
    return {
      token: localStorage.getItem("userToken"), // JWT token
      csrfToken: null, // CSRF token
      apiKey: localStorage.getItem("userApiKey"), // User's API key
      manualApiKey: "", // For manually entering the API key
      showApiKeyPopup: false, // Controls the visibility of the API key popup
      userDetails: null, // User details
      response: null, // API response
      showUpdateProfileForm: false, // Controls the visibility of the update profile form
      showCountryForm: false, // Controls the visibility of the country data form
      updateProfileData: {
        username: "", // New username
        plan: "basic", // New plan
      },
      countryName: "", // Country name for fetching data
    };
  },
  async mounted() {
    if (!this.token) {
      alert("No JWT token found. Redirecting to login."); // Redirect if no token
      this.$router.push("/user/login");
      return;
    }

    try {
      const csrfResponse = await axios.get("http://localhost:3000/auth/csrf-token", {
        withCredentials: true, // Include cookies in the request
      });
      this.csrfToken = csrfResponse.data.csrfToken; // Store CSRF token

      // Fetch user details
      const userResponse = await this.callApi("/user/profile", "GET");
      this.userDetails = userResponse; // Store user details
    } catch (err) {
      console.error("Failed to fetch CSRF token or user details:", err);
      alert("Failed to fetch required data. Please try again."); // Show error message
    }
  },
  methods: {
    async callApi(endpoint, method, data = null) {
      // Generic method to call API endpoints
      try {
        const config = {
          method,
          url: `http://localhost:3000${endpoint}`, // API endpoint
          headers: {
            "Authorization": `Bearer ${this.token}`, // Include JWT token
            "X-CSRF-Token": this.csrfToken, // Include CSRF token
          },
          data, // Request body
          withCredentials: true, // Include cookies in the request
        };

        const apiResponse = await axios(config);
        return apiResponse.data; // Return API response
      } catch (err) {
        console.error("API call failed:", err);
        throw err.response ? err.response.data : "An error occurred."; // Throw error
      }
    },
    async updateProfile() {
      // Update user profile
      try {
        const response = await this.callApi("/user/profile", "PUT", this.updateProfileData);
        this.response = response; // Store response
        this.showUpdateProfileForm = false; // Hide update profile form
      } catch (err) {
        console.error("Error updating profile:", err);
        this.response = err; // Store error
      }
    },
    async generateApiKey() {
      // Generate a new API key
      try {
        const apiResponse = await this.callApi("/user/api-key", "POST");
        this.apiKey = apiResponse.api_key; // Store API key
        localStorage.setItem("userApiKey", this.apiKey); // Save API key in localStorage
        alert("API Key generated successfully!"); // Show success message
      } catch (err) {
        console.error("Error generating API key:", err);
        this.response = err; // Store error
      }
    },
    async getCountryData() {
      // Fetch country data
      if (!this.apiKey) {
        this.showApiKeyPopup = true; // Show popup if no API key
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/countries/${this.countryName}`,
          {
            headers: {
              "x-api-key": this.apiKey, // Include API key in headers
            },
          }
        );
        this.response = response.data; // Store response
      } catch (err) {
        console.error("Error fetching country data:", err);
        this.response = err.response ? err.response.data : "An error occurred."; // Store error
      }
    },
    saveApiKey() {
      // Save manually entered API key
      if (this.manualApiKey) {
        this.apiKey = this.manualApiKey; // Store API key
        localStorage.setItem("userApiKey", this.manualApiKey); // Save API key in localStorage
        this.showApiKeyPopup = false; // Hide popup
        alert("API Key saved successfully!"); // Show success message
      } else {
        alert("Please enter a valid API key."); // Show error message
      }
    },
    closeApiKeyPopup() {
      // Close API key popup
      this.showApiKeyPopup = false;
    },
  },
};
</script>

<style scoped>
.dashboard {
  max-width: 800px; /* Center the dashboard */
  margin: 0 auto;
  text-align: center;
}
.navbar ul {
  list-style: none; /* Remove bullet points */
  padding: 0;
  display: flex;
  justify-content: space-around; /* Space out navigation buttons */
  background-color: #42b983; /* Navbar background color */
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
  text-decoration: underline; /* Add underline on hover */
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
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
}
.popup-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}
</style>
