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
      <div>
        <label for="image">Image:</label>
        <input type="file" id="image" @change="handleImageUpload" accept="image/*" />
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
      image: null, // Store the uploaded image
      error: null,
      success: null,
    };
  },
  methods: {
    handleImageUpload(event) {
      this.image = event.target.files[0]; // Store the selected file
    },
    async submitBlog() {
      try {
        const token = localStorage.getItem("userToken"); // Retrieve JWT token
        const formData = new FormData();
        formData.append("title", this.title);
        formData.append("content", this.content);
        formData.append("country", this.country);
        formData.append("visitDate", this.visitDate);
        if (this.image) {
          formData.append("image", this.image); // Append the image file
        }

        await api.post("/blog", formData, {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT token
            "Content-Type": "multipart/form-data", // Set content type for file upload
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
      this.image = null;
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
