import { createRouter, createWebHistory } from "vue-router";
import ClaimList from "@/components/ClaimList.vue";
import ClaimDetail from "@/components/ClaimDetail.vue";

const routes = [
  { path: "/claims", name: "ClaimList", component: ClaimList },
  { path: "/claims/:id", name: "ClaimDetail", component: ClaimDetail },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
