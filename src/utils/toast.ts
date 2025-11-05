type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

export const showToast = ({ message, type, duration = 3000 }: ToastOptions): void => {
  const event = new CustomEvent('show-toast', {
    detail: { message, type, duration },
  });
  window.dispatchEvent(event);
};

export const toast = {
  success: (message: string, duration?: number) =>
    showToast({ message, type: 'success', duration }),
  error: (message: string, duration?: number) =>
    showToast({ message, type: 'error', duration }),
  info: (message: string, duration?: number) =>
    showToast({ message, type: 'info', duration }),
  warning: (message: string, duration?: number) =>
    showToast({ message, type: 'warning', duration }),
};
