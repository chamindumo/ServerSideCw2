import Vue from "vue";
import Router from "vue-router";
import AdminLogin from "../components/AdminLogin.vue"; // Admin login page
import UserLogin from "../components/UserLogin.vue"; // User login page
import AdminDashboard from "../components/AdminDashboard.vue"; // Admin dashboard
import CreateUser from "../components/CreateUser.vue"; // Create user page
import UpdateUser from "../components/UpdateUser.vue"; // Update user page
import UserDashboard from "../components/UserDashboard.vue"; // User dashboard

Vue.use(Router); // Enable Vue Router

const routes = [
  { path: "/admin/login", name: "AdminLogin", component: AdminLogin }, // Route for admin login
  { path: "/user/login", name: "UserLogin", component: UserLogin }, // Route for user login
  { path: "/admin/dashboard", name: "AdminDashboard", component: AdminDashboard }, // Route for admin dashboard
  { path: "/admin/create-user", name: "CreateUser", component: CreateUser }, // Route for creating a user
  { path: "/admin/update-user", name: "UpdateUser", component: UpdateUser }, // Route for updating a user
  { path: "/user/dashboard", name: "UserDashboard", component: UserDashboard }, // Route for user dashboard
];

export default new Router({
  mode: "history", // Use history mode for clean URLs
  routes, // Register routes
});