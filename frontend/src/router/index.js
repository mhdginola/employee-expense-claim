import { h, resolveComponent } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import DefaultLayout from "@/layouts/DefaultLayout.vue";

const routes = [
  {
    path: "/",
    name: "App",
    component: DefaultLayout,
    redirect: "/claim/list",
    children: [
      {
        path: "/claim/list",
        name: "ClaimList",
        component: () => import("@/pages/ClaimList.vue"),
      },
      {
        path: "/dashboard",
        name: "Dashboard",
        component: () => import("@/pages/Dashboard.vue"),
      },
    ],
  },
  {
    path: "/pages",
    redirect: "/pages/404",
    name: "Pages",
    meta: {
      middleware: "auth",
    },
    component: {
      render() {
        return h(resolveComponent("router-view"));
      },
    },
    children: [
      {
        path: "404",
        name: "Page404",
        component: () => import("@/views/pages/Page404.vue"),
      },
      {
        path: "500",
        name: "Page500",
        component: () => import("@/views/pages/Page500.vue"),
      },
      {
        path: "login",
        name: "Login",
        component: () => import("@/pages/Login.vue"),
      },
      {
        path: "register",
        name: "Register",
        component: () => import("@/views/pages/Register.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  if (to.meta.middleware == "auth") {
    return next();
  } else {
    if (localStorage.getItem("token")) {
      return next();
    } else {
      return next({ name: "Login" });
    }
  }
});

export default router;
