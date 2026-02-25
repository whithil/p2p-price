
"use client";

import { useEffect, useState } from 'react';
import { getGun } from '@/lib/gun-client';
import { Wifi, WifiOff, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NetworkStatus() {
  const [status, setStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');

  useEffect(() => {
    const gun = getGun();
    if (!gun) return;

    const interval = setInterval(() => {
      const isOnline = navigator.onLine;
      setStatus(isOnline ? 'online' : 'offline');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium">
      {status === 'online' ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="text-accent">P2P Pulse Online</span>
        </>
      ) : status === 'offline' ? (
        <>
          <WifiOff className="w-3 h-3 text-destructive" />
          <span className="text-destructive">Offline</span>
        </>
      ) : (
        <>
          <Globe className="w-3 h-3 animate-pulse text-muted-foreground" />
          <span className="text-muted-foreground">Conectando...</span>
        </>
      )}
    </div>
  );
}
