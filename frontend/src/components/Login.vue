<template>
  <div
    class="container d-flex align-items-center justify-content-center min-vh-100"
  >
    <div class="card shadow p-4" style="max-width: 400px; width: 100%">
      <h2 class="text-center mb-4">Login</h2>
      <form @submit.prevent="submit">
        <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input
            v-model="username"
            type="text"
            id="username"
            class="form-control"
            placeholder="Enter username"
            required
          />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="form-control"
            placeholder="Enter password"
            required
          />
        </div>

        <button class="btn btn-primary w-100" type="submit">Login</button>
      </form>

      <div v-if="error" class="alert alert-danger mt-3" role="alert">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      username: "",
      password: "",
      error: null,
    };
  },
  methods: {
    async submit() {
      try {
        const res = await axios.post(
          import.meta.env.VITE_API_URL + "/api/auth/login",
          { username: this.username, password: this.password }
        );
        this.$emit("login", res.data);
      } catch (err) {
        this.error = err.response?.data?.error || "Login failed";
      }
    },
  },
};
</script>
