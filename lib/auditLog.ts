// Audit Log Utility for tracking all user actions
export interface AuditLog {
  id: string;
  createdAt: string;
  user: string;
  action: string;
  details: string;
  ip: string;
}

// Get client IP (simplified - in production use proper IP detection)
function getClientIP(): string {
  // In a real app, you'd get this from the server or a service
  return '103.45.12.' + Math.floor(Math.random() * 255);
}

// Format timestamp
function formatTimestamp(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Generate unique ID
function generateLogId(): string {
  return `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get all logs from database
export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const response = await fetch('/api/audit-logs?limit=500');
    if (response.ok) {
      const data = await response.json();
      return (data.logs || []).map((log: any) => ({
        id: log._id,
        createdAt: new Date(log.createdAt).toLocaleString(),
        user: log.user,
        action: log.action,
        details: log.details,
        ip: log.ip || 'N/A',
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading audit logs:', error);
    return [];
  }
}

// Add a new log entry
export async function addAuditLog(action: string, details: string, user?: string): Promise<void> {
  try {
    // Get current user if not provided
    let username = user;
    if (!username && typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        username = userData.name || userData.username || userData.email || 'Unknown';
      } else {
        username = 'System';
      }
    }

    // Send log to database
    await fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: username || 'System',
        action: action,
        details: details,
        ip: getClientIP(),
      }),
    });
  } catch (error) {
    console.error('Error adding audit log:', error);
  }
}

// Clear all logs (admin only)
export async function clearAuditLogs(): Promise<void> {
  // This would require a DELETE endpoint in the API
  console.warn('Clear audit logs not implemented - requires API endpoint');
}

// Predefined action types for consistency
export const AuditActions = {
  // Authentication
  USER_LOGIN: 'USER LOGIN',
  USER_LOGOUT: 'USER LOGOUT',
  LOGIN_FAILED: 'LOGIN FAILED',
  
  // User Management
  USER_CREATED: 'USER CREATED',
  USER_UPDATED: 'USER UPDATED',
  USER_DELETED: 'USER DELETED',
  USER_APPROVED: 'USER APPROVED',
  USER_REJECTED: 'USER REJECTED',
  
  // Voting
  VOTE_SUBMITTED: 'VOTE SUBMITTED',
  VOTE_UPDATED: 'VOTE UPDATED',
  VOTE_VIEWED: 'VOTE VIEWED',
  
  // Incidents
  INCIDENT_REPORTED: 'INCIDENT REPORTED',
  INCIDENT_VIEWED: 'INCIDENT VIEWED',
  INCIDENT_ACKNOWLEDGED: 'INCIDENT ACKNOWLEDGED',
  INCIDENT_UPDATED: 'INCIDENT UPDATED',
  
  // Dashboard
  DASHBOARD_ACCESSED: 'DASHBOARD ACCESSED',
  REPORT_GENERATED: 'REPORT GENERATED',
  DATA_EXPORTED: 'DATA EXPORTED',
  
  // Security
  PERMISSIONS_MODIFIED: 'PERMISSIONS MODIFIED',
  SETTINGS_CHANGED: 'SETTINGS CHANGED',
  PASSWORD_CHANGED: 'PASSWORD CHANGED',
  
  // Profile
  PROFILE_VIEWED: 'PROFILE VIEWED',
  PROFILE_UPDATED: 'PROFILE UPDATED',
};
