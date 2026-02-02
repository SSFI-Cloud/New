'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Slide {
  id: number;
  title: string;
  caption: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch slides from CMS API
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 1,
      title: 'Empowering the Future of Indian Skating',
      caption: 'Join the fastest growing skating federation in India',
      image: '/images/hero/skater-1.jpg',
      ctaText: 'Register Now',
      ctaLink: '/register',
    },
    {
      id: 2,
      title: 'National Championships 2026',
      caption: 'Registration open for upcoming national events',
      image: '/images/hero/skater-2.jpg',
      ctaText: 'View Events',
      ctaLink: '/events',
    },
    {
      id: 3,
      title: '10,000+ Registered Athletes',
      caption: 'Be part of India\'s largest skating community',
      image: '/images/hero/skater-3.jpg',
      ctaText: 'Join Now',
      ctaLink: '/register',
    },
  ]);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="relative h-screen overflow-hidden bg-dark-900">
      {/* Background Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Image */}
          <div className="absolute inset-0">
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              fill
              className="object-cover"
              priority
              quality={90}
            />
          </div>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 via-dark-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />
          
          {/* Accent Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20 mix-blend-overlay" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative z-10 h-full">
        <div className="container mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-full flex-col justify-center max-w-3xl">
            {/* Animated Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Subtitle */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="inline-block"
                >
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/20 px-4 py-2 text-sm font-semibold text-accent-400 backdrop-blur-sm border border-accent-500/30">
                    <Play className="w-4 h-4" />
                    {slides[currentSlide].caption}
                  </span>
                </motion.div>

                {/* Main Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white leading-tight"
                >
                  {slides[currentSlide].title}
                </motion.h1>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex flex-wrap gap-4 pt-4"
                >
                  <Link
                    href={slides[currentSlide].ctaLink}
                    className="group relative inline-flex items-center gap-2 rounded-lg bg-accent-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-accent-500/50 transition-all duration-300 hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-500/60 hover:-translate-y-0.5"
                  >
                    {slides[currentSlide].ctaText}
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/events"
                    className="group inline-flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:border-white/50"
                  >
                    View Events
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-12 left-0 right-0"
            >
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'w-12 bg-accent-500'
                          : 'w-8 bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 pointer-events-none">
        <button
          onClick={prevSlide}
          className="pointer-events-auto group rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-white transition-transform duration-300 group-hover:-translate-x-0.5" />
        </button>

        <button
          onClick={nextSlide}
          className="pointer-events-auto group rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-white transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-white/60">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-white"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
