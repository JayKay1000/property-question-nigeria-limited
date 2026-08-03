import React from 'react';
import PageHero from '@/components/marketing/PageHero';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CookiePolicy() {
  const cookieTypes = [
    { name: 'Essential Cookies', description: 'These cookies are necessary for the website to function properly. They enable core features like page navigation and access to secure areas.', canDisable: false },
    { name: 'Performance Cookies', description: 'These cookies collect information about how visitors use our website, helping us improve site performance and user experience.', canDisable: true },
    { name: 'Functional Cookies', description: 'These cookies remember your preferences and choices to provide enhanced and personalised features.', canDisable: true },
    { name: 'Targeting Cookies', description: 'These cookies may be set by advertising partners to build a profile of your interests and show relevant ads on other sites.', canDisable: true },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Cookie Policy"
        subtitle="How we use cookies and similar technologies on our website."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cookie Policy' }]}
      />
      <section className="section-pad py-16">
        <div className="container-wide max-w-3xl">
          <p className="text-sm text-muted-foreground mb-8">Last updated: August 2026</p>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-heading font-bold mb-3">What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files stored on your device when you visit a website. They help the website
              remember your actions and preferences over time, enabling a more efficient and personalised browsing experience.
            </p>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-heading font-bold mb-3">How We Use Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Property Question Nigeria Limited uses cookies to:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li>Remember your preferences and settings</li>
              <li>Analyse website traffic and user behaviour</li>
              <li>Improve our website performance and content</li>
              <li>Provide personalised content and advertisements</li>
              <li>Facilitate secure authentication</li>
            </ul>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-heading font-bold mb-4">Types of Cookies We Use</h2>
            <div className="space-y-4">
              {cookieTypes.map((c) => (
                <div key={c.name} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-heading font-semibold">{c.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${c.canDisable ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'}`}>
                      {c.canDisable ? 'Optional' : 'Required'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-heading font-bold mb-3">Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You can control and manage cookies through your browser settings. Most browsers allow you to refuse
              cookies or alert you when cookies are being sent. Please note that disabling some cookies may affect
              the functionality of our website.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For information on managing cookies in your specific browser, please refer to the browser's help documentation.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-heading font-bold mb-3">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may update this Cookie Policy from time to time. We will notify you of significant changes by updating
              the "Last updated" date at the top of this page.
            </p>
            <Button asChild className="bg-flame-500 hover:bg-flame-600 text-white border-0">
              <a href="/contact">Contact Us About Cookies</a>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}