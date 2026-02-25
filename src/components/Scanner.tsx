
"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from './ui/button';
import { Camera, X, RefreshCw } from 'lucide-react';

interface ScannerProps {
  onScan: (ean: string) => void;
  onClose: () => void;
}

export function Scanner({ onScan, onClose }: ScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "p2p-scanner-region";

  useEffect(() => {
    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
          formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8]
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          () => {} // silent on failure
        );
        setIsInitializing(false);
      } catch (err: any) {
        console.error("Scanner Error:", err);
        setError("Could not access camera. Please ensure permissions are granted.");
        setIsInitializing(false);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScan]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Stop scanner error", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md aspect-square overflow-hidden rounded-2xl bg-card border border-white/10 scanner-overlay">
        <div id={scannerId} className="w-full h-full" />
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card gap-4">
            <RefreshCw className="w-10 h-10 animate-spin text-accent" />
            <p className="text-sm font-medium">Initializing Camera...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card p-6 text-center gap-4">
            <Camera className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-destructive font-medium">{error}</p>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-white font-medium">Align EAN barcode inside the frame</p>
        <p className="text-muted-foreground text-xs uppercase tracking-widest">Scanning...</p>
      </div>

      <Button 
        onClick={onClose}
        variant="secondary"
        size="icon"
        className="absolute top-6 right-6 rounded-full glass"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
}
