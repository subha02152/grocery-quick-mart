type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

export const showToast = ({ message, type, duration = 3000 }: ToastOptions): void => {
  if (!isBrowser) return;
  
  try {
    const event = new CustomEvent('show-toast', {
      detail: { message, type, duration },
    });
    window.dispatchEvent(event);
  } catch (error) {
    // Fallback to console logging if custom events fail
    console.log(`[${type.toUpperCase()}]: ${message}`);
  }
};

// Simple fallback toast for development
const fallbackToast = (message: string, type: ToastType): void => {
  if (!isBrowser) return;
  
  const colors = {
    success: '#10B981',
    error: '#EF4444', 
    info: '#3B82F6',
    warning: '#F59E0B'
  };
  
  console.log(`%c${type.toUpperCase()}: ${message}`, `color: ${colors[type]}; font-weight: bold;`);
  
  // Optional: Show browser alert as last resort
  if (type === 'error') {
    alert(`❌ ${message}`);
  }
};

export const toast = {
  success: (message: string, duration?: number) => {
    showToast({ message, type: 'success', duration });
    fallbackToast(message, 'success');
  },
  error: (message: string, duration?: number) => {
    showToast({ message, type: 'error', duration });
    fallbackToast(message, 'error');
  },
  info: (message: string, duration?: number) => {
    showToast({ message, type: 'info', duration });
    fallbackToast(message, 'info');
  },
  warning: (message: string, duration?: number) => {
    showToast({ message, type: 'warning', duration });
    fallbackToast(message, 'warning');
  },
};

// For React components that use toast context
export const createToast = (message: string, type: ToastType = 'info') => {
  return { message, type, id: Date.now().toString() };
};

export type { ToastType, ToastOptions };