<script setup>
import { onMounted, ref } from "vue";
import { useColorModes } from "@coreui/vue";

import AppBreadcrumb from "@/components/AppBreadcrumb.vue";
import AppHeaderDropdownAccnt from "@/components/AppHeaderDropdownAccnt.vue";
import { useSidebarStore } from "@/stores/sidebar.js";
import { useSocket } from "@/pages/useSocket.js";

const user = JSON.parse(localStorage.getItem("user"));
const { notifications, markAsRead, markAllAsRead } = useSocket(user.id);

const headerClassNames = ref("mb-4 p-0");
const { colorMode, setColorMode } = useColorModes(
  "coreui-free-vue-admin-template-theme"
);
const sidebar = useSidebarStore();

onMounted(() => {
  document.addEventListener("scroll", () => {
    if (document.documentElement.scrollTop > 0) {
      headerClassNames.value = "mb-4 p-0 shadow-sm";
    } else {
      headerClassNames.value = "mb-4 p-0";
    }
  });
});
</script>

<template>
  <CHeader position="sticky" :class="headerClassNames">
    <CContainer class="border-bottom px-4" fluid>
      <CHeaderToggler
        @click="sidebar.toggleVisible()"
        style="margin-inline-start: -14px"
      >
        <CIcon icon="cil-menu" size="lg" />
      </CHeaderToggler>
      <CHeaderNav class="d-none d-md-flex">
        <CNavItem>
          <CNavLink v-if="user.role == 'manager'" href="#/dashboard">
            Dashboard
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink href="#/claim/list">Claim List</CNavLink>
        </CNavItem>
      </CHeaderNav>
      <CHeaderNav class="ms-auto">
        <CDropdown in-nav>
          <CDropdownToggle color="secondary" class="position-relative">
            <CIcon icon="cil-bell" size="lg" />
            <span
              v-if="notifications.filter((n) => !n.is_read).length > 0"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            >
              {{ notifications.filter((n) => !n.is_read).length }}
            </span>
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem
              v-for="n in notifications"
              :key="n.id"
              :class="{ 'fw-bold': !n.is_read }"
              @click="markAsRead(n.id)"
            >
              {{ n.message }}
              <small class="text-muted d-block">{{
                new Date(n.created_at).toLocaleString()
              }}</small>
            </CDropdownItem>
            <CDropdownDivider />
            <CDropdownItem @click="markAllAsRead"
              >Mark all as read</CDropdownItem
            >
          </CDropdownMenu>
        </CDropdown>
      </CHeaderNav>
      <CHeaderNav>
        <li class="nav-item py-1">
          <div class="vr h-100 mx-2 text-body text-opacity-75"></div>
        </li>
        <CDropdown variant="nav-item" placement="bottom-end">
          <CDropdownToggle :caret="false">
            <CIcon v-if="colorMode === 'dark'" icon="cil-moon" size="lg" />
            <CIcon v-else-if="colorMode === 'light'" icon="cil-sun" size="lg" />
            <CIcon v-else icon="cil-contrast" size="lg" />
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem
              :active="colorMode === 'light'"
              class="d-flex align-items-center"
              component="button"
              type="button"
              @click="setColorMode('light')"
            >
              <CIcon class="me-2" icon="cil-sun" size="lg" /> Light
            </CDropdownItem>
            <CDropdownItem
              :active="colorMode === 'dark'"
              class="d-flex align-items-center"
              component="button"
              type="button"
              @click="setColorMode('dark')"
            >
              <CIcon class="me-2" icon="cil-moon" size="lg" /> Dark
            </CDropdownItem>
            <CDropdownItem
              :active="colorMode === 'auto'"
              class="d-flex align-items-center"
              component="button"
              type="button"
              @click="setColorMode('auto')"
            >
              <CIcon class="me-2" icon="cil-contrast" size="lg" /> Auto
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
        <li class="nav-item py-1">
          <div class="vr h-100 mx-2 text-body text-opacity-75"></div>
        </li>
        <AppHeaderDropdownAccnt />
      </CHeaderNav>
    </CContainer>
    <CContainer class="px-4" fluid>
      <AppBreadcrumb />
    </CContainer>
  </CHeader>
</template>
