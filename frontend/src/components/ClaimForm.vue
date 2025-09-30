<template>
  <div>
    <h3>Submit Claim</h3>
    <form @submit.prevent="submit">
      <input
        v-model.number="amount"
        type="number"
        placeholder="Amount"
        required
      />
      <input v-model="receipt_url" placeholder="Receipt URL (optional)" />
      <textarea
        v-model="description"
        placeholder="Description"
        required
      ></textarea>
      <button type="submit">Submit</button>
    </form>
    <p v-if="msg" style="margin-top: 8px">{{ msg }}</p>
  </div>
</template>

<script>
import axios from "axios";
export default {
  props: ["token"],
  data() {
    return {
      amount: null,
      description: "",
      receipt_url: "",
      msg: null,
    };
  },
  methods: {
    async submit() {
      try {
        const payload = {
          amount: this.amount,
          description: this.description,
          receipt_url: this.receipt_url,
        };
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/claims`,
          payload,
          {
            headers: { Authorization: "Bearer " + this.token },
          }
        );
        this.msg = "Claim submitted successfully";
        this.amount = null;
        this.description = "";
        this.receipt_url = "";
        this.$emit("submitted");
      } catch (err) {
        this.msg = err.response?.data?.error || "Submission failed";
      }
    },
  },
};
</script>

<style scoped>
form input,
form textarea {
  display: block;
  margin-bottom: 8px;
  width: 100%;
  max-width: 400px;
}
button {
  padding: 6px 12px;
  background-color: #2c7be5;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
