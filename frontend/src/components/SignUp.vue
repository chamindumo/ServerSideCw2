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
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}
.error {
  color: red;
}
.success {
  color: green;
}
</style>
