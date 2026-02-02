'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Calendar, User, Phone, Mail, Droplet } from 'lucide-react';

import { personalInfoSchema, type PersonalInfoData } from '@/lib/validations/student';
import { useRegistrationStore } from '@/lib/store/registrationStore';
import { GENDERS, BLOOD_GROUPS } from '@/types/student';
import { calculateAge, getAgeCategoryFromAge } from '@/lib/hooks/useStudent';

interface PersonalInfoStepProps {
  onComplete: (data: PersonalInfoData) => void;
}

export default function PersonalInfoStep({ onComplete }: PersonalInfoStepProps) {
  const { formData, updateFormData } = useRegistrationStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      dateOfBirth: formData.dateOfBirth || '',
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      email: formData.email || '',
      phone: formData.phone || '',
    },
  });

  const dateOfBirth = watch('dateOfBirth');
  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const ageCategory = age !== null ? getAgeCategoryFromAge(age) : null;

  const onSubmit = (data: PersonalInfoData) => {
    updateFormData(data);
    onComplete(data);
  };

  return (
    <form id="step-1-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            First Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              {...register('firstName')}
              type="text"
              placeholder="Enter first name"
              className={`w-full pl-10 pr-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.firstName
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-slate-700 focus:ring-blue-500/50 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Last Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              {...register('lastName')}
              type="text"
              placeholder="Enter last name"
              className={`w-full pl-10 pr-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.lastName
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-slate-700 focus:ring-blue-500/50 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Date of Birth & Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Date of Birth <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              {...register('dateOfBirth')}
              type="date"
              max={new Date().toISOString().split('T')[0]}
              className={`w-full pl-10 pr-4 py-3 bg-slate-900/50 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${
                errors.dateOfBirth
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-slate-700 focus:ring-blue-500/50 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-400">{errors.dateOfBirth.message}</p>
          )}
          {age !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-2"
            >
              <span className="text-sm text-slate-400">Age: {age} years</span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                {ageCategory}
              </span>
            </motion.div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Gender <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {GENDERS.map((gender) => (
              <label
                key={gender.value}
                className={`flex items-center justify-center px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                  watch('gender') === gender.value
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <input
                  {...register('gender')}
                  type="radio"
                  value={gender.value}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{gender.label}</span>
              </label>
            ))}
          </div>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-400">{errors.gender.message}</p>
          )}
        </div>
      </div>

      {/* Blood Group */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Blood Group <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {BLOOD_GROUPS.map((group) => (
            <label
              key={group}
              className={`flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                watch('bloodGroup') === group
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <input
                {...register('bloodGroup')}
                type="radio"
                value={group}
                className="sr-only"
              />
              <Droplet className="w-3 h-3 mr-1" />
              <span className="text-sm font-medium">{group}</span>
            </label>
          ))}
        </div>
        {errors.bloodGroup && (
          <p className="mt-1 text-sm text-red-400">{errors.bloodGroup.message}</p>
        )}
      </div>

      {/* Contact fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Phone Number <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 text-sm border-r border-slate-700 pr-2">
              +91
            </div>
            <input
              {...register('phone')}
              type="tel"
              placeholder="10-digit mobile number"
              maxLength={10}
              className={`w-full pl-20 pr-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.phone
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-slate-700 focus:ring-blue-500/50 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email Address <span className="text-slate-500">(Optional)</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              {...register('email')}
              type="email"
              placeholder="Enter email address"
              className={`w-full pl-10 pr-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-slate-700 focus:ring-blue-500/50 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          <strong>Note:</strong> The date of birth will be used to calculate your age category
          for competitions. Please ensure it matches your Aadhaar card.
        </p>
      </div>
    </form>
  );
}
