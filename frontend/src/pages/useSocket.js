import { io } from "socket.io-client";
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";

export function useSocket(userId) {
  const notifications = ref([]);

  const socket = io(import.meta.env.VITE_API_URL);

  // fetch awal
  const fetchNotifications = async () => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/notifications`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    notifications.value = data;
  };

  // mark single as read
  const markAsRead = async (id) => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    notifications.value = notifications.value.map((n) =>
      n.id === id ? { ...n, is_read: true } : n
    );
  };

  // mark all as read
  const markAllAsRead = async () => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/notifications/read-all`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    notifications.value = notifications.value.map((n) => ({
      ...n,
      is_read: true,
    }));
  };

  onMounted(() => {
    socket.emit("registerManager", userId);

    // real-time push notifikasi baru
    socket.on("newNotification", (data) => {
      notifications.value.unshift({ ...data, is_read: false });
    });

    fetchNotifications();
  });

  onUnmounted(() => {
    socket.disconnect();
  });

  return { notifications, markAsRead, markAllAsRead, fetchNotifications };
}
