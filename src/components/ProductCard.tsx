
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Tag, TrendingUp, Users, Package } from 'lucide-react';
import { calculateConsensusPrice } from '@/lib/consensus';

interface ProductCardProps {
  ean: string;
  name: string;
  brand: string;
  priceData: Record<string, { value: number }>;
}

export function ProductCard({ ean, name, brand, priceData }: ProductCardProps) {
  const prices = Object.values(priceData || {}).map(p => p.value);
  const { consensus, count } = calculateConsensusPrice(prices);

  return (
    <Card className="glass border-none overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="border-accent/30 text-accent bg-accent/5 px-2 py-0">
            {ean}
          </Badge>
          <div className="flex gap-1">
             <div className="flex items-center text-[10px] text-muted-foreground gap-1">
                <Users className="w-3 h-3" />
                <span>{count} contributors</span>
             </div>
          </div>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">{name || 'Unnamed Product'}</CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-accent/80">
          <Package className="w-3.5 h-3.5" />
          {brand || 'Generic Brand'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 border-t border-white/5">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Consensus Price</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">${consensus.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-accent font-bold bg-accent/10 px-2 py-1 rounded-md text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Live Data</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
              <Tag className="w-4 h-4 text-accent" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase">Min Observed</span>
                <span className="text-sm font-semibold">${prices.length > 0 ? Math.min(...prices).toFixed(2) : '-'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
               <TrendingUp className="w-4 h-4 text-accent" />
               <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase">Max Observed</span>
                <span className="text-sm font-semibold">${prices.length > 0 ? Math.max(...prices).toFixed(2) : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
