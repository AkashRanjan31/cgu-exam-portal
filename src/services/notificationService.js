/**
 * University Notification Service
 * Official bulletins, examination advisories, and retest authorizations
 */
export const notificationService = {
  /**
   * Fetch active notifications for current user/role
   */
  getNotifications: async (role = 'student') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const studentNotices = [
        {
          id: 'notif-1',
          title: 'Retest Authorized for Attempt 2',
          message: 'The Office of the Controller of Examinations has approved your petition for Data Structures (CS301).',
          date: 'Today, 09:30 AM',
          type: 'success',
          read: false
        },
        {
          id: 'notif-2',
          title: 'Section Locking Guidelines in Effect',
          message: 'All examination papers require sequential completion. Locked sections cannot be reopened.',
          date: 'Yesterday',
          type: 'info',
          read: true
        }
      ];

      const adminNotices = [
        {
          id: 'notif-admin-1',
          title: 'Retest Petition Awaiting COE Review',
          message: 'A candidate has filed an incident report regarding workstation terminal failure.',
          date: 'Today, 10:15 AM',
          type: 'warning',
          read: false
        }
      ];

      return role === 'admin' ? adminNotices : studentNotices;
    } catch (err) {
      console.error('Failed to get notifications:', err);
      return [];
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    return { success: true, notificationId };
  }
};

export default notificationService;
