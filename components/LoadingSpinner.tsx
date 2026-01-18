import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    <p className="text-slate-500 text-sm font-medium animate-pulse">Sedang memproses permintaan Anda...</p>
  </div>
);