// Database service layer for client-side operations
// This provides a clean interface for the frontend to interact with the API

export interface SystemUser {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Admin' | 'Officer' | 'Police';
  status: 'Active' | 'Inactive' | 'Pending';
  location: string;
  joinedDate: string;
  lastActive: string;
  serviceId?: string;
  rank?: string;
  avatar?: string;
  pollingCenterId?: string;
  pollingCenterName?: string;
  thana?: string;
  nidDocument?: string;
}

// User Management Functions
export const getUsers = async (): Promise<SystemUser[]> => {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    
    // Convert MongoDB _id to id for compatibility
    return data.users.map((user: any) => ({
      ...user,
      id: user._id || user.id,
      joinedDate: new Date(user.joinedDate).toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getUserById = async (userId: string): Promise<SystemUser | undefined> => {
  try {
    const response = await fetch(`/api/users?userId=${userId}`);
    if (!response.ok) return undefined;
    const data = await response.json();
    
    return {
      ...data.user,
      id: data.user._id || data.user.id,
      joinedDate: new Date(data.user.joinedDate).toISOString().split('T')[0],
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return undefined;
  }
};

export const addUser = async (user: Omit<SystemUser, 'id'>): Promise<SystemUser> => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add user');
    }
    
    const data = await response.json();
    return {
      ...data.user,
      id: data.user._id || data.user.id,
      joinedDate: new Date(data.user.joinedDate).toISOString().split('T')[0],
    };
  } catch (error: any) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const updateUserStatus = async (
  userId: string,
  status: 'Active' | 'Inactive' | 'Pending'
): Promise<void> => {
  try {
    const response = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        status,
        lastActive: status === 'Active' ? 'Just now' : undefined,
      }),
    });
    
    if (!response.ok) throw new Error('Failed to update user status');
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/users?userId=${userId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Failed to delete user');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: { phone?: string; avatar?: string }
): Promise<void> => {
  try {
    const response = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...updates }),
    });
    
    if (!response.ok) throw new Error('Failed to update user profile');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Authentication Functions
export const authenticateUser = async (
  username: string,
  password: string,
  role: 'admin' | 'officer' | 'police'
): Promise<{ success: boolean; user?: SystemUser; error?: string }> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Authentication failed' };
    }
    
    return {
      success: true,
      user: {
        ...data.user,
        id: data.user.id || data.user._id,
        joinedDate: new Date(data.user.joinedDate || Date.now()).toISOString().split('T')[0],
      },
    };
  } catch (error: any) {
    console.error('Error authenticating user:', error);
    return { success: false, error: error.message || 'Authentication failed' };
  }
};

export const registerLawEnforcementUser = async (userData: {
  fullName: string;
  email: string;
  phone: string;
  serviceId: string;
  postedStation: string;
  district: string;
  rank: string;
  username: string;
  password: string;
}): Promise<SystemUser> => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userData.username,
        password: userData.password,
        name: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        role: 'Police',
        location: `${userData.district} - ${userData.postedStation}`,
        serviceId: userData.serviceId,
        rank: userData.rank,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    const data = await response.json();
    return {
      ...data.user,
      id: data.user.id || data.user._id,
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Never',
    };
  } catch (error: any) {
    console.error('Error registering law enforcement user:', error);
    throw error;
  }
};

export const registerPresidingOfficerUser = async (userData: {
  fullName: string;
  email: string;
  phone: string;
  employeeId: string;
  pollingStation: string;
  pollingCenterId?: string;
  district: string;
  thana?: string;
  designation: string;
  username: string;
  password: string;
  nidDocument?: string;
}): Promise<SystemUser> => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userData.username,
        password: userData.password,
        name: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        role: 'Officer',
        location: `${userData.district} - ${userData.pollingStation}`,
        serviceId: userData.employeeId,
        rank: userData.designation,
        pollingCenterId: userData.pollingCenterId,
        pollingCenterName: userData.pollingStation,
        thana: userData.thana,
        nidDocument: userData.nidDocument,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    const data = await response.json();
    return {
      ...data.user,
      id: data.user.id || data.user._id,
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Never',
    };
  } catch (error: any) {
    console.error('Error registering presiding officer user:', error);
    throw error;
  }
};

// Legacy exports for compatibility
export const saveUsers = (users: SystemUser[]): void => {
  console.warn('saveUsers is deprecated - data is now stored in MongoDB');
};

export const incidents: any[] = [];
export const logs: any[] = [];
export const notifications: any[] = [];
