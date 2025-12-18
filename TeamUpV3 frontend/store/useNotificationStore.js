import { create } from 'zustand';
import { notificationHelpers } from '../lib/supabase';

const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  subscription: null,

  // Load notifications from Supabase
  loadNotifications: async (userId) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await notificationHelpers.getNotifications(userId);
      
      if (error) throw error;

      const unreadCount = data?.filter(n => !n.read).length || 0;

      set({
        notifications: data || [],
        unreadCount,
        loading: false,
      });

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Subscribe to real-time notifications
  subscribeToNotifications: (userId, onNewNotification) => {
    const subscription = notificationHelpers.subscribeToNotifications(userId, (newNotification) => {
      set((state) => ({
        notifications: [newNotification, ...state.notifications],
        unreadCount: !newNotification.read ? state.unreadCount + 1 : state.unreadCount,
      }));
      
      if (onNewNotification) {
        onNewNotification(newNotification);
      }
    });

    set({ subscription });
    return subscription;
  },

  // Unsubscribe from real-time updates
  unsubscribe: () => {
    const subscription = get().subscription;
    if (subscription) {
      // Call unsubscribe directly on the subscription object
      subscription.unsubscribe();
      set({ subscription: null });
    }
  },

  // Add a notification (now async with Supabase)
  addNotification: async (notification) => {
    try {
      const { data, error } = await notificationHelpers.createNotification(notification);
      
      if (error) throw error;

      set((state) => ({
        notifications: [data, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));

      return { success: true, data };
    } catch (error) {
      console.error('Add notification error:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const { error } = await notificationHelpers.markAsRead(notificationId);
      
      if (error) throw error;

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

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Mark all as read
  markAllAsRead: async (userId) => {
    try {
      const { error } = await notificationHelpers.markAllAsRead(userId);
      
      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const { error } = await notificationHelpers.deleteNotification(notificationId);
      
      if (error) throw error;

      set((state) => {
        const notification = state.notifications.find(n => n.id === notificationId);
        const wasUnread = notification && !notification.read;

        return {
          notifications: state.notifications.filter(n => n.id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Clear all notifications
  clearAll: () => set({ notifications: [], unreadCount: 0 }),

  // Get unread notifications
  getUnreadNotifications: () => {
    return get().notifications.filter(n => !n.read);
  },

  // Populate sample notifications (for testing)
  populateSampleNotifications: async (userId) => {
    const sampleNotifications = [
      {
        user_id: userId,
        type: 'join_request',
        title: 'New Join Request',
        message: 'John Doe wants to join your team',
        team_id: null,
        from_user_id: null,
      },
      {
        user_id: userId,
        type: 'join_request',
        title: 'New Join Request',
        message: 'Jane Smith wants to join your team',
        team_id: null,
        from_user_id: null,
      },
      {
        user_id: userId,
        type: 'member_joined',
        title: 'Member Joined',
        message: 'Alex Johnson joined your team',
        team_id: null,
        from_user_id: null,
      },
    ];

    for (const notification of sampleNotifications) {
      await get().addNotification(notification);
    }
  },
}));

export default useNotificationStore;