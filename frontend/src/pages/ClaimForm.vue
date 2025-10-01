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
          <CFormSelect v-model="category" required>
            <option disabled value="" selected>-- Select Category --</option>
            <option v-for="c in categories" :key="c.id" :value="c.name">
              {{ c.name }}
            </option>
          </CFormSelect>
        </CInputGroup>

        <CInputGroup class="mb-3">
          <CInputGroupText>Receipt File</CInputGroupText>
          <CFormInput
            type="file"
            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
            @change="handleFile"
          />
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
import { ref, onMounted } from "vue";
import axios from "axios";

const categories = ref([]);
const file = ref(null);

const handleFile = (e) => {
  file.value = e.target.files[0];
};

const fetchCategories = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/categories`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    categories.value = data;
  } catch (err) {
    console.error("Failed to fetch categories", err);
  }
};

onMounted(fetchCategories);

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
    const formData = new FormData();
    formData.append("amount", amount.value);
    formData.append("description", description.value);
    formData.append("receipt_url", receipt_url.value);
    formData.append("category", category.value);
    if (file.value) formData.append("receipt_file", file.value);

    await axios.post(`${import.meta.env.VITE_API_URL}/api/claims`, formData, {
      headers: {
        Authorization: "Bearer " + props.token,
        "Content-Type": "multipart/form-data",
      },
    });

    msg.value = "Claim submitted successfully";
    amount.value = null;
    description.value = "";
    category.value = "";
    receipt_url.value = "";
    file.value = null;
    emit("submitted");
  } catch (err) {
    msg.value = err.response?.data?.error || "Submission failed";
  }
};

const close = () => {
  emit("close");
};
</script>
