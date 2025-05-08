<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" placeholder="Enter your email" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" placeholder="Enter your password" required />
      </div>
      <button type="submit" class="btn">Login</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UserLogin",
  data() {
    return {
      email: "",
      password: "",
      error: null,
    };
  },
  methods: {
    async login() {
      try {
        // Clear existing storage and cookies, except for countries data
        const countriesData = localStorage.getItem("countries");
        localStorage.clear();
        if (countriesData) {
          localStorage.setItem("countries", countriesData);
        }
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
          "http://localhost:3000/user/login",
          {
            email: this.email,
            password: this.password,
          },
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );

        // Store user token in local storage
        localStorage.setItem("userToken", response.data.token);

        // Check if countries data is already in local storage
        if (!countriesData) {
          const countriesResponse = await axios.get("http://localhost:3000/countries", {
            headers: {
              "x-csrf-token": csrfToken,
            },
          });
          const countries = countriesResponse.data.map((country) => ({
            name: country.name.common,
          }));
          localStorage.setItem("countries", JSON.stringify(countries));
        }

        // Notify the parent component about the login state
        this.$emit("login-success");

        // Redirect to the dashboard or home page
        this.$router.push("/").catch((err) => {
          if (err.name !== "NavigationDuplicated") {
            console.error(err);
          }
        });
      } catch (err) {
        console.error("Error during login:", err);
        this.error = "Invalid credentials or server error. Please try again.";
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  width: 500px;
  margin: 50px auto;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-container h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #34495e;
}

.form-group input {
  width: 470px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.btn {
  width: 100%;
  padding: 10px;
  background-color: #108836;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.btn:hover {
  background-color: #34495e;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
