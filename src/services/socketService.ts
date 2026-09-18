// @ts-ignore
import ioClient from "socket.io-client/dist/socket.io.js";
import * as Haptics from "expo-haptics";
import { SOCKET_URL } from "../Redux/api/apiConfig";
import { store } from "../Redux/store";
import {
  leadAssignedRealTime,
  leadUpdatedRealTime,
  addNotification,
  setSocketConnected,
} from "../Redux/VerificationStaff/verificationStaffSlice";

let socket: any = null;
let registeredUser: any = null;

export const initSocketService = (): any => {
  if (socket) return socket;

  console.log(`🔌 [SocketService] Initializing socket connection to ${SOCKET_URL}`);

  const s = ioClient(SOCKET_URL, {
    transports: ["websocket", "polling"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  s.on("connect", () => {
    console.log(`⚡ [SocketService] Connected to server! Socket ID: ${s.id}`);
    store.dispatch(setSocketConnected(true));

    if (registeredUser?._id) {
      s.emit("register", {
        userId: registeredUser._id,
        role: registeredUser.role,
      });
      console.log(`👤 [SocketService] Re-registered user: ${registeredUser.name} (${registeredUser.role})`);
    }
  });

  s.on("disconnect", (reason: string) => {
    console.log(`🔌 [SocketService] Disconnected from server: ${reason}`);
    store.dispatch(setSocketConnected(false));
  });

  s.on("connect_error", (error: any) => {
    console.warn(`⚠️ [SocketService] Connection error:`, error?.message || error);
    store.dispatch(setSocketConnected(false));
  });

  // 1. Real-time Lead Assignment to Staff
  s.on("lead:assigned", (data: any) => {
    console.log(`📢 [SocketService] Received "lead:assigned":`, data);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const lead = data?.lead || data;
    const notification = data?.notification;

    store.dispatch(
      leadAssignedRealTime({
        lead,
        notification,
      })
    );
  });

  // 2. Real-time Notifications
  s.on("notification:new", (notif: any) => {
    console.log(`🔔 [SocketService] Received "notification:new":`, notif);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    store.dispatch(addNotification(notif));
  });

  // 3. Real-time Lead Updates
  s.on("lead:updated", (lead: any) => {
    console.log(`🔄 [SocketService] Received "lead:updated":`, lead);
    store.dispatch(leadUpdatedRealTime(lead));
  });

  // 4. Real-time Lead Published / Locked
  s.on("lead:published", (data: any) => {
    const lead = data?.lead || data;
    console.log(`🔒 [SocketService] Received "lead:published":`, lead);
    store.dispatch(leadUpdatedRealTime(lead));
  });

  socket = s;
  return socket;
};

export const connectSocketUser = (user: any) => {
  if (!user || !user._id) return;
  registeredUser = user;

  const s = initSocketService();
  if (s) {
    if (!s.connected) {
      s.connect();
    } else {
      s.emit("register", {
        userId: user._id,
        role: user.role,
      });
    }
  }
};

export const disconnectSocketUser = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  registeredUser = null;
  store.dispatch(setSocketConnected(false));
};

export const getSocket = () => socket;

export default {
  initSocketService,
  connectSocketUser,
  disconnectSocketUser,
  getSocket,
};
