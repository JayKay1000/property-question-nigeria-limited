import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { AI_FEATURES } from '@/lib/ai-utils';

export default function AIFeatureGrid({ onFeatureClick }) {
  const categories = [...new Set(AI_FEATURES.map(f => f.category))];

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const features = AI_FEATURES.filter(f => f.category === category);
        return (
          <div key={category}>
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">{category}</h4>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card
                  key={feature.code}
                  className="cursor-pointer transition-all hover:shadow-card-hover"
                  onClick={() => onFeatureClick?.(feature)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${feature.color}15` }}>
                        <Sparkles className="h-5 w-5" style={{ color: feature.color }} />
                      </div>
                      {feature.enabled && (
                        <Badge className="bg-success/15 text-success">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                        </Badge>
                      )}
                    </div>
                    <h5 className="mt-3 text-sm font-semibold">{feature.name}</h5>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}