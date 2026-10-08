import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-status-banner"
      className="sticky top-16 z-30 flex items-center justify-center gap-2 bg-amber-600 px-4 py-1.5 text-center text-xs font-semibold text-white shadow-xs"
    >
      <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
      <span>
        You are currently offline. Running from Android local service worker cache with last known Delhi-NCR telemetry.
      </span>
    </div>
  );
};
