import Vue from "vue";
import Router from "vue-router";
import UserLogin from "../components/UserLogin.vue";
import UserDashboard from "../components/UserDashboard.vue";
import BlogList from "../components/BlogList.vue";
import BlogDetails from "../components/BlogDetails.vue";
import FollowFeed from "../components/FollowFeed.vue";
import CommentSection from "../components/CommentSection.vue";
import SignUp from "../components/SignUp.vue"; // Import SignUp component
import AddBlog from "../components/AddBlog.vue"; // Import AddBlog component
import UserProfile from "../components/UserProfile.vue"; // Import UserProfile component

Vue.use(Router);

const routes = [
  { path: "/", name: "Home", component: BlogList }, // Set BlogList as the default route
  { path: "/user/login", name: "UserLogin", component: UserLogin },
  { path: "/user/signup", name: "SignUp", component: SignUp },
  { path: "/user/dashboard", name: "UserDashboard", component: UserDashboard },
  { path: "/blogs", name: "BlogList", component: BlogList },
  { path: "/blogs/add", name: "AddBlog", component: AddBlog }, // Ensure this route is correctly defined
  { path: "/blogs/:id", name: "BlogDetails", component: BlogDetails, props: true }, // BlogDetails route
  { path: "/follow/feed", name: "FollowFeed", component: FollowFeed },
  { path: "/comments/:postId", name: "CommentSection", component: CommentSection, props: true },
  { path: "/user/:id", name: "UserProfile", component: UserProfile, props: true }, // UserProfile route
];

export default new Router({
  mode: "history",
  routes,
});