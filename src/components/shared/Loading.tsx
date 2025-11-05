import { Loader2 } from 'lucide-react';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
}

const Loading = ({ fullScreen = false, message = 'Loading...' }: LoadingProps) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin mx-auto mb-3" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
