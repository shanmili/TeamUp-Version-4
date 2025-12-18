import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,

  // Add a notification
  addNotification: (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    return newNotification;
  },

  // Mark notification as read
  markAsRead: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (!notification || notification.read) return state;

      return {
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    });
  },

  // Mark all as read
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  // Delete notification
  deleteNotification: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      const wasUnread = notification && !notification.read;

      return {
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },

  // Clear all notifications
  clearAll: () => set({ notifications: [], unreadCount: 0 }),

  // Get unread notifications
  getUnreadNotifications: () => {
    return get().notifications.filter(n => !n.read);
  },

  // Populate sample notifications (for testing)
  populateSampleNotifications: () => {
    const sampleNotifications = [
      {
        id: '1',
        type: 'join_request',
        title: 'New Join Request',
        message: 'John Doe wants to join your team',
        teamId: '1',
        teamName: 'Web Dev Innovators',
        userId: 'user123',
        userName: 'John Doe',
        read: false,
        createdAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      },
      {
        id: '2',
        type: 'join_request',
        title: 'New Join Request',
        message: 'Jane Smith wants to join your team',
        teamId: '1',
        teamName: 'Web Dev Innovators',
        userId: 'user456',
        userName: 'Jane Smith',
        read: false,
        createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      },
      {
        id: '3',
        type: 'member_joined',
        title: 'Member Joined',
        message: 'Alex Johnson joined your team',
        teamId: '2',
        teamName: 'Mobile App Creators',
        userId: 'user789',
        userName: 'Alex Johnson',
        read: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
    ];

    set({
      notifications: sampleNotifications,
      unreadCount: sampleNotifications.filter(n => !n.read).length,
    });
  },
}));

export default useNotificationStore;
