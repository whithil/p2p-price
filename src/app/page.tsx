
"use client";

import { useState, useEffect } from 'react';
import { NetworkStatus } from '@/components/NetworkStatus';
import { Scanner } from '@/components/Scanner';
import { ProductCard } from '@/components/ProductCard';
import { PriceForm } from '@/components/PriceForm';
import { getGun, GUN_NAMESPACE, getDeviceId } from '@/lib/gun-client';
import { Button } from '@/components/ui/button';
import { 
  Scan, 
  Search, 
  ChevronLeft, 
  History, 
  Plus, 
  AlertCircle,
  BarChart3,
  Loader2,
  CheckCircle,
  Receipt
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { scrapeNfce, type ScrapedProduct } from './actions/scrape-nfce';

export default function Home() {
  const [view, setView] = useState<'home' | 'scanning' | 'details' | 'submitting' | 'nfce_processing' | 'nfce_summary'>('home');
  const [activeEan, setActiveEan] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [scrapedData, setScrapedData] = useState<ScrapedProduct[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!activeEan) return;

    const gun = getGun();
    if (!gun) return;

    const productRef = gun.get(GUN_NAMESPACE).get('products').get(activeEan);
    productRef.on((data: any) => {
      if (data) setProduct(data);
    });

    const priceRef = gun.get(GUN_NAMESPACE).get('prices').get(activeEan);
    priceRef.map().on((price: any, id: string) => {
      if (price) {
        setPrices(prev => ({ ...prev, [id]: price }));
      }
    });

    return () => {
      productRef.off();
      priceRef.off();
    };
  }, [activeEan]);

  const handleScan = async (data: string, type: 'ean' | 'nfce') => {
    if (type === 'ean') {
      setActiveEan(data);
      setProduct(null);
      setPrices({});
      setView('details');
    } else {
      setView('nfce_processing');
      const result = await scrapeNfce(data);
      if (result.success && result.products) {
        setScrapedData(result.products);
        processScrapedProducts(result.products);
        setView('nfce_summary');
      } else {
        toast({
          variant: "destructive",
          title: "Scrape Failed",
          description: result.error || "Could not read invoice data."
        });
        setView('home');
      }
    }
  };

  const processScrapedProducts = (items: ScrapedProduct[]) => {
    const gun = getGun();
    const deviceId = getDeviceId();
    const timestamp = Date.now();
    let savedCount = 0;

    items.forEach((item) => {
      if (!item.ean) return;
      savedCount++;

      // 1. Ensure product metadata exists
      gun.get(GUN_NAMESPACE).get('products').get(item.ean).put({
        ean: item.ean,
        name: item.name,
        brand: 'Invoice verified'
      });

      // 2. Add verified price submission
      const submissionId = `nfce_${timestamp}_${deviceId.substring(0, 5)}_${Math.random().toString(36).substring(7)}`;
      gun.get(GUN_NAMESPACE).get('prices').get(item.ean).get(submissionId).put({
        value: item.price,
        timestamp,
        deviceId,
        verified: true
      });
    });

    if (savedCount > 0) {
      toast({
        title: "Verified Data Injected",
        description: `Successfully fed ${savedCount} verified price points into the P2P network.`
      });
    }
  };

  const handleReset = () => {
    setView('home');
    setActiveEan(null);
    setProduct(null);
    setPrices({});
    setScrapedData([]);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative px-4 pb-10">
      <header className="flex items-center justify-between py-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
            <span className="p-1.5 bg-primary rounded-lg">
               <BarChart3 className="w-5 h-5 text-white" />
            </span>
            P2P PRICE PULSE
          </h1>
        </div>
        <NetworkStatus />
      </header>

      <main className="flex-1 flex flex-col">
        {view === 'home' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
              <div className="absolute -inset-10 bg-primary/20 blur-3xl rounded-full"></div>
              <div className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                <Scan className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">Compare Smarter</h2>
              <p className="text-muted-foreground text-sm max-w-[280px] leading-relaxed">
                Scan barcodes or grocery receipt QR codes to feed the decentralized price consensus.
              </p>
            </div>

            <div className="w-full space-y-3 pt-6">
              <Button 
                onClick={() => setView('scanning')}
                className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20"
              >
                Scan Product / Receipt
              </Button>
              <Button 
                variant="outline"
                className="w-full h-14 glass text-muted-foreground hover:text-white rounded-2xl"
              >
                <History className="w-4 h-4 mr-2" />
                Network History
              </Button>
            </div>
          </div>
        )}

        {view === 'scanning' && (
          <Scanner onScan={handleScan} onClose={() => setView('home')} />
        )}

        {view === 'nfce_processing' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
             <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center animate-pulse">
                <Receipt className="w-10 h-10 text-accent" />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Scraping SEFAZ Invoice</h3>
                <p className="text-muted-foreground text-sm">Bypassing CORS filters and extracting verified data points...</p>
             </div>
             <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        )}

        {view === 'nfce_summary' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <button 
              onClick={handleReset}
              className="flex items-center text-xs font-bold text-muted-foreground hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              BACK TO HOME
            </button>

            <div className="glass p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Invoice Processed</h3>
                  <p className="text-xs text-muted-foreground">{scrapedData.filter(i => i.ean).length} verified items added</p>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {scrapedData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <div className="flex flex-col max-w-[70%]">
                      <span className="text-xs font-bold text-white truncate">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground">{item.ean || 'No EAN found'}</span>
                    </div>
                    <span className="text-sm font-black text-accent">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Button onClick={handleReset} className="w-full bg-primary hover:bg-primary/90 rounded-xl font-bold">
                Finish Submission
              </Button>
            </div>
          </div>
        )}

        {view === 'details' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <button 
              onClick={handleReset}
              className="flex items-center text-xs font-bold text-muted-foreground hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              BACK TO HOME
            </button>

            {product ? (
              <ProductCard 
                ean={activeEan!}
                name={product.name}
                brand={product.brand}
                priceData={prices}
              />
            ) : (
              <div className="glass p-8 rounded-2xl text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                   <AlertCircle className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Product Not Found</h3>
                  <p className="text-muted-foreground text-sm">We don't have data for <span className="text-accent">{activeEan}</span> yet.</p>
                </div>
                <Button 
                  onClick={() => setView('submitting')}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Price
                </Button>
              </div>
            )}

            {product && (
              <div className="flex flex-col gap-4">
                <Button 
                  onClick={() => setView('submitting')}
                  className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit New Price Observation
                </Button>
                
                <div className="glass p-4 rounded-xl space-y-4">
                   <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price Intelligence</h4>
                   <p className="text-xs text-muted-foreground leading-relaxed">
                     Our algorithm uses MAD filtering and Gaussian weighting to exclude outliers, ensuring the consensus price remains reliable.
                   </p>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'submitting' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
             <button 
              onClick={() => setView('details')}
              className="flex items-center text-xs font-bold text-muted-foreground hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              BACK TO DETAILS
            </button>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Contribute Data</h2>
              <p className="text-muted-foreground text-sm">Your entry helps maintain the network's accuracy.</p>
            </div>

            <PriceForm 
              ean={activeEan!} 
              initialName={product?.name}
              initialBrand={product?.brand}
              onSuccess={() => setView('details')}
            />
          </div>
        )}
      </main>

      <footer className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
          <Globe className="w-3 h-3" />
          P2P Price Mesh Active
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

function Globe(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
