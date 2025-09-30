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
    </div>
  </div>
</template>

<script>
import { DoughnutChart, BarChart } from "./charts";

export default {
  components: { DoughnutChart, BarChart },
  setup() {
    // Mockup data (seperti gambar)
    const statusData = {
      labels: ["Pending", "Approved", "Rejected"],
      datasets: [
        {
          data: [45, 60, 25],
          backgroundColor: ["#f6c23e", "#1cc88a", "#e74a3b"],
        },
      ],
    };

    const categoryData = {
      labels: ["Transport", "Meals", "Lodging"],
      datasets: [
        {
          data: [50, 20, 30],
          backgroundColor: ["#e74a3b", "#f6c23e", "#1cc88a"],
        },
      ],
    };

    const monthlyData = {
      labels: [
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
      ],
      datasets: [
        {
          label: "Expenses",
          data: [300, 950, 50, 600, 1350, 300, 0, 750, 0, 0, 0, 0],
          backgroundColor: "#2c7be5",
          borderRadius: 6,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    };

    const barOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `$${value}`,
          },
        },
      },
    };

    return { statusData, categoryData, monthlyData, chartOptions, barOptions };
  },
};
</script>
