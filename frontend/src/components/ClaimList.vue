<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">My Claims</h1>

    <button
      class="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      @click="$router.push('/new-claim')"
    >
      + New Claim
    </button>

    <table class="min-w-full border">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 border">Action</th>
          <th class="p-2 border">Date</th>
          <th class="p-2 border">Amount</th>
          <th class="p-2 border">Reason</th>
          <th class="p-2 border">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="claim in claims" :key="claim.id">
          <td class="p-2 border">
            <router-link
              :to="`/claims/${claim.id}`"
              class="text-blue-600 underline"
            >
              View Detail
            </router-link>
          </td>
          <td class="p-2 border">{{ formatDate(claim.created_at) }}</td>
          <td class="p-2 border">{{ claim.amount }}</td>
          <td class="p-2 border">{{ claim.reason }}</td>
          <td class="p-2 border">
            <span
              :class="{
                'text-green-600': claim.status === 'approved',
                'text-red-600': claim.status === 'rejected',
                'text-yellow-600': claim.status === 'pending',
              }"
            >
              {{ claim.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const claims = ref([]);

const fetchClaims = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/claims`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    claims.value = data;
  } catch (err) {
    console.error(err);
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) {
    return null;
  }
  new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(fetchClaims);
</script>
