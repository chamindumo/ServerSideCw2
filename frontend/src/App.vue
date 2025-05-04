<template>
  <div id="app">
    <nav>
      <ul>
        <li><router-link to="/" class="button">Home</router-link></li>
        <li><router-link to="/user/login" class="button">User Login</router-link></li>
      </ul>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
nav ul {
  list-style: none;
  padding: 0;
  display: flex;
  justify-content: center;
  gap: 20px;
}
nav ul li {
  display: inline;
}
nav ul li .button {
  display: inline-block; /* Ensure the link behaves like a button */
  text-decoration: none;
  color: white;
  background-color: #42b983;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer; /* Add pointer cursor for better UX */
  transition: background-color 0.3s;
}
nav ul li .button:hover {
  background-color: #369f6b;
}
</style>
