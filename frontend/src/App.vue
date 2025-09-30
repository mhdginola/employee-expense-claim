<template>
  <div class="p-4">
    <h1>Medical Claim App</h1>
    <Login v-if="!token" @login="onLogin" />
    <div v-else>
      <p>
        Hi, {{ user.full_name }} ({{ user.role }})
        <button @click="logout">Logout</button>
      </p>
      <ClaimForm
        v-if="user.role === 'employee'"
        :token="token"
        @submitted="reload"
      />
      <ClaimList :token="token" :role="user.role" />
      <router-view />
    </div>
  </div>
</template>

<script>
import Login from "./components/Login.vue";
import ClaimForm from "./components/ClaimForm.vue";
import ClaimList from "./components/ClaimList.vue";

export default {
  components: { Login, ClaimForm, ClaimList },
  data() {
    return {
      token: localStorage.getItem("token") || null,
      user: JSON.parse(localStorage.getItem("user") || "null"),
    };
  },
  methods: {
    onLogin({ token, user }) {
      this.token = token;
      this.user = user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.token = null;
      this.user = null;
    },
    reload() {
      // noop or force refresh
      this.$forceUpdate();
    },
  },
};
</script>
