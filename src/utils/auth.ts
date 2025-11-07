export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  role: 'customer' | 'shop_owner' | 'delivery_agent';
  phone?: string;
  address?: string;
  shopId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Safe localStorage operations
const safeLocalStorage = {
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

export const setAuthToken = (token: string): void => {
  safeLocalStorage.setItem('token', token);
};

export const getAuthToken = (): string | null => {
  return safeLocalStorage.getItem('token');
};

export const setUser = (user: User): void => {
  // Ensure we have id field for frontend compatibility
  const userWithId = {
    ...user,
    id: user._id || user.id
  };
  safeLocalStorage.setItem('user', JSON.stringify(userWithId));
};

export const getUser = (): User | null => {
  const userStr = safeLocalStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const logout = (): void => {
  safeLocalStorage.removeItem('token');
  safeLocalStorage.removeItem('user');
  
  // Redirect to login page if in browser environment
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getCurrentUser = (): User | null => {
  return getUser();
};

export const hasRole = (role: string): boolean => {
  const user = getUser();
  return user ? user.role === role : false;
};

// Check if user has any of the specified roles
export const hasAnyRole = (roles: string[]): boolean => {
  const user = getUser();
  return user ? roles.includes(user.role) : false;
};

// Get user ID safely
export const getUserId = (): string | null => {
  const user = getUser();
  return user ? (user._id || user.id) : null;
};