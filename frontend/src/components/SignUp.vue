<template>
  <div class="signup">
    <h1>Sign Up</h1>
    <form @submit.prevent="register">
      <div>
        <label for="firstname">First Name:</label>
        <input type="text" id="firstname" v-model="firstname" required />
      </div>
      <div>
        <label for="lastname">Last Name:</label>
        <input type="text" id="lastname" v-model="lastname" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">Sign Up</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "SignUp",
  data() {
    return {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      error: null,
      success: null,
    };
  },
  methods: {
    async register() {
      try {
        // Fetch CSRF token
        const csrfResponse = await axios.get("http://localhost:3000/auth/csrf-token", {
          withCredentials: true,
        });
        const csrfToken = csrfResponse.data.csrfToken;

        const payload = {
          firstname: this.firstname,
          lastname: this.lastname,
          email: this.email,
          password: this.password,
        };

        // Include CSRF token in the headers
        await axios.post("http://localhost:3000/user/register", payload, {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        });

        this.success = "Registration successful! Redirecting to login...";
        this.error = null;

        // Redirect to login page after a short delay
        setTimeout(() => {
          this.$router.push("/user/login");
        }, 2000);
      } catch (err) {
        console.error("Error during registration:", err);
        this.error = err.response?.data?.error || "Failed to register. Please try again.";
        this.success = null;
      }
    },
  },
};
</script>

<style scoped>
.signup {
  width: 500px;
  margin: 50px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.signup h1 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.signup form div {
  margin-bottom: 15px;
  text-align: left;
}

.signup label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.signup input {
  width: 470px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}

.signup input:focus {
  border-color: #42b983;
  outline: none;
  box-shadow: 0 0 5px rgba(66, 185, 131, 0.5);
}

.signup button {
  width: 100%;
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.signup button:hover {
  background-color: #369f6e;
}

.error {
  margin-top: 15px;
  color: red;
  font-weight: bold;
}

.success {
  margin-top: 15px;
  color: green;
  font-weight: bold;
}
</style>
