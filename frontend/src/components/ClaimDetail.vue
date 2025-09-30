<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Claim Detail</h1>

    <div v-if="claim">
      <p><strong>Employee:</strong> {{ claim.user_id }}</p>
      <p><strong>Amount:</strong> {{ claim.amount }}</p>
      <p><strong>Reason:</strong> {{ claim.reason }}</p>
      <p><strong>Status:</strong> {{ claim.status }}</p>
      <p><strong>Created:</strong> {{ formatDate(claim.created_at) }}</p>

      <div
        v-if="isManager && claim.status === 'pending'"
        class="mt-4 space-x-2"
      >
        <button
          class="bg-green-600 text-white px-3 py-1 rounded"
          @click="updateStatus('approve')"
        >
          Approve
        </button>
        <button
          class="bg-red-600 text-white px-3 py-1 rounded"
          @click="updateStatus('reject')"
        >
          Reject
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const claim = ref(null);
const isManager = ref(true); // sesuaikan dengan role user login

const fetchDetail = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/claims/${route.params.id}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  claim.value = data;
};

const updateStatus = async (status) => {
  await axios.post(
    `${import.meta.env.VITE_API_URL}/api/claims/${route.params.id}/${status}`,
    { Comment: status },
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  router.push("/approvals");
};

const formatDate = (d) => new Date(d).toLocaleString();
onMounted(fetchDetail);
</script>
