import { useNavigate } from 'react-router-dom';
import Hero from '@/components/home/Hero';
import StatePropertySearch from '@/components/home/StatePropertySearch';
import ServicesPreview from '@/components/home/ServicesPreview';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import StatsSection from '@/components/home/StatsSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import CTABanner from '@/components/home/CTABanner';
import RecommendationFeed from '@/components/taste/RecommendationFeed';

export default function Home() {
  const navigate = useNavigate();

  const handleShowSimilar = (property) => {
    const params = new URLSearchParams();
    if (property.property_type) params.set('propertyType', property.property_type);
    if (property.state) params.set('state', property.state);
    navigate(`/marketplace?${params.toString()}`);
  };

  return (
    <>
      <Hero />
      <StatePropertySearch />
      <ServicesPreview />
      <FeaturedProperties />
      <RecommendationFeed onShowSimilar={handleShowSimilar} />
      <StatsSection />
      <WhyChooseUs />
      <CTABanner />
    </>
  );
}