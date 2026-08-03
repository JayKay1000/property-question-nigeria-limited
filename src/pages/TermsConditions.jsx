import React from 'react';
import PageHero from '@/components/marketing/PageHero';
import { Card } from '@/components/ui/card';

export default function TermsConditions() {
  const sections = [
    { title: 'Acceptance of Terms', content: 'By accessing and using the Property Question Nigeria Limited website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website or services.' },
    { title: 'Definitions', content: '"Company" refers to Property Question Nigeria Limited. "Website" refers to propertyquestion.com. "Services" refers to our real estate, construction, property management, and advisory services. "User" refers to any individual who accesses or uses our website or services.' },
    { title: 'Use of Website', content: 'You may use our website for lawful purposes only. You agree not to use the website in any way that could damage, disable, or impair the site, or interfere with any other user\'s use. Unlawful, harmful, or fraudulent activities are strictly prohibited.' },
    { title: 'Property Listings', content: 'While we strive to provide accurate and up-to-date information about properties, we do not guarantee the accuracy, completeness, or timeliness of property listings. All information is provided "as is" and users should verify property details independently before making any decisions.' },
    { title: 'User Accounts', content: 'If you register for an account, you are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. You must be at least 18 years old to create an account.' },
    { title: 'Intellectual Property', content: 'All content on this website, including text, graphics, logos, images, and software, is the property of Property Question Nigeria Limited or its content suppliers and is protected by Nigerian and international copyright laws. Unauthorised use is prohibited.' },
    { title: 'Limitation of Liability', content: 'Property Question Nigeria Limited shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of or inability to use our website or services. We provide our services on an "as is" and "as available" basis.' },
    { title: 'Indemnification', content: 'You agree to indemnify and hold harmless Property Question Nigeria Limited, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of our website or violation of these terms.' },
    { title: 'Third-Party Links', content: 'Our website may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of these external sites. Accessing them is at your own risk.' },
    { title: 'Transactions', content: 'Any property transactions, purchases, or agreements are subject to separate contracts and terms specific to each transaction. These Terms and Conditions do not override any specific agreement you enter into with the Company.' },
    { title: 'Governing Law', content: 'These Terms and Conditions are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of the courts of Nigeria.' },
    { title: 'Changes to Terms', content: 'We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on this page. Continued use of the website constitutes acceptance of the modified terms.' },
    { title: 'Contact', content: 'For questions about these Terms and Conditions, please contact us at info@propertyquestion.net.' },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Terms & Conditions"
        subtitle="The terms governing your use of our website and services."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Terms & Conditions' }]}
      />
      <section className="section-pad py-16">
        <div className="container-wide max-w-3xl">
          <p className="text-sm text-muted-foreground mb-8">Last updated: August 2026</p>
          <div className="space-y-6">
            {sections.map((s, i) => (
              <Card key={i} className="p-6">
                <h2 className="text-xl font-heading font-bold mb-3">{i + 1}. {s.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{s.content}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}