
"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from './ui/button';
import { Camera, X, RefreshCw, QrCode, Barcode } from 'lucide-react';

interface ScannerProps {
  onScan: (data: string, type: 'ean' | 'nfce') => void;
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
          fps: 15,
          qrbox: { width: 280, height: 200 },
          aspectRatio: 1.0,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13, 
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.QR_CODE
          ]
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            const isNfce = decodedText.startsWith('http') && (
              decodedText.includes('sefaz') || 
              decodedText.includes('fazenda') || 
              decodedText.includes('nfce')
            );
            
            onScan(decodedText, isNfce ? 'nfce' : 'ean');
            stopScanner();
          },
          () => {} // silent on failure
        );
        setIsInitializing(false);
      } catch (err: any) {
        console.error("Scanner Error:", err);
        setError("Não foi possível acessar a câmera. Certifique-se de que as permissões foram concedidas.");
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
      <div className="relative w-full max-w-md aspect-square overflow-hidden rounded-3xl bg-card border border-white/10 scanner-overlay">
        <div id={scannerId} className="w-full h-full" />
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card gap-4">
            <RefreshCw className="w-10 h-10 animate-spin text-accent" />
            <p className="text-sm font-medium">Iniciando óptica...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card p-6 text-center gap-4">
            <Camera className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-destructive font-medium">{error}</p>
            <Button variant="outline" onClick={onClose} className="rounded-xl">Fechar</Button>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 text-center px-6">
        <div className="flex gap-4 mb-2">
           <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <Barcode className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">EAN</span>
           </div>
           <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <QrCode className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">NFC-e</span>
           </div>
        </div>
        <p className="text-white font-medium text-lg">Alinhe o código ou QR da Nota</p>
        <p className="text-muted-foreground text-xs leading-relaxed max-w-[240px]">
          Posicione o código de barras do produto ou o QR Code encontrado no rodapé do seu cupom fiscal.
        </p>
      </div>

      <Button 
        onClick={onClose}
        variant="secondary"
        size="icon"
        className="absolute top-6 right-6 rounded-full glass hover:bg-white/20 transition-all"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
}
