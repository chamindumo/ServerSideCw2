<template>
  <div class="follow-feed">
    <h1>Followed Users' Posts</h1>
    <ul>
      <li v-for="post in posts" :key="post.id">
        <router-link :to="{ name: 'BlogDetails', params: { id: post.id } }">
          {{ post.title }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  name: "FollowFeed",
  data() {
    return {
      posts: [],
    };
  },
  async mounted() {
    try {
      const response = await api.get("/follow/feed");
      this.posts = response.data;
    } catch (err) {
      console.error("Error fetching followed posts:", err);
    }
  },
};
</script>

<style scoped>
.follow-feed {
  max-width: 800px;
  margin: 0 auto;
}
</style>
