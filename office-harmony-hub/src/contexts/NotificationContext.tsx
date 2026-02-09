import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/types/index";

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    const socketClient: Socket = io("http://localhost:5000");
    setSocket(socketClient);

    // Join user-specific room
    socketClient.emit("joinRoom", user._id);

    // Listen for notifications
    socketClient.on("newNotification", (notification: Notification) => {
      if (notification.userId === user._id) {
        toast({ title: notification.message });
        setNotifications((prev) => [notification, ...prev]);
      }
    });

    return () => {
      socketClient.disconnect();
    };
  }, [user, toast]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, deleteNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
