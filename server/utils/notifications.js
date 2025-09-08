// server/utils/notifications.js
export async function notifyStatusChange({ ticketId, toUserId, newStatus, channel = "in-app", meta = {} }) {
  // stub: integrate email/SSE later if you want
  console.log(`🔔 Notification (${channel}) -> user:${toUserId} ticket:${ticketId} status:${newStatus}`, meta);
}
