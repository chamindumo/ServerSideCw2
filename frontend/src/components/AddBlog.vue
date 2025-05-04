<template>
  <div class="add-blog">
    <h1>Add New Blog</h1>
    <form @submit.prevent="submitBlog">
      <div>
        <label for="title">Title:</label>
        <input type="text" id="title" v-model="title" required />
      </div>
      <div>
        <label for="content">Content:</label>
        <textarea id="content" v-model="content" required></textarea>
      </div>
      <div>
        <label for="country">Country:</label>
        <input type="text" id="country" v-model="country" required />
      </div>
      <div>
        <label for="visitDate">Visit Date:</label>
        <input type="date" id="visitDate" v-model="visitDate" required />
      </div>
      <button type="submit">Submit</button>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </form>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  name: "AddBlog",
  data() {
    return {
      title: "",
      content: "",
      country: "",
      visitDate: "",
      error: null,
      success: null,
    };
  },
  methods: {
    async submitBlog() {
      try {
        const token = localStorage.getItem("userToken"); // Retrieve JWT token
        const payload = {
          title: this.title,
          content: this.content,
          country: this.country,
          visitDate: this.visitDate,
        };

        await api.post("/blog", payload, {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT token
          },
        });

        this.success = "Blog added successfully!";
        this.error = null;
        this.resetForm();
      } catch (err) {
        console.error("Error adding blog:", err);
        this.error = err.response?.data?.error || "Failed to add blog. Please try again.";
        this.success = null;
      }
    },
    resetForm() {
      this.title = "";
      this.content = "";
      this.country = "";
      this.visitDate = "";
    },
  },
};
</script>

<style scoped>
.add-blog {
  max-width: 600px;
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
