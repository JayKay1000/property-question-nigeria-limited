import React from 'react';
import PageHero from '@/components/marketing/PageHero';
import { Card } from '@/components/ui/card';

export default function PrivacyPolicy() {
  const sections = [
    { title: 'Introduction', content: 'Property Question Nigeria Limited ("we", "our", "us") is committed to protecting the privacy of visitors to our website and users of our services. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information in accordance with the Nigeria Data Protection Regulation (NDPR) and other applicable laws.' },
    { title: 'Information We Collect', content: 'We collect information you provide directly to us, such as when you fill out forms for consultations, enquiries, newsletter subscriptions, or contact us. This includes your name, email address, phone number, and any message content. We also automatically collect certain technical information such as IP address, browser type, and usage data through cookies and similar technologies.' },
    { title: 'How We Use Your Information', content: 'We use your personal information to respond to your enquiries, provide services you request, send you communications you have opted into, improve our website and services, comply with legal obligations, and protect our rights and interests. We do not sell your personal information to third parties.' },
    { title: 'Information Sharing', content: 'We may share your information with trusted third-party service providers who assist us in operating our website and conducting business, such as hosting providers, analytics services, and CRM platforms. We may also disclose information when required by law or to protect our legal rights.' },
    { title: 'Data Security', content: 'We implement appropriate technical, administrative, and physical security measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.' },
    { title: 'Cookies', content: 'We use cookies and similar tracking technologies to enhance your browsing experience, analyse website traffic, and personalise content. You can control cookies through your browser settings. See our Cookie Policy for more information.' },
    { title: 'Your Rights', content: 'Under the NDPR, you have the right to access, correct, delete, or restrict the processing of your personal data. You also have the right to data portability and to object to processing. To exercise these rights, please contact us using the information provided below.' },
    { title: 'Data Retention', content: 'We retain your personal information only for as long as necessary to fulfil the purposes for which it was collected, comply with legal obligations, resolve disputes, and enforce our agreements.' },
    { title: 'Children\'s Privacy', content: 'Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.' },
    { title: 'Changes to This Policy', content: 'We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the effective date. We encourage you to review this page periodically.' },
    { title: 'Contact Us', content: 'If you have questions or concerns about this Privacy Policy or our data practices, please contact us at info@propertyquestion.net or at our office address.' },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your personal information."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]}
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