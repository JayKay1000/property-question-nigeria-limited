import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Tag, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PricingIntelligence() {
  const [priceHistory, setPriceHistory] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.PriceHistory.list('-created_date', 20).catch(() => []),
      base44.entities.PropertyPromotion.list('-created_date', 15).catch(() => []),
      base44.entities.PropertyPricing.list('-created_date', 15).catch(() => []),
    ]).then(([history, promos, prices]) => {
      setPriceHistory(history); setPromotions(promos); setPricing(prices);
    }).finally(() => setLoading(false));
  }, []);

  const activePromos = promotions.filter((p) => p.is_active);
  const priceIncreases = priceHistory.filter((p) => p.change_type === 'increase').length;
  const priceDecreases = priceHistory.filter((p) => p.change_type === 'decrease').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><TrendingUp className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{priceIncreases}</p><p className="text-xs text-muted-foreground">Price Increases</p></CardContent></Card>
        <Card><CardContent className="p-4"><TrendingDown className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{priceDecreases}</p><p className="text-xs text-muted-foreground">Price Decreases</p></CardContent></Card>
        <Card><CardContent className="p-4"><Tag className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{activePromos.length}</p><p className="text-xs text-muted-foreground">Active Promotions</p></CardContent></Card>
        <Card><CardContent className="p-4"><DollarSign className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{pricing.length}</p><p className="text-xs text-muted-foreground">Pricing Records</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-brand-700" /> Recent Price Changes</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : priceHistory.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No price changes recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {priceHistory.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    {h.change_type === 'increase' ? <TrendingUp className="h-4 w-4 text-success" /> : h.change_type === 'decrease' ? <TrendingDown className="h-4 w-4 text-destructive" /> : <DollarSign className="h-4 w-4 text-muted-foreground" />}
                    <div><p className="text-sm font-medium">{h.property_title || 'Property'}</p><p className="text-xs text-muted-foreground">₦{(h.previous_price || 0).toLocaleString()} → ₦{(h.new_price || 0).toLocaleString()}</p></div>
                  </div>
                  <div className="text-right"><Badge variant="outline" className="text-xs capitalize">{(h.change_type || '').replace(/_/g, ' ')}</Badge>{h.change_percentage && <p className="mt-1 text-xs font-medium text-muted-foreground">{h.change_percentage > 0 ? '+' : ''}{h.change_percentage.toFixed(1)}%</p>}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Tag className="h-4 w-4 text-flame-600" /> Active Promotions</CardTitle></CardHeader>
        <CardContent>
          {activePromos.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No active promotions.</p> : (
            <div className="space-y-2">
              {activePromos.map((promo) => (
                <div key={promo.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div><p className="text-sm font-medium">{promo.promotion_name}</p><p className="text-xs text-muted-foreground">{promo.property_title || 'Property'} · {promo.promotion_type.replace(/_/g, ' ')}</p></div>
                  <div className="text-right">
                    {promo.discount_percentage && <Badge className="bg-flame-500 text-xs">-{promo.discount_percentage}%</Badge>}
                    {promo.promotional_price && <p className="mt-1 text-xs font-bold">₦{promo.promotional_price.toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}