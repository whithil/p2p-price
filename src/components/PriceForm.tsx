
"use client";

import { useState } from 'react';
import { getGun, getDeviceId, GUN_NAMESPACE } from '@/lib/gun-client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, CheckCircle2, DollarSign, Package, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PriceFormProps {
  ean: string;
  initialName?: string;
  initialBrand?: string;
  onSuccess: () => void;
}

export function PriceForm({ ean, initialName, initialBrand, onSuccess }: PriceFormProps) {
  const [name, setName] = useState(initialName || '');
  const [brand, setBrand] = useState(initialBrand || '');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || isNaN(parseFloat(price))) {
      toast({ title: "Preço inválido", description: "Por favor, insira um valor numérico válido." });
      return;
    }

    setIsSubmitting(true);
    const gun = getGun();
    const deviceId = getDeviceId();
    const timestamp = Date.now();
    const priceValue = parseFloat(price);

    try {
      gun.get(GUN_NAMESPACE).get('products').get(ean).put({
        ean,
        name: name || initialName,
        brand: brand || initialBrand
      });

      const submissionId = `sub_${timestamp}_${deviceId.substring(0, 5)}`;
      gun.get(GUN_NAMESPACE).get('prices').get(ean).get(submissionId).put({
        value: priceValue,
        timestamp,
        deviceId
      });

      toast({
        title: "Envio realizado com sucesso!",
        description: `O preço de R$${priceValue.toFixed(2)} foi registrado para ${name}.`
      });
      
      onSuccess();
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao enviar preço", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        {!initialName && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Nome do Produto</Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="name"
                  placeholder="ex: Leite Integral Orgânico" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 glass focus:ring-accent/50"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Marca</Label>
              <div className="relative">
                <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="brand"
                  placeholder="ex: Fazenda Trevo" 
                  value={brand} 
                  onChange={(e) => setBrand(e.target.value)}
                  className="pl-10 glass focus:ring-accent/50"
                  required
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="price" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Preço Observado</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent font-bold">R$</span>
            <Input 
              id="price"
              type="number" 
              step="0.01" 
              placeholder="0,00" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)}
              className="pl-10 text-xl font-bold h-14 glass focus:ring-accent"
              required
            />
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="h-14 w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enviando...</>
        ) : (
          <><CheckCircle2 className="mr-2 h-5 w-5" /> Confirmar Atualização</>
        )}
      </Button>
      
      <p className="text-[10px] text-center text-muted-foreground">
        Cada envio é anônimo e ajuda a construir um índice de preços descentralizado.
      </p>
    </form>
  );
}
