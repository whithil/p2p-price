"use client";

import { useState, useEffect, useMemo } from 'react';
import { NetworkStatus } from '@/components/NetworkStatus';
import { Scanner } from '@/components/Scanner';
import { ProductCard } from '@/components/ProductCard';
import { PriceForm } from '@/components/PriceForm';
import { CartView, type CartItem } from '@/components/CartView';
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
    Receipt,
    ShoppingCart,
    ArrowRight
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function Home() {
    const [view, setView] = useState<'home' | 'scanning' | 'details' | 'submitting' | 'nfce_processing' | 'nfce_summary' | 'cart'>('home');
    const [activeEan, setActiveEan] = useState<string | null>(null);
    const [product, setProduct] = useState<any>(null);
    const [prices, setPrices] = useState<Record<string, any>>({});
    const [cart, setCart] = useState<CartItem[]>([]);
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
            toast({
                variant: "destructive",
                title: "Recurso Indisponível",
                description: "A leitura de nota fiscal não é suportada na versão estática do aplicativo."
            });
            setView('home');
        }
    };


    const handleAddToCart = (item: CartItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.ean === item.ean);
            if (existing) {
                return prev.map(i => i.ean === item.ean ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, item];
        });
        toast({
            title: "Adicionado à Lista",
            description: `${item.name} agora está na sua lista de compras.`
        });
        setView('home');
    };

    const updateCartItem = (ean: string, updates: Partial<CartItem>) => {
        setCart(prev => prev.map(item => {
            if (item.ean === ean) {
                const updatedItem = { ...item, ...updates };

                // If price is updated manually, contribute to GunDB
                if (updates.price !== undefined) {
                    const gun = getGun();
                    const deviceId = getDeviceId();
                    const timestamp = Date.now();
                    const submissionId = `cart_adj_${timestamp}_${deviceId.substring(0, 5)}`;

                    gun.get(GUN_NAMESPACE).get('prices').get(ean).get(submissionId).put({
                        value: updates.price,
                        timestamp,
                        deviceId,
                        manual_adj: true
                    });
                }

                return updatedItem;
            }
            return item;
        }));
    };

    const removeFromCart = (ean: string) => {
        setCart(prev => prev.filter(i => i.ean !== ean));
    };

    const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

    const handleReset = () => {
        setView('home');
        setActiveEan(null);
        setProduct(null);
        setPrices({});
    };

    return (
        <div className="min-h-screen flex flex-col max-w-md mx-auto relative px-4 pb-24">
            <header className="flex items-center justify-between py-6">
                <div className="flex flex-col" onClick={() => setView('home')}>
                    <h1 className="text-xl font-black tracking-tighter text-white flex items-center gap-2 cursor-pointer">
                        <span className="p-1.5 bg-primary rounded-lg">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </span>
                        P2P PRICE PULSE
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {cart.length > 0 && view !== 'cart' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative glass rounded-full"
                            onClick={() => setView('cart')}
                        >
                            <ShoppingCart className="w-5 h-5 text-accent" />
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground border-none">
                                {cartCount}
                            </Badge>
                        </Button>
                    )}
                    <NetworkStatus />
                </div>
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
                            <h2 className="text-2xl font-bold text-white">Seu Companheiro de Compras</h2>
                            <p className="text-muted-foreground text-sm max-w-[280px] leading-relaxed">
                                Escaneie produtos para montar sua lista e ajude a comunidade a manter os preços honestos.
                            </p>
                        </div>

                        <div className="w-full space-y-3 pt-6">
                            <Button
                                onClick={() => setView('scanning')}
                                className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20"
                            >
                                Escanear Produto / Nota
                            </Button>

                            {cart.length > 0 && (
                                <Button
                                    onClick={() => setView('cart')}
                                    className="w-full h-14 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded-2xl font-bold"
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Ver Lista (R${cart.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)})
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                className="w-full h-14 glass text-muted-foreground hover:text-white rounded-2xl"
                            >
                                <History className="w-4 h-4 mr-2" />
                                Histórico da Rede
                            </Button>
                        </div>
                    </div>
                )}

                {view === 'scanning' && (
                    <Scanner onScan={handleScan} onClose={() => setView('home')} />
                )}


                {view === 'details' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <button
                            onClick={handleReset}
                            className="flex items-center text-xs font-bold text-muted-foreground hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            VOLTAR AO INÍCIO
                        </button>

                        {product ? (
                            <ProductCard
                                ean={activeEan!}
                                name={product.name}
                                brand={product.brand}
                                priceData={prices}
                                onAddToCart={(price) => handleAddToCart({
                                    ean: activeEan!,
                                    name: product.name,
                                    brand: product.brand,
                                    price,
                                    quantity: 1
                                })}
                            />
                        ) : (
                            <div className="glass p-8 rounded-2xl text-center space-y-4">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                    <AlertCircle className="w-8 h-8 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Produto não encontrado</h3>
                                    <p className="text-muted-foreground text-sm">Ainda não temos dados para <span className="text-accent">{activeEan}</span>.</p>
                                </div>
                                <Button
                                    onClick={() => setView('submitting')}
                                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar Primeiro Preço
                                </Button>
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
                            VOLTAR PARA DETALHES
                        </button>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white">Contribuir com Dados</h2>
                            <p className="text-muted-foreground text-sm">Sua entrada ajuda a manter a precisão da rede.</p>
                        </div>

                        <PriceForm
                            ean={activeEan!}
                            initialName={product?.name}
                            initialBrand={product?.brand}
                            onSuccess={() => setView('details')}
                        />
                    </div>
                )}

                {view === 'cart' && (
                    <CartView
                        items={cart}
                        onUpdate={updateCartItem}
                        onRemove={removeFromCart}
                        onBack={() => setView('home')}
                        onScanMore={() => setView('scanning')}
                    />
                )}
            </main>

            {view !== 'scanning' && view !== 'cart' && (
                <footer className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        <Globe className="w-3 h-3" />
                        Rede P2P Price Ativa
                    </div>
                </footer>
            )}

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
