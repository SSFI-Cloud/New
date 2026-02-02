'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  Users,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Hash,
  Calendar,
  Upload,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

import { useClubRegistration, useRegistrationStatus } from '@/lib/hooks/useAffiliation';
import { useStates, useDistricts } from '@/lib/hooks/useStudent';
import type { ClubFormData } from '@/types/affiliation';
import { formatRegistrationDate, getDaysRemaining } from '@/types/affiliation';

// Validation Schema
const formSchema = z.object({
  clubName: z.string().min(3, 'Club name must be at least 3 characters').max(200),
  registrationNumber: z.string().min(1, 'Registration number is required').max(50),
  establishedYear: z.coerce.number().min(1900, 'Invalid year').max(new Date().getFullYear(), 'Year cannot be in future'),
  contactPersonName: z.string().min(2, 'Contact person name is required').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  stateId: z.string().min(1, 'Please select a state'),
  districtId: z.string().min(1, 'Please select a district'),
  address: z.string().min(10, 'Address must be at least 10 characters').max(500),
  clubLogo: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function ClubRegistrationForm() {
  const router = useRouter();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { register: registerClub, isLoading } = useClubRegistration();
  const { fetchStatus, data: registrationStatus } = useRegistrationStatus();
  const { fetchStates, data: states } = useStates();
  const { fetchDistricts, data: districts, clearDistricts } = useDistricts();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'ACTIVE',
      establishedYear: new Date().getFullYear(),
    },
  });

  const selectedStateId = watch('stateId');
  const selectedStatus = watch('status');

  useEffect(() => {
    fetchStatus('CLUB');
    fetchStates();
  }, [fetchStatus, fetchStates]);

  useEffect(() => {
    if (selectedStateId) {
      fetchDistricts(selectedStateId);
      setValue('districtId', '');
    } else {
      clearDistricts();
    }
  }, [selectedStateId, fetchDistricts, clearDistricts, setValue]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setValue('clubLogo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setValue('clubLogo', '');
  };

  const onSubmit = async (data: FormData) => {
    try {
      const result = await registerClub(data as ClubFormData);
      toast.success('Club registration submitted successfully!');
      router.push(`/register/success?type=club&uid=${result.uid}&code=${result.code}`);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  if (registrationStatus && !registrationStatus.isOpen) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Registration Closed</h1>
          <p className="text-slate-400 mb-6">{registrationStatus.message}</p>
          <button
            onClick={() => router.push('/register')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium"
          >
            Back to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/register')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Registration
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Club Registration</h1>
          <p className="text-slate-400">Affiliate your skating club with SSFI</p>

          {registrationStatus?.window && (
            <div className="mt-4 inline-flex items-center gap-4 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-sm">
              <span className="text-green-400">
                Open until {formatRegistrationDate(registrationStatus.window.endDate)}
              </span>
              <span className="text-amber-400">
                {getDaysRemaining(registrationStatus.window.endDate)} days remaining
              </span>
            </div>
          )}
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden"
        >
          {/* Club Details */}
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              Club Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Club Name <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('clubName')}
                  type="text"
                  placeholder="Enter club name"
                  className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.clubName ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-blue-500/50'
                    }`}
                />
                {errors.clubName && <p className="mt-1 text-sm text-red-400">{(errors.clubName as any).message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Registration Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    {...register('registrationNumber')}
                    type="text"
                    placeholder="Club registration number"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.registrationNumber ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-blue-500/50'
                      }`}
                  />
                </div>
                {errors.registrationNumber && <p className="mt-1 text-sm text-red-400">{(errors.registrationNumber as any).message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Established Year
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    {...register('establishedYear')}
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="YYYY"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.establishedYear ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-blue-500/50'
                      }`}
                  />
                </div>
                {errors.establishedYear && <p className="mt-1 text-sm text-red-400">{(errors.establishedYear as any).message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  State <span className="text-red-400">*</span>
                </label>
                <select
                  {...register('stateId')}
                  className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white focus:outline-none focus:ring-2 ${errors.stateId ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-blue-500/50'
                    }`}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.id}>{state.name}</option>
                  ))}
                </select>
                {errors.stateId && <p className="mt-1 text-sm text-red-400">{(errors.stateId as any).message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  District <span className="text-red-400">*</span>
                </label>
                <select
                  {...register('districtId')}
                  disabled={!selectedStateId}
                  className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white focus:outline-none focus:ring-2 disabled:opacity-50 ${errors.districtId ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-blue-500/50'
                    }`}
                >
                  <option value="">{selectedStateId ? 'Select District' : 'Select state first'}</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
                {errors.districtId && <p className="mt-1 text-sm text-red-400">{(errors.districtId as any).message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Club Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  {...register('address')}
                  rows={3}
                  placeholder="Enter complete club address"
                  className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 resize-none ${errors.address ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-blue-500/50'
                    }`}
                />
                {errors.address && <p className="mt-1 text-sm text-red-400">{(errors.address as any).message}</p>}
              </div>

              {/* Status */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <div className="flex gap-4">
                  {['ACTIVE', 'INACTIVE'].map((s) => (
                    <label
                      key={s}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${selectedStatus === s
                        ? s === 'ACTIVE' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-slate-700/50 border-slate-600 text-slate-400'
                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                    >
                      <input {...register('status')} type="radio" value={s} className="sr-only" />
                      <span className="text-sm font-medium">{s === 'ACTIVE' ? '● Active' : '○ Inactive'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Person Details */}
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Contact Person Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contact Person Name <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('contactPersonName')}
                  type="text"
                  placeholder="Enter contact person name"
                  className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.contactPersonName ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-blue-500/50'
                    }`}
                />
                {errors.contactPersonName && <p className="mt-1 text-sm text-red-400">{(errors.contactPersonName as any).message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 text-sm border-r border-slate-700 pr-2">+91</div>
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="10-digit number"
                    maxLength={10}
                    className={`w-full pl-20 pr-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-blue-500/50'
                      }`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-400">{(errors.phone as any).message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email <span className="text-slate-500">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="club@email.com"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-blue-500/50'
                      }`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-400">{(errors.email as any).message}</p>}
              </div>
            </div>
          </div>

          {/* Club Logo */}
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">Club Logo <span className="text-slate-500 text-sm font-normal">(Optional)</span></h2>

            <div className="max-w-xs">
              {logoPreview ? (
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900/50 border border-slate-700">
                  <img src={logoPreview} alt="Club Logo" className="w-full h-full object-contain p-4" />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-500 rounded-full text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/30 hover:border-slate-600 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all"
                >
                  <Upload className="w-8 h-8 text-slate-500" />
                  <span className="text-sm text-slate-400">Upload logo</span>
                  <span className="text-xs text-slate-500">PNG, JPG (max 2MB)</span>
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Terms & Submit */}
          <div className="p-6">
            <label className="flex items-start gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                {...register('termsAccepted')}
                className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-900/50 text-blue-500 focus:ring-blue-500/50"
              />
              <span className="text-sm text-slate-300">
                I hereby declare that all information provided is true and correct. I agree to the{' '}
                <a href="/terms" className="text-blue-400 hover:underline">Terms & Conditions</a> and{' '}
                <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>.
              </span>
            </label>
            {errors.termsAccepted && <p className="mb-4 text-sm text-red-400">{(errors.termsAccepted as any).message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Register Club
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
