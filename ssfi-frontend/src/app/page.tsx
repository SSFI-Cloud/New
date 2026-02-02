'use client';

import HeroSection from '@/components/home/HeroSection';
import StatsCounter from '@/components/home/StatsCounter';
import FeaturedEvents from '@/components/home/FeaturedEvents';
import WhyJoinSSFI from '@/components/home/WhyJoinSSFI';
import NewsSection from '@/components/home/NewsSection';
import SponsorsMarquee from '@/components/home/SponsorsMarquee';
import CTASection from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Counter */}
      <StatsCounter />

      {/* Why Join SSFI */}
      <WhyJoinSSFI />

      {/* Featured Events */}
      <FeaturedEvents />

      {/* Latest News */}
      <NewsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Sponsors */}
      <SponsorsMarquee />
    </main>
  );
}
