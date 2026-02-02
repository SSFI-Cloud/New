'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  User,
  Home,
  Shield,
  Users,
  MapPin,
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
} from 'lucide-react';

import { useRegistrationStore } from '@/lib/store/registrationStore';
import { useRegisterStudent } from '@/lib/hooks/useStudent';
import { registrationSchema } from '@/lib/validations/student';
import type { StudentRegistrationData } from '@/types/student';

import PersonalInfoStep from './steps/PersonalInfoStep';
import FamilySchoolStep from './steps/FamilySchoolStep';
import NomineeStep from './steps/NomineeStep';
import ClubCoachStep from './steps/ClubCoachStep';
import AddressStep from './steps/AddressStep';
import DocumentsStep from './steps/DocumentsStep';

// Step configuration
const STEPS = [
  { id: 1, title: 'Personal Info', icon: User, description: 'Basic details' },
  { id: 2, title: 'Family & School', icon: Home, description: 'Guardian & education' },
  { id: 3, title: 'Nominee', icon: Shield, description: 'Insurance nominee' },
  { id: 4, title: 'Club & Coach', icon: Users, description: 'Training details' },
  { id: 5, title: 'Address', icon: MapPin, description: 'Location details' },
  { id: 6, title: 'Documents', icon: FileText, description: 'Upload & verify' },
];

export default function StudentRegistrationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    currentStep,
    formData,
    completedSteps,
    setCurrentStep,
    nextStep,
    prevStep,
    markStepComplete,
    resetForm,
  } = useRegistrationStore();

  const { registerStudent, isLoading, error } = useRegisterStudent();

  // Handle step completion
  const handleStepComplete = (stepData: Partial<StudentRegistrationData>) => {
    markStepComplete(currentStep);

    if (currentStep < 6) {
      nextStep();
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate all data
      const validationResult = registrationSchema.safeParse(formData);

      if (!validationResult.success) {
        const errors = validationResult.error.issues;
        toast.error(errors[0]?.message || 'Please check all required fields');
        return;
      }

      // Submit registration
      const student = await registerStudent(formData as StudentRegistrationData);

      toast.success('Registration submitted successfully!');

      // Reset form and redirect
      resetForm();
      router.push(`/registration-success?uid=${student.uid}`);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep onComplete={handleStepComplete} />;
      case 2:
        return <FamilySchoolStep onComplete={handleStepComplete} />;
      case 3:
        return <NomineeStep onComplete={handleStepComplete} />;
      case 4:
        return <ClubCoachStep onComplete={handleStepComplete} />;
      case 5:
        return <AddressStep onComplete={handleStepComplete} />;
      case 6:
        return <DocumentsStep onComplete={handleStepComplete} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Skater Registration
          </h1>
          <p className="text-slate-400">
            Join the Skating Sports Federation of India
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="hidden md:flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-700">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / 5) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              const isAccessible = step.id <= currentStep || isCompleted;

              return (
                <button
                  key={step.id}
                  onClick={() => isAccessible && setCurrentStep(step.id)}
                  disabled={!isAccessible}
                  className={`relative z-10 flex flex-col items-center group ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                          ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium transition-colors ${isCurrent
                        ? 'text-white'
                        : isCompleted
                          ? 'text-green-400'
                          : 'text-slate-500'
                      }`}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile progress */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-400">
                Step {currentStep} of 6
              </span>
              <span className="text-sm font-medium text-white">
                {STEPS[currentStep - 1].title}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / 6) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl"
        >
          {/* Step header */}
          <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border-b border-slate-700/50 px-6 py-4">
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = STEPS[currentStep - 1].icon;
                return <Icon className="w-6 h-6 text-blue-400" />;
              })()}
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {STEPS[currentStep - 1].title}
                </h2>
                <p className="text-sm text-slate-400">
                  {STEPS[currentStep - 1].description}
                </p>
              </div>
            </div>
          </div>

          {/* Form content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="bg-slate-800/80 border-t border-slate-700/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${currentStep === 1
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`w-2 h-2 rounded-full transition-all ${step.id === currentStep
                        ? 'w-6 bg-blue-500'
                        : completedSteps.includes(step.id)
                          ? 'bg-green-500'
                          : 'bg-slate-600'
                      }`}
                  />
                ))}
              </div>

              {currentStep < 6 ? (
                <button
                  type="submit"
                  form={`step-${currentStep}-form`}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>

        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-slate-500 text-sm mt-6"
        >
          Need help? Contact support at{' '}
          <a href="mailto:support@ssfi.in" className="text-blue-400 hover:underline">
            support@ssfi.in
          </a>
        </motion.p>
      </div>
    </div>
  );
}
