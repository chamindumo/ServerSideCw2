// filepath: c:\Users\janit\OneDrive\Desktop\ServerSideCw2\frontend\src\components\AddBlog.vue
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
        <div id="editor"></div>
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
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import api from "../services/api";

export default {
  name: "AddBlog",
  data() {
    return {
      title: "",
      content: "", // Ensure this holds the HTML content from the editor
      country: "",
      visitDate: "",
      image: null, // Store the uploaded image
      error: null,
      success: null,
      editorInstance: null,
    };
  },
  mounted() {
    // Initialize CKEditor
    ClassicEditor.create(document.querySelector("#editor"), {
      toolbar: [
        "bold", "italic", "underline", "link", "imageUpload", "bulletedList", "numberedList", "blockQuote",
      ],
    })
      .then(editor => {
        this.editorInstance = editor;
      })
      .catch(error => {
        console.error("Error initializing CKEditor:", error);
      });
  },
  beforeDestroy() {
    // Destroy CKEditor instance
    if (this.editorInstance) {
      this.editorInstance.destroy();
    }
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
        formData.append("content", this.editorInstance.getData()); // Get HTML content from CKEditor
        formData.append("country", this.country);
        formData.append("visitDate", this.visitDate);
        if (this.image) {
          formData.append("image", this.image); // Append the image file
        } else {
          console.warn("No image selected for upload."); // Log a warning if no image is selected
        }

        const response = await api.post("/blog", formData, {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT token
            "Content-Type": "multipart/form-data", // Set content type for file upload
          },
        });

        this.success = "Blog added successfully!";
        this.error = null;
        console.log("Response from server:", response.data); // Log the server response
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
      if (this.editorInstance) {
        this.editorInstance.setData(""); // Reset CKEditor content
      }
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
#editor {
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  min-height: 200px;
}
.error {
  color: red;
}
.success {
  color: green;
}
</style>