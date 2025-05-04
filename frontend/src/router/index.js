import Vue from "vue";
import Router from "vue-router";
import UserLogin from "../components/UserLogin.vue";
import UserDashboard from "../components/UserDashboard.vue";
import BlogList from "../components/BlogList.vue";
import BlogDetails from "../components/BlogDetails.vue";
import FollowFeed from "../components/FollowFeed.vue";
import CommentSection from "../components/CommentSection.vue";

Vue.use(Router);

const routes = [
  { path: "/", name: "Home", component: BlogList }, // Set BlogList as the default route
  { path: "/user/login", name: "UserLogin", component: UserLogin },
  { path: "/user/dashboard", name: "UserDashboard", component: UserDashboard },
  { path: "/blogs", name: "BlogList", component: BlogList },
  { path: "/blogs/:id", name: "BlogDetails", component: BlogDetails, props: true },
  { path: "/follow/feed", name: "FollowFeed", component: FollowFeed },
  { path: "/comments/:postId", name: "CommentSection", component: CommentSection, props: true },
];

export default new Router({
  mode: "history",
  routes,
});