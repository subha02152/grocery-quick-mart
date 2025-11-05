import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

const Toast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<{
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
        duration: number;
      }>;
      const { message, type, duration } = customEvent.detail;
      const id = Math.random().toString(36).substring(7);

      setToasts((prev) => [...prev, { id, message, type, duration }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <XCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start p-4 rounded-lg border shadow-lg animate-slide-in ${getStyles(
            toast.type
          )}`}
        >
          <div className="flex-shrink-0">{getIcon(toast.type)}</div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
