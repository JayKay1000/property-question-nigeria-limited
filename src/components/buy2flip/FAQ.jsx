import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Reveal from '@/components/ui/Reveal';

const faqs = [
  {
    q: 'What is Buy2Flip?',
    a: "Buy2Flip is Property Question Nigeria Limited's dedicated property investment and flipping platform. It connects investors with verified, high-potential properties across Nigeria, offering a transparent and secure way to participate in property flipping.",
  },
  {
    q: 'How does Buy2Flip work?',
    a: 'Browse verified property listings, review investment projections, and select opportunities that match your goals. Our team manages the acquisition, renovation, and resale process, providing real-time updates at every stage of the flip.',
  },
  {
    q: 'Is Buy2Flip a legitimate platform?',
    a: 'Yes. Buy2Flip is owned and operated by Property Question Nigeria Limited, a registered real estate company. Every listing is verified, all transactions are documented, and the platform maintains full audit trails for complete transparency.',
  },
  {
    q: 'What types of properties are available?',
    a: 'Buy2Flip features residential homes, apartments, land plots, and commercial properties across major Nigerian cities including Lagos, Abuja, and Port Harcourt — all vetted for flipping potential.',
  },
  {
    q: 'How do I get started?',
    a: "Click 'Continue to the Official Buy2Flip Platform' to visit buy2flip.net, where you can create an account, browse available opportunities, and begin your property investment journey.",
  },
  {
    q: 'Is my investment secure?',
    a: 'Buy2Flip operates on the same enterprise-grade security infrastructure as Property Question Nigeria Limited. Your data is encrypted, documents are access-controlled, and all actions are logged for full accountability.',
  },
];

export default function FAQ() {
  return (
    <section className="section-pad bg-soft-gray py-20">
      <div className="container-wide max-w-3xl">
        <Reveal>
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-flame-50 px-4 py-1.5 text-sm font-medium text-flame-600">
              FAQ
            </span>
            <h2 className="mt-4 text-3xl font-heading font-bold text-brand-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-lg border border-border bg-white px-5"
              >
                <AccordionTrigger className="text-left text-base font-heading font-semibold text-brand-900">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}