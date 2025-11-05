import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white px-4 py-3 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <WifiOff className="h-5 w-5 mr-2" />
        <span className="text-sm font-medium">
          No internet connection. Some features may be unavailable.
        </span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
