<template>
  <div class="container my-4">
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">My Claims</h1>

      <CButton color="primary" class="mb-3" @click="showSubmit = true">
        + New Claim
      </CButton>

      <!-- Tabel -->
      <CTable bordered striped hover small responsive>
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell>Action</CTableHeaderCell>
            <CTableHeaderCell>Date</CTableHeaderCell>
            <CTableHeaderCell>Amount</CTableHeaderCell>
            <CTableHeaderCell>Reason</CTableHeaderCell>
            <CTableHeaderCell>Category</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="claim in paginatedClaims" :key="claim.id">
            <CTableDataCell>
              <CButton size="sm" color="info" @click="openDetail(claim.id)">
                Detail
              </CButton>
            </CTableDataCell>
            <CTableDataCell>{{ formatDate(claim.created_at) }}</CTableDataCell>
            <CTableDataCell>{{ formatNumber(claim.amount) }}</CTableDataCell>
            <CTableDataCell>{{ claim.reason }}</CTableDataCell>
            <CTableDataCell>{{ claim.category }}</CTableDataCell>
            <CTableDataCell>
              <span
                :class="{
                  'text-success': claim.status === 'approved',
                  'text-danger': claim.status === 'rejected',
                  'text-warning': claim.status === 'pending',
                }"
              >
                {{ claim.status }}
              </span>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <CPagination aria-label="Page navigation">
          <CPaginationItem :disabled="currentPage === 1" @click="goToPage(1)">
            First
          </CPaginationItem>
          <CPaginationItem
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            Prev
          </CPaginationItem>

          <CPaginationItem
            v-for="page in paginationPages"
            :key="page"
            :disabled="page === '...'"
            :active="page === currentPage"
            @click="page !== '...' && goToPage(page)"
            :class="{ 'fw-bold': page === currentPage }"
          >
            {{ page }}
          </CPaginationItem>

          <CPaginationItem
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            Next
          </CPaginationItem>
          <CPaginationItem
            :disabled="currentPage === totalPages"
            @click="goToPage(totalPages)"
          >
            Last
          </CPaginationItem>
        </CPagination>

        <div class="ms-3">
          <CFormLabel class="me-2">Rows per page:</CFormLabel>
          <CFormSelect v-model.number="perPage" class="d-inline-block w-auto">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
          </CFormSelect>
        </div>
      </div>
    </div>
  </div>
  <ClaimDetailModal
    :visible="showModal"
    :claimId="selectedClaimId"
    :isManager="true"
    @close="showModal = false"
    @updated="fetchClaims"
  />
  <ClaimSubmitModal
    :visible="showSubmit"
    :token="token"
    @close="showSubmit = false"
    @submitted="fetchClaims"
  />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import ClaimDetailModal from "@/pages/ClaimDetail.vue";
import ClaimSubmitModal from "@/pages/ClaimForm.vue";

const showSubmit = ref(false);
const claims = ref([]);
const showModal = ref(false);
const selectedClaimId = ref(null);
const token = ref(localStorage.getItem("token"));

const fetchClaims = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/claims`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: {
          page: currentPage.value,
          pageSize: perPage.value,
        },
      }
    );
    claims.value = data.data;
    totalPages.value = Math.ceil(data.total / perPage.value);
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

const openDetail = (id) => {
  selectedClaimId.value = id;
  showModal.value = true;
};

const currentPage = ref(1);
const perPage = ref(5);

const totalPages = ref(0);
const paginatedClaims = computed(() => claims.value);

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchClaims();
  }
};

// pagination numbers (e.g., 1 2 3 ... 10)
const paginationPages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i);
  } else {
    if (currentPage.value <= 3) {
      pages.push(1, 2, 3, "...", totalPages.value);
    } else if (currentPage.value >= totalPages.value - 2) {
      pages.push(
        1,
        "...",
        totalPages.value - 2,
        totalPages.value - 1,
        totalPages.value
      );
    } else {
      pages.push(1, "...", currentPage.value, "...", totalPages.value);
    }
  }
  return pages;
});

const formatNumber = (n) => new Intl.NumberFormat("id-ID").format(n);

onMounted(fetchClaims);
</script>
