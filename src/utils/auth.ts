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

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setUser = (user: User): void => {
  // Ensure we have id field for frontend compatibility
  const userWithId = {
    ...user,
    id: user._id || user.id
  };
  localStorage.setItem('user', JSON.stringify(userWithId));
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
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
  localStorage.removeItem('token');
  localStorage.removeItem('user');
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