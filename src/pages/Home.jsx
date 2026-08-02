import Hero from '@/components/home/Hero';
import ServicesPreview from '@/components/home/ServicesPreview';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import StatsSection from '@/components/home/StatsSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import LocationsSection from '@/components/home/LocationsSection';
import CTABanner from '@/components/home/CTABanner';

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesPreview />
      <FeaturedProperties />
      <StatsSection />
      <WhyChooseUs />
      <LocationsSection />
      <CTABanner />
    </>
  );
}