import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHero from '@/components/marketing/PageHero';
import { Card } from '@/components/ui/card';
import { Star, Quote, MapPin } from 'lucide-react';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Testimonial.filter({ is_active: true, is_approved: true }, 'sort_order', 50);
        setTestimonials(data);
      } catch (e) { /* empty */ }
      setLoading(false);
    })();
  }, []);

  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.length).toFixed(1)
    : '5.0';

  return (
    <div className="min-h-screen">
      <PageHero
        title="Client Testimonials"
        subtitle="Don't just take our word for it. Hear what our clients say about their experience with Property Question Nigeria Limited."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Testimonials' }]}
      />

      <section className="section-pad py-16 lg:py-24">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`w-8 h-8 ${i <= Math.round(parseFloat(avgRating)) ? 'text-flame-500 fill-flame-500' : 'text-border'}`} />
                ))}
              </div>
            </div>
            <p className="text-2xl font-heading font-bold">{avgRating} out of 5</p>
            <p className="text-muted-foreground">Based on {testimonials.length || 0} client reviews</p>
          </div>

          {loading ? (
            <div className="flex justify-center"><div className="w-8 h-8 border-4 border-flame-200 border-t-flame-500 rounded-full animate-spin" /></div>
          ) : testimonials.length === 0 ? (
            <Card className="p-12 text-center max-w-2xl mx-auto">
              <Quote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Testimonials will be displayed here as our clients share their experiences.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <Card key={t.id} className="p-7 relative hover:shadow-card-hover transition-shadow">
                  <Quote className="w-10 h-10 text-flame-200 absolute top-5 right-5" />
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={`w-4 h-4 ${i <= (t.rating || 5) ? 'text-flame-500 fill-flame-500' : 'text-border'}`} />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6 relative z-10">"{t.testimonial_text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t">
                    {t.client_photo_url ? (
                      <img src={t.client_photo_url} alt={t.client_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-flame-100 to-flame-200 flex items-center justify-center text-flame-700 font-heading font-bold text-lg">
                        {t.client_name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-heading font-semibold">{t.client_name}</p>
                      {t.client_title && <p className="text-sm text-muted-foreground">{t.client_title}{t.client_company ? `, ${t.client_company}` : ''}</p>}
                      {t.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.location}</p>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}