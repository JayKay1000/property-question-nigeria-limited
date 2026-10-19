import Hero from '@/components/home/Hero';
import StatePropertySearch from '@/components/home/StatePropertySearch';
import ServicesPreview from '@/components/home/ServicesPreview';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import StatsSection from '@/components/home/StatsSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import CTABanner from '@/components/home/CTABanner';

export default function Home() {
  return (
    <>
      <Hero />
      <StatePropertySearch />
      <ServicesPreview />
      <FeaturedProperties />
      <StatsSection />
      <WhyChooseUs />
      <CTABanner />
    </>
  );
}