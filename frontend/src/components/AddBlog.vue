// filepath: c:\Users\janit\OneDrive\Desktop\ServerSideCw2\frontend\src\components\AddBlog.vue
<template>
  <div class="add-blog">
    <h1>Add New Blog</h1>
    <form @submit.prevent="submitBlog">
      <div class="form-group">
        <label for="title">Title:</label>
        <input type="text" id="title" v-model="title" required />
      </div>
      <div>
        <label for="content">Content:</label>
        <div id="editor"></div>
      </div>
      <div class="form-group">
        <label for="country">Country:</label>
        <select id="country" v-model="selectedCountry" required>
          <option value="" disabled>Select a country</option>
          <option v-for="country in countries" :key="country.name" :value="country.name">
            {{ country.name }}
          </option>
        </select>
      </div>
    
      <div class="form-group">
        <label for="visitDate">Visit Date:</label>
        <input type="date" id="visitDate" v-model="visitDate" required />
      </div>
      <div class="form-group">
        <label for="image">Image:</label>
        <input type="file" id="image" @change="handleImageUpload" accept="image/*" />
      </div>
      <button type="submit" class="submit-btn">Submit</button>
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
      content: "",
      countries: [], // Store the list of countries
      selectedCountry: "", // Selected country name
      visitDate: "",
      image: null,
      error: null,
      success: null,
      editorInstance: null,
    };
  },
  mounted() {
    ClassicEditor.create(document.querySelector("#editor"), {
      toolbar: [
        "bold",
        "italic",
        "underline",
        "link",
        "imageUpload",
        "bulletedList",
        "numberedList",
        "blockQuote",
      ],
    })
      .then((editor) => {
        this.editorInstance = editor;
      })
      .catch((error) => {
        console.error("Error initializing CKEditor:", error);
      });

    // Load countries from local storage
    const storedCountries = JSON.parse(localStorage.getItem("countries")) || [];
    this.countries = storedCountries;
  },
  watch: {
    selectedCountry(newCountry) {
      // Update selected country details when a new country is selected
      this.selectedCountryDetails = this.countries.find(
        (country) => country.name === newCountry
      );
    },
  },
  beforeDestroy() {
    if (this.editorInstance) {
      this.editorInstance.destroy();
    }
  },
  methods: {
    handleImageUpload(event) {
      this.image = event.target.files[0];
    },
    async submitBlog() {
      try {
        const token = localStorage.getItem("userToken");
        const formData = new FormData();
        formData.append("title", this.title);
        formData.append("content", this.editorInstance.getData());
        formData.append("country", this.selectedCountry);
        formData.append("visitDate", this.visitDate);
        if (this.image) {
          formData.append("image", this.image);
        }

        await api.post("/blog", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        this.success = "Blog added successfully!";
        this.error = null;
        this.resetForm();
      } catch (err) {
        console.error("Error adding blog:", err);
        this.error = "Failed to add blog. Please try again.";
        this.success = null;
      }
    },
    resetForm() {
      this.title = "";
      this.content = "";
      this.selectedCountry = "";
      this.visitDate = "";
      this.image = null;
      if (this.editorInstance) {
        this.editorInstance.setData("");
      }
    },
  },
};
</script>

<style scoped>
.add-blog {
  width: 900px;
  margin: 50px auto;
  padding: 20px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #34495e;
}

input[type="text"],
input[type="date"],
input[type="file"],
select {
  width: 97.5%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

#editor {
  border: 1px solid #ccc;
  border-radius: 5px;
  min-height: 200px;
  padding: 10px;
  font-size: 1rem;
  font-family: Arial, sans-serif;
  background-color: #f9f9f9;
}

.submit-btn {
  background-color: #42b983;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #369f6e;
}

.error {
  color: red;
  font-weight: bold;
}

.success {
  color: green;
  font-weight: bold;
}

.country-details {
  margin-top: 20px;
  text-align: left;
}

.country-flag {
  width: 100px;
  height: auto;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>