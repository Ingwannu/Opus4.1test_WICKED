const { AdminActionLog } = require('../models');

const logAdminAction = async (adminId, actionType, targetUserId = null, payload = {}, ipAddress = null) => {
  try {
    await AdminActionLog.create({
      admin_id: adminId,
      target_user_id: targetUserId,
      action_type: actionType,
      action_payload: payload,
      ip_address: ipAddress
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress;
};

module.exports = {
  logAdminAction,
  getClientIp
};