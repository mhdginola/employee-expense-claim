<template>
  <CModal :visible="visible" @close="close">
    <CModalHeader>
      <CModalTitle>Claim Detail</CModalTitle>
    </CModalHeader>

    <CModalBody>
      <div v-if="claim">
        <p><strong>Employee:</strong> {{ claim.user_id }}</p>
        <p><strong>Amount:</strong> {{ claim.amount }}</p>
        <p><strong>Category:</strong> {{ claim.category }}</p>
        <p><strong>Reason:</strong> {{ claim.reason }}</p>
        <p><strong>Status:</strong> {{ claim.status }}</p>
        <p><strong>Created:</strong> {{ formatDate(claim.created_at) }}</p>
        <!-- Receipt file preview -->
        <div v-if="claim.receipt_file" class="mt-3">
          <strong>Receipt:</strong>
          <div>
            <a
              :href="`${baseUrl}${claim.receipt_file}`"
              target="_blank"
              class="btn btn-sm btn-outline-primary mt-2"
            >
              Download Receipt
            </a>
          </div>
        </div>
        <div
          v-if="isManager && claim.status === 'pending'"
          class="d-flex gap-2 mt-3"
        >
          <CButton color="success" @click="updateStatus('approve')">
            Approve
          </CButton>
          <CButton color="danger" @click="updateStatus('reject')">
            Reject
          </CButton>
        </div>
      </div>
      <div v-else>
        <CSpinner color="primary" />
        Loading...
      </div>
    </CModalBody>

    <CModalFooter>
      <CButton color="secondary" @click="close">Close</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, watch } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
// Props
const props = defineProps({
  visible: { type: Boolean, default: false },
  claimId: { type: Number, default: null },
  isManager: { type: Boolean, default: false },
});

// Emits
const emit = defineEmits(["close", "updated"]);

const claim = ref(null);
const baseUrl = import.meta.env.VITE_API_URL;

const fetchDetail = async () => {
  if (!props.claimId) return;
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/claims/${props.claimId}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    claim.value = data;
  } catch (e) {
    console.error(e);
  }
};

const updateStatus = async (status) => {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/claims/${props.claimId}/${status}`,
      { Comment: status },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    // sukses
    Swal.fire({
      icon: "success",
      title: "Success",
      text: `Claim has been ${status}d.`,
      timer: 2000,
      showConfirmButton: false,
    });

    emit("updated"); // trigger parent refresh
    close();
  } catch (err) {
    const statusCode = err.response?.status;
    let message = err.response?.data?.error || "Something went wrong";

    if (statusCode === 401 || statusCode === 403) {
      message = "Access denied. Please login again.";
    }

    Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
    });
  }
};

const close = () => {
  emit("close");
};

const formatDate = (d) => new Date(d).toLocaleString();

// reload setiap kali modal dibuka dengan claimId baru
watch(
  () => props.visible,
  (val) => {
    if (val) fetchDetail();
  }
);
</script>
