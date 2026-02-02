'use client';

import { motion } from 'framer-motion';
import { Shield, CreditCard, Trophy, Users, Globe, Award } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    id: 1,
    icon: <CreditCard className="w-6 h-6" />,
    title: 'Official ID Card',
    description: 'Get your official SSFI membership card with unique identification number',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    icon: <Trophy className="w-6 h-6" />,
    title: 'National Recognition',
    description: 'Participate in nationally recognized skating championships and events',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    icon: <Shield className="w-6 h-6" />,
    title: 'Insurance Coverage',
    description: 'Comprehensive insurance coverage for all registered athletes',
    color: 'from-accent-500 to-emerald-500',
  },
  {
    id: 4,
    icon: <Users className="w-6 h-6" />,
    title: 'Expert Coaching',
    description: 'Access to certified coaches and training programs nationwide',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 5,
    icon: <Globe className="w-6 h-6" />,
    title: 'International Events',
    description: 'Opportunities to represent India in international competitions',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 6,
    icon: <Award className="w-6 h-6" />,
    title: 'Certificates & Awards',
    description: 'Digital certificates and awards for all event participations',
    color: 'from-yellow-500 to-amber-500',
  },
];

const WhyJoinSSFI = () => {
  return (
    <section className="relative py-24 bg-dark-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              {/* Placeholder - Replace with actual image */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20" />
              <Image
                src="/images/why-join.jpg"
                alt="SSFI Athletes"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              {/* Overlay Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute bottom-6 left-6 right-6 bg-dark-900/90 backdrop-blur-xl rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-3xl font-bold text-white">10,000+</p>
                    <p className="text-sm text-gray-400">Active Members</p>
                  </div>
                  <div className="h-12 w-px bg-white/10" />
                  <div>
                    <p className="text-3xl font-bold text-white">28</p>
                    <p className="text-sm text-gray-400">State Associations</p>
                  </div>
                  <div className="h-12 w-px bg-white/10" />
                  <div>
                    <p className="text-3xl font-bold text-white">500+</p>
                    <p className="text-sm text-gray-400">Affiliated Clubs</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute -top-6 -right-6 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-6 shadow-2xl shadow-accent-500/50"
            >
              <Trophy className="w-12 h-12 text-white mb-2" />
              <p className="text-sm font-bold text-white">Official</p>
              <p className="text-xs text-white/80">Federation</p>
            </motion.div>
          </motion.div>

          {/* Right: Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary-500/10 text-primary-400 text-sm font-semibold mb-4 border border-primary-500/20">
              Why Choose Us
            </span>
            
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Why Join SSFI?
            </h2>
            
            <p className="text-xl text-gray-400 mb-12">
              Be part of India's premier skating federation and unlock exclusive benefits for your skating journey.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="group relative"
                >
                  <div className="relative rounded-xl bg-dark-800/50 p-6 border border-white/5 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
                    {/* Icon */}
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyJoinSSFI;
