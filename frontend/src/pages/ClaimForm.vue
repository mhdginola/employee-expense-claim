<template>
  <CModal :visible="visible" @close="close">
    <CModalHeader>
      <CModalTitle>Submit Claim</CModalTitle>
    </CModalHeader>

    <CModalBody>
      <CForm @submit.prevent="submit">
        <CInputGroup class="mb-3">
          <CInputGroupText>Amount</CInputGroupText>
          <CFormInput
            v-model.number="amount"
            type="number"
            placeholder="Amount"
            required
          />
        </CInputGroup>

        <CInputGroup class="mb-3">
          <CInputGroupText>Category</CInputGroupText>
          <CFormInput v-model="category" placeholder="Category (optional)" />
        </CInputGroup>

        <CInputGroup class="mb-3">
          <CInputGroupText>Receipt URL</CInputGroupText>
          <CFormInput
            v-model="receipt_url"
            placeholder="Receipt URL (optional)"
          />
        </CInputGroup>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <CFormTextarea
            v-model="description"
            placeholder="Description"
            required
          />
        </div>

        <CButton color="primary" type="submit">Submit</CButton>
      </CForm>

      <div v-if="msg" class="alert alert-info mt-3" role="alert">
        {{ msg }}
      </div>
    </CModalBody>

    <CModalFooter>
      <CButton color="secondary" @click="close">Close</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const props = defineProps({
  visible: { type: Boolean, default: false },
  token: { type: String, required: true },
});

const emit = defineEmits(["close", "submitted"]);

const amount = ref(null);
const description = ref("");
const category = ref("");
const receipt_url = ref("");
const msg = ref(null);

const submit = async () => {
  try {
    const payload = {
      amount: amount.value,
      description: description.value,
      receipt_url: receipt_url.value,
      category: category.value,
    };
    await axios.post(`${import.meta.env.VITE_API_URL}/api/claims`, payload, {
      headers: { Authorization: "Bearer " + props.token },
    });
    msg.value = "Claim submitted successfully";
    amount.value = null;
    description.value = "";
    category.value = "";
    receipt_url.value = "";
    emit("submitted");
  } catch (err) {
    msg.value = err.response?.data?.error || "Submission failed";
  }
};

const close = () => {
  emit("close");
};
</script>
