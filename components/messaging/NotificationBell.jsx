import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { MdNotifications } from 'react-icons/md';

export default function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const queryClient = useQueryClient();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Fetch notifications (with auto-refresh every 10 seconds)
  const { data: notificationsData = { unread_count: 0, results: [] } } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/messaging/notifications/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const notifications = response.data.results || response.data;
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      return { results: notifications, unread_count: unreadCount };
    },
    enabled: !!token,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      return await axios.post(
        `${API_URL}/messaging/notifications/${notificationId}/mark_as_read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await axios.post(
        `${API_URL}/messaging/notifications/mark_all_as_read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = notificationsData.results || [];
  const unreadCount = notificationsData.unread_count || 0;

  const getNotificationIcon = (type) => {
    const icons = {
      message: '💬',
      application: '📋',
      shortlist: '⭐',
      interview: '📅',
      offer: '🎉',
      system: 'ℹ️',
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <MdNotifications className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-slate-700"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-xs text-emerald-500 hover:text-emerald-600 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.button
                    key={notif.id}
                    onClick={() => {
                      if (!notif.is_read) {
                        markAsReadMutation.mutate(notif.id);
                      }
                    }}
                    whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                    className={`w-full text-left p-3 border-b border-gray-100 dark:border-slate-700 transition-colors ${
                      notif.is_read ? 'opacity-60' : 'font-medium'
                    }`}
                  >
                    <div className="flex gap-2">
                      <span className="text-lg">{getNotificationIcon(notif.notification_type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {notif.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
