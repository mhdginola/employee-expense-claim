<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Claims by Status -->
    <div class="container my-4">
      <h1 class="text-2xl font-bold mb-4">Expense Dashboard</h1>

      <!-- 2 Charts side by side -->
      <div class="row g-4">
        <!-- Bootstrap/CoreUI spacing class -->
        <div class="col-md-6">
          <CCard class="h-100">
            <CCardHeader>
              <div>Claims by Status</div>
              <small class="text-medium-emphasis">Distribution of claims</small>
            </CCardHeader>
            <CCardBody class="d-flex justify-content-center">
              <div style="width: 280px; height: 280px">
                <DoughnutChart :data="statusData" :options="chartOptions" />
              </div>
            </CCardBody>
          </CCard>
        </div>

        <div class="col-md-6">
          <CCard class="h-100">
            <CCardHeader>
              <div>Expenses by Category</div>
              <small class="text-medium-emphasis">Current year totals</small>
            </CCardHeader>
            <CCardBody class="d-flex justify-content-center">
              <div style="width: 280px; height: 280px">
                <DoughnutChart :data="categoryData" :options="chartOptions" />
              </div>
            </CCardBody>
          </CCard>
        </div>
      </div>

      <!-- Bar Chart -->
      <CCard class="mt-4">
        <CCardHeader>
          <div>Total Amount per Month</div>
          <small class="text-medium-emphasis">Current year</small>
        </CCardHeader>
        <CCardBody>
          <div style="height: 300px">
            <BarChart :data="monthlyData" :options="barOptions" />
          </div>
        </CCardBody>
      </CCard>

      <CCard class="mt-4">
        <CCardHeader>
          <strong>Manager Approval Queue</strong>
          <div class="text-medium-emphasis small">
            Pending claims awaiting your approval
          </div>
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">Claim</CTableHeaderCell>
                <CTableHeaderCell scope="col">Employee</CTableHeaderCell>
                <CTableHeaderCell scope="col">Category</CTableHeaderCell>
                <CTableHeaderCell scope="col">Amount</CTableHeaderCell>
                <CTableHeaderCell scope="col">Submitted</CTableHeaderCell>
                <CTableHeaderCell scope="col">Status</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="item in approvals" :key="item.id">
                <CTableDataCell>{{ item.id }}</CTableDataCell>
                <CTableDataCell>{{ item.employee_name }}</CTableDataCell>
                <CTableDataCell>{{ item.category }}</CTableDataCell>
                <CTableDataCell
                  >Rp {{ Number(item.amount).toFixed(2) }}</CTableDataCell
                >
                <CTableDataCell>{{
                  new Date(item.created_at).toLocaleDateString()
                }}</CTableDataCell>
                <CTableDataCell>
                  <CBadge
                    color="warning"
                    shape="rounded-pill"
                    class="px-3 py-2"
                  >
                    {{ item.status }}
                  </CBadge>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { DoughnutChart, BarChart } from "./charts";
import axios from "axios";

export default {
  components: { DoughnutChart, BarChart },
  setup() {
    const approvals = ref([]);

    const fetchPending = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/pending`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        approvals.value = data;
      } catch (err) {
        console.error(err);
      }
    };

    const statusData = ref({ labels: [], datasets: [] });
    const categoryData = ref({ labels: [], datasets: [] });
    const monthlyData = ref({ labels: [], datasets: [] });

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
    };
    const barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
    };

    const fetchDashboard = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Claims by Status
        const statusLabels = data.status.map((s) => s.status);
        const statusCounts = data.status.map((s) => s.count);
        statusData.value = {
          labels: statusLabels,
          datasets: [
            {
              data: statusCounts,
              backgroundColor: ["#ffc107", "#20c997", "#dc3545"], // pending, approved, rejected
            },
          ],
        };

        // Expenses by Category
        const categoryLabels = data.category.map((c) => c.category);
        const categoryTotals = data.category.map((c) => c.total);
        categoryData.value = {
          labels: categoryLabels,
          datasets: [
            {
              data: categoryTotals,
              backgroundColor: ["#fd7e14", "#ffc107", "#20c997"], // transport, meals, lodging
            },
          ],
        };

        // Monthly totals
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthlyTotals = new Array(12).fill(0);
        data.monthly.forEach((m) => {
          monthlyTotals[m.month - 1] = m.total;
        });
        monthlyData.value = {
          labels: months,
          datasets: [
            {
              label: "Total Amount",
              data: monthlyTotals,
              backgroundColor: "#0d6efd",
            },
          ],
        };
      } catch (err) {
        console.error(err);
      }
    };

    onMounted(() => {
      fetchDashboard();
      fetchPending();
    });

    return {
      statusData,
      categoryData,
      monthlyData,
      chartOptions,
      barOptions,
      approvals,
    };
  },
};
</script>
