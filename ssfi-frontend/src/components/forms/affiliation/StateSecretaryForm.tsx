'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Upload,
  Camera,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

import { useStateSecretaryRegistration, useRegistrationStatus } from '@/lib/hooks/useAffiliation';
import { useStates } from '@/lib/hooks/useStudent';
import type { StateSecretaryFormData } from '@/types/affiliation';
import { GENDERS, formatRegistrationDate, getDaysRemaining } from '@/types/affiliation';

// Validation Schema
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar number must be 12 digits'),
  stateId: z.string().min(1, 'Please select a state'),
  residentialAddress: z.string().min(10, 'Address must be at least 10 characters').max(500),
  identityProof: z.string().min(1, 'Identity proof is required'),
  profilePhoto: z.string().min(1, 'Profile photo is required'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function StateSecretaryRegistrationForm() {
  const router = useRouter();
  const [identityPreview, setIdentityPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const identityInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { register: registerSecretary, isLoading } = useStateSecretaryRegistration();
  const { fetchStatus, data: registrationStatus } = useRegistrationStatus();
  const { fetchStates, data: states } = useStates();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'MALE',
    },
  });

  useEffect(() => {
    fetchStatus('STATE_SECRETARY');
    fetchStates();
  }, [fetchStatus, fetchStates]);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'identityProof' | 'profilePhoto',
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        setValue(field, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (field: 'identityProof' | 'profilePhoto', setPreview: (url: string | null) => void) => {
    setPreview(null);
    setValue(field, '');
  };

  const onSubmit = async (data: FormData) => {
    try {
      const result = await registerSecretary(data as StateSecretaryFormData);
      toast.success('Registration submitted successfully!');
      router.push(`/register/success?type=state-secretary&uid=${result.uid}`);
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4">
            <MapPin className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">State Secretary Registration</h1>
          <p className="text-slate-400">Fill in the details below to register as a State Secretary</p>

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
          {/* Personal Details */}
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Personal Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-blue-500/50'
                    }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gender <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  {GENDERS.map((g) => (
                    <label
                      key={g.value}
                      className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border cursor-pointer transition-all ${watch('gender') === g.value
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                    >
                      <input {...register('gender')} type="radio" value={g.value} className="sr-only" />
                      <span className="text-sm font-medium">{g.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="your@email.com"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-blue-500/50'
                      }`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
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
                {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Aadhaar Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    {...register('aadhaarNumber')}
                    type="text"
                    placeholder="12-digit Aadhaar number"
                    maxLength={12}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.aadhaarNumber ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-blue-500/50'
                      }`}
                  />
                </div>
                {errors.aadhaarNumber && <p className="mt-1 text-sm text-red-400">{errors.aadhaarNumber.message}</p>}
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
                {errors.stateId && <p className="mt-1 text-sm text-red-400">{errors.stateId.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Residential Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  {...register('residentialAddress')}
                  rows={3}
                  placeholder="Enter your complete residential address"
                  className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 resize-none ${errors.residentialAddress ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-blue-500/50'
                    }`}
                />
                {errors.residentialAddress && <p className="mt-1 text-sm text-red-400">{errors.residentialAddress.message}</p>}
              </div>
            </div>
          </div>

          {/* Identity Details */}
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-400" />
              Identity Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Identity Proof */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Identity Proof (Aadhaar/Voter ID) <span className="text-red-400">*</span>
                </label>
                {identityPreview ? (
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900/50 border border-slate-700">
                    <img src={identityPreview} alt="Identity Proof" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile('identityProof', setIdentityPreview)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-500 rounded-full text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => identityInputRef.current?.click()}
                    className={`aspect-[4/3] rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${errors.identityProof
                        ? 'border-red-500/50 bg-red-500/5'
                        : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                      }`}
                  >
                    <Upload className="w-8 h-8 text-slate-500" />
                    <span className="text-sm text-slate-400">Click to upload</span>
                    <span className="text-xs text-slate-500">JPG, PNG (max 5MB)</span>
                  </div>
                )}
                <input
                  ref={identityInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileUpload(e, 'identityProof', setIdentityPreview)}
                  className="hidden"
                />
                {errors.identityProof && <p className="mt-1 text-sm text-red-400">{errors.identityProof.message}</p>}
              </div>

              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Profile Photo <span className="text-red-400">*</span>
                </label>
                {photoPreview ? (
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900/50 border border-slate-700">
                    <img src={photoPreview} alt="Profile Photo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile('profilePhoto', setPhotoPreview)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-500 rounded-full text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className={`aspect-[4/3] rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${errors.profilePhoto
                        ? 'border-red-500/50 bg-red-500/5'
                        : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                      }`}
                  >
                    <Camera className="w-8 h-8 text-slate-500" />
                    <span className="text-sm text-slate-400">Click to upload</span>
                    <span className="text-xs text-slate-500">Passport size photo</span>
                  </div>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileUpload(e, 'profilePhoto', setPhotoPreview)}
                  className="hidden"
                />
                {errors.profilePhoto && <p className="mt-1 text-sm text-red-400">{errors.profilePhoto.message}</p>}
              </div>
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
            {errors.termsAccepted && <p className="mb-4 text-sm text-red-400">{errors.termsAccepted.message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Register State Secretary
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
