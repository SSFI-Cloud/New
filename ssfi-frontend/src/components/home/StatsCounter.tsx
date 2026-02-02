'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Users, Trophy, MapPin, Award } from 'lucide-react';

interface Stat {
  id: number;
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
  color: string;
}

const stats: Stat[] = [
  {
    id: 1,
    label: 'States',
    value: 28,
    suffix: '+',
    icon: <MapPin className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    label: 'Registered Clubs',
    value: 500,
    suffix: '+',
    icon: <Award className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    label: 'Active Skaters',
    value: 10000,
    suffix: '+',
    icon: <Users className="w-8 h-8" />,
    color: 'from-accent-500 to-emerald-500',
  },
  {
    id: 4,
    label: 'Events This Year',
    value: 150,
    suffix: '+',
    icon: <Trophy className="w-8 h-8" />,
    color: 'from-orange-500 to-red-500',
  },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toLocaleString();
      }
    });

    return () => unsubscribe();
  }, [springValue]);

  return (
    <span ref={ref} className="tabular-nums">
      0
    </span>
  );
}

const StatsCounter = () => {
  return (
    <section className="relative py-20 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary-500/10 text-primary-400 text-sm font-semibold mb-4 border border-primary-500/20">
            Our Impact
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Skating Across India
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Building the largest skating community in the nation
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full rounded-2xl bg-gradient-to-br from-dark-700/50 to-dark-800/50 p-8 backdrop-blur-sm border border-white/5 overflow-hidden">
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-6 relative z-10`}>
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>

                {/* Number */}
                <div className="mb-2 relative z-10">
                  <h3 className="text-5xl font-display font-bold text-white">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    <span className="text-3xl">{stat.suffix}</span>
                  </h3>
                </div>

                {/* Label */}
                <p className="text-gray-400 text-lg font-medium relative z-10">
                  {stat.label}
                </p>

                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
