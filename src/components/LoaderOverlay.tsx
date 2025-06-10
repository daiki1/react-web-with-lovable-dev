
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderOverlayProps {
  isVisible: boolean;
  message?: string;
}

/**
 * Global loading overlay component
 * Shows a full-screen loader with optional message
 */
const LoaderOverlay: React.FC<LoaderOverlayProps> = ({ isVisible, message = 'Loading...' }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4 shadow-xl">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoaderOverlay;
