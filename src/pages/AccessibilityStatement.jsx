import React from 'react';
import PageHero from '@/components/marketing/PageHero';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function AccessibilityStatement() {
  const standards = [
    'Keyboard navigation support across all interactive elements',
    'Screen reader compatibility with ARIA labels and semantic HTML',
    'High contrast colour schemes meeting WCAG 2.2 AA standards',
    'Text alternatives for all non-text content including images',
    'Captions and transcripts for multimedia content',
    'Resize text up to 200% without loss of content or functionality',
    'No content that flashes more than three times per second',
    'Descriptive headings and labels for all form fields',
    'Skip-to-content links for efficient navigation',
    'Consistent navigation and identification of pages',
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Accessibility Statement"
        subtitle="Our commitment to making our website accessible to everyone, including people with disabilities."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Accessibility' }]}
      />
      <section className="section-pad py-16">
        <div className="container-wide max-w-3xl">
          <p className="text-sm text-muted-foreground mb-8">Last updated: August 2026</p>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-heading font-bold mb-3">Our Commitment</h2>
            <p className="text-muted-foreground leading-relaxed">
              Property Question Nigeria Limited is committed to ensuring digital accessibility for people with
              disabilities. We are continuously improving the user experience for everyone and applying the relevant
              accessibility standards to ensure our website is inclusive and usable by all.
            </p>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-heading font-bold mb-3">Conformance Status</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA. These
              guidelines explain how to make web content more accessible for people with disabilities, and more
              user-friendly for everyone.
            </p>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-heading font-bold mb-4">Accessibility Features</h2>
            <div className="space-y-3">
              {standards.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{s}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-heading font-bold mb-3">Reduced Motion</h2>
            <p className="text-muted-foreground leading-relaxed">
              We respect the "prefers-reduced-motion" setting. When enabled in your operating system or browser,
              non-essential animations and transitions are minimised for users who are sensitive to motion.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-heading font-bold mb-3">Feedback & Contact</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We welcome your feedback on the accessibility of our website. If you experience any difficulty accessing
              any part of our website, or if you have suggestions for improvement, please contact us:
            </p>
            <ul className="space-y-1 text-muted-foreground">
              <li>Email: <a href="mailto:accessibility@propertyquestion.net" className="text-flame-600 hover:underline">accessibility@propertyquestion.net</a></li>
              <li>Phone: +234 903 339 3000</li>
            </ul>
            <p className="text-muted-foreground mt-4 text-sm">
              We aim to respond to accessibility feedback within 5 business days.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}