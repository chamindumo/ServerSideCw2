import Vue from 'vue';
import App from './App.vue'; // Main App component
import router from './router'; // Import the router

Vue.config.productionTip = false; // Disable production tip in console

new Vue({
  router, // Register the router
  render: h => h(App), // Render the App component
}).$mount('#app'); // Mount the app to the DOM element with id 'app'
