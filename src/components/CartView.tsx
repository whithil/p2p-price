
"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  Minus, 
  Scan, 
  ShoppingBag,
  DollarSign,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type CartItem = {
  ean: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
};

interface CartViewProps {
  items: CartItem[];
  onUpdate: (ean: string, updates: Partial<CartItem>) => void;
  onRemove: (ean: string) => void;
  onBack: () => void;
  onScanMore: () => void;
}

export function CartView({ items, onUpdate, onRemove, onBack, onScanMore }: CartViewProps) {
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center text-xs font-bold text-muted-foreground hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          VOLTAR
        </button>
        <h2 className="text-lg font-black text-white uppercase tracking-tighter">Lista de Compras</h2>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-4 glass rounded-3xl">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-white">Sua lista está vazia</p>
            <p className="text-xs text-muted-foreground">Escaneie produtos para começar a preencher</p>
          </div>
          <Button onClick={onScanMore} className="mt-2 bg-primary hover:bg-primary/90 rounded-xl font-bold">
            <Scan className="w-4 h-4 mr-2" />
            Começar Escaneamento
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.ean} className="glass p-4 rounded-2xl border-none space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.brand}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(item.ean)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-white"
                      onClick={() => onUpdate(item.ean, { quantity: Math.max(1, item.quantity - 1) })}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-white"
                      onClick={() => onUpdate(item.ean, { quantity: item.quantity + 1 })}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="flex-1 flex items-center relative">
                    <span className="absolute left-3 text-xs font-bold text-accent">R$</span>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={item.price}
                      onChange={(e) => onUpdate(item.ean, { price: parseFloat(e.target.value) || 0 })}
                      className="pl-8 h-10 glass bg-accent/5 border-accent/20 focus:ring-accent text-right font-bold text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass p-5 rounded-3xl space-y-4 border-accent/20">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Estimado</span>
              <span className="text-3xl font-black text-accent">R${total.toFixed(2)}</span>
            </div>
            
            <div className="flex items-start gap-2 p-3 bg-accent/5 rounded-xl border border-accent/10">
               <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
               <p className="text-[10px] text-accent/80 leading-relaxed">
                 Ajustes de preço são contribuídos automaticamente para a rede descentralizada para manter a precisão em tempo real.
               </p>
            </div>

            <Button 
              onClick={onScanMore} 
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Escanear Mais Itens
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
