import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHero from '@/components/marketing/PageHero';
import CTASection from '@/components/marketing/CTASection';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { HelpCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const categoryLabels = {
  general: 'General',
  property: 'Property Listings',
  project: 'Projects',
  buy2flip: 'Buy2Flip',
  agent: 'Agents',
  owner: 'Property Owners',
  payment: 'Payments',
  construction: 'Construction',
  legal: 'Legal',
  tour: 'Tours',
};

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.FAQ.filter({ is_active: true }, 'sort_order', 50);
        setFaqs(data); setFiltered(data);
      } catch (e) { /* empty */ }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    let result = faqs;
    if (activeCat !== 'all') result = result.filter((f) => f.category === activeCat);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [faqs, search, activeCat]);

  const categories = ['all', ...Object.keys(categoryLabels)];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Frequently Asked Questions"
        subtitle="Find answers to the most common questions about our services, properties, and processes."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]}
      />

      <section className="section-pad py-16 lg:py-24">
        <div className="container-wide max-w-4xl">
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={activeCat === cat ? 'default' : 'outline'}
                  className={activeCat === cat ? 'bg-flame-500 text-white border-0' : ''}
                  onClick={() => setActiveCat(cat)}
                >
                  {cat === 'all' ? 'All' : categoryLabels[cat]}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center"><div className="w-8 h-8 border-4 border-flame-200 border-t-flame-500 rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No questions found. Try a different search or category.</p>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {filtered.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border rounded-xl px-5 bg-card">
                  <AccordionTrigger className="text-left font-heading font-semibold text-base hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>

      <CTASection
        title="Still Have Questions?"
        subtitle="Our team is ready to help with any enquiry you have. Don't hesitate to reach out."
        primaryLabel="Contact Us"
        secondaryLabel="Browse Properties"
      />
    </div>
  );
}