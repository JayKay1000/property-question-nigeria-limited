import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHero from '@/components/marketing/PageHero';
import LeadForm from '@/components/marketing/LeadForm';
import { Card } from '@/components/ui/card';
import OfficeMap from '@/components/contact/OfficeMap';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.OfficeLocation.filter({ is_active: true }, 'sort_order', 20);
        setOffices(data);
      } catch (e) { /* empty */ }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <PageHero
        title="Contact Us"
        subtitle="Reach out to our team — whether you're buying, selling, investing, or simply exploring. We're here to help."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact Us' }]}
      />

      <section className="section-pad py-16 lg:py-24">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-heading font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-8">Fill out the form and our team will get back to you within 24 hours.</p>
            <Card className="p-6 lg:p-8">
              <LeadForm inquiryType="general" sourcePage="contact" />
            </Card>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-heading font-bold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-flame-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-flame-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <a href="tel:+2349033393000" className="text-muted-foreground hover:text-flame-600 transition-colors">+234 903 339 3000</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ice-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-ice-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a href="mailto:info@propertyquestion.net" className="text-muted-foreground hover:text-flame-600 transition-colors">info@propertyquestion.net</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">WhatsApp</p>
                    <a href="https://wa.me/2349033393000" className="text-muted-foreground hover:text-flame-600 transition-colors">+234 903 339 3000</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Business Hours</p>
                    <p className="text-muted-foreground">Mon–Fri: 8:00 AM – 6:00 PM<br />Sat: 9:00 AM – 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-heading font-bold mb-4">Our Offices</h3>
              {loading ? (
                <div className="flex justify-center"><div className="w-6 h-6 border-4 border-flame-200 border-t-flame-500 rounded-full animate-spin" /></div>
              ) : offices.length === 0 ? (
                <Card className="p-5">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-flame-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Head Office — Lagos</p>
                      <p className="text-sm text-muted-foreground">Suite 43, Ogba Shopping Arcade, Ijaiye Road, Ogba, Lagos, Nigeria</p>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {offices.map((office) => (
                    <Card key={office.id} className="p-5">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-flame-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {office.office_name}
                            {office.is_headquarters && <span className="text-xs px-2 py-0.5 rounded-full bg-flame-50 text-flame-700 font-semibold">HQ</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">{office.address_line1}, {office.city}, {office.state_code}</p>
                          {office.phone && <p className="text-sm text-muted-foreground mt-1">{office.phone}</p>}
                          {office.business_hours && <p className="text-xs text-muted-foreground mt-1">{office.business_hours}</p>}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="bg-ice-50 relative overflow-hidden">
        <div className="container-wide section-pad py-12">
          <h3 className="text-2xl font-heading font-bold text-center mb-2">Find Us on the Map</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-2xl mx-auto">Visit our headquarters in Ogba, Lagos. Click the pin for office details.</p>
          <div className="overflow-hidden rounded-2xl border border-border shadow-lg">
            <OfficeMap offices={offices} height={420} />
          </div>
        </div>
      </section>
    </div>
  );
}