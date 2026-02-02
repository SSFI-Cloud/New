'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { FileText, Upload, Camera, X, Check, Loader2, CreditCard } from 'lucide-react';
import { useRegistrationStore } from '@/lib/store/registrationStore';

// Local schema that matches the form fields
const formSchema = z.object({
  photoFile: z.any().optional(),
  aadhaarFile: z.any().optional(),
  birthCertificateFile: z.any().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept terms'),
});

type FormData = z.infer<typeof formSchema>;

interface DocumentsStepProps {
  onComplete: (data: FormData) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function DocumentsStep({ onComplete, onSubmit, isSubmitting }: DocumentsStepProps) {
  const { formData, updateFormData, setPreview, previews } = useRegistrationStore();
  const [termsAccepted, setTermsAccepted] = useState(formData.termsAccepted || false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(previews.profilePhoto || null);
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(previews.aadhaarCard || null);
  const [certPreview, setCertPreview] = useState<string | null>(previews.birthCertificate || null);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      termsAccepted: false,
    },
  });

  const handleFileSelect = (
    field: 'photoFile' | 'aadhaarFile' | 'birthCertificateFile',
    setPreviewFn: (url: string | null) => void
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewFn(base64);
        setValue(field, base64);

        const storeField = field === 'photoFile'
          ? 'profilePhoto'
          : field === 'aadhaarFile'
            ? 'aadhaarCard'
            : 'birthCertificate';
        setPreview(storeField as keyof typeof previews, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (
    field: 'photoFile' | 'aadhaarFile' | 'birthCertificateFile',
    setPreviewFn: (url: string | null) => void
  ) => {
    setPreviewFn(null);
    setValue(field, undefined);
    const storeField = field === 'photoFile'
      ? 'profilePhoto'
      : field === 'aadhaarFile'
        ? 'aadhaarCard'
        : 'birthCertificate';
    setPreview(storeField as keyof typeof previews, null);
  };

  const onFormSubmit = (data: FormData) => {
    if (!termsAccepted) return;
    updateFormData({ termsAccepted: true });
    onComplete(data);
    onSubmit();
  };

  return (
    <form id="step-6-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* File Uploads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Photo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Profile Photo <span className="text-red-400">*</span>
          </label>
          <div className="relative aspect-square rounded-xl border-2 border-dashed border-slate-600 hover:border-blue-500 transition-colors bg-slate-800/50 overflow-hidden">
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile('photoFile', setPhotoPreview)}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-400">Upload Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect('photoFile', setPhotoPreview)}
                />
              </label>
            )}
          </div>
        </div>

        {/* Aadhaar Card */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Aadhaar Card <span className="text-red-400">*</span>
          </label>
          <div className="relative aspect-square rounded-xl border-2 border-dashed border-slate-600 hover:border-blue-500 transition-colors bg-slate-800/50 overflow-hidden">
            {aadhaarPreview ? (
              <>
                <img src={aadhaarPreview} alt="Aadhaar" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile('aadhaarFile', setAadhaarPreview)}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                <CreditCard className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-400">Upload Aadhaar</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleFileSelect('aadhaarFile', setAadhaarPreview)}
                />
              </label>
            )}
          </div>
        </div>

        {/* Birth Certificate */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Birth Certificate
          </label>
          <div className="relative aspect-square rounded-xl border-2 border-dashed border-slate-600 hover:border-blue-500 transition-colors bg-slate-800/50 overflow-hidden">
            {certPreview ? (
              <>
                <img src={certPreview} alt="Certificate" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile('birthCertificateFile', setCertPreview)}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                <FileText className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-400">Optional</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleFileSelect('birthCertificateFile', setCertPreview)}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Photo Guidelines */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
        <h4 className="font-medium text-slate-300 mb-2">Photo Guidelines</h4>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• Recent passport-size photo with plain background</li>
          <li>• Aadhaar card: clear scan with all details visible</li>
          <li>• Max file size: 5MB per file</li>
        </ul>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              setValue('termsAccepted', e.target.checked);
              updateFormData({ termsAccepted: e.target.checked });
            }}
            className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-900/50 text-blue-500"
          />
          <div>
            <p className="text-sm text-slate-300">
              I hereby declare that all information provided is true and correct.
              I agree to the Terms & Conditions and Privacy Policy of SSFI.
            </p>
          </div>
        </label>
        {errors.termsAccepted && (
          <p className="mt-2 text-sm text-red-400">{errors.termsAccepted.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={!termsAccepted || isSubmitting}
        whileHover={{ scale: termsAccepted && !isSubmitting ? 1.02 : 1 }}
        whileTap={{ scale: termsAccepted && !isSubmitting ? 0.98 : 1 }}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${termsAccepted && !isSubmitting
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25'
            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting Registration...
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            Submit Registration
          </>
        )}
      </motion.button>

      {!termsAccepted && (
        <p className="text-center text-sm text-amber-400">
          Please accept the terms and conditions to submit
        </p>
      )}
    </form>
  );
}
