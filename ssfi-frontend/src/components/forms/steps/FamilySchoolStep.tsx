'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegistrationStore } from '@/lib/store/registrationStore';

const schema = z.object({
    fatherName: z.string().min(2, 'Father name is required'),
    motherName: z.string().min(2, 'Mother name is required'),
    guardianPhone: z.string().length(10, 'Enter valid 10-digit phone'),
    guardianEmail: z.string().email().optional().or(z.literal('')),
    schoolName: z.string().optional(),
    schoolClass: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
    onComplete: (data: FormData) => void;
}

export default function FamilySchoolStep({ onComplete }: Props) {
    const { formData, updateFormData } = useRegistrationStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            fatherName: formData.fatherName || '',
            motherName: formData.motherName || '',
            guardianPhone: formData.guardianPhone || '',
            guardianEmail: formData.guardianEmail || '',
            schoolName: formData.schoolName || '',
            schoolClass: formData.schoolClass || '',
        },
    });

    const onSubmit = (data: FormData) => {
        updateFormData(data);
        onComplete(data);
    };

    return (
        <form id="step-2-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Father's Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Father's Name <span className="text-red-400">*</span>
                    </label>
                    <input
                        {...register('fatherName')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter father's full name"
                    />
                    {errors.fatherName && (
                        <p className="mt-1 text-sm text-red-400">{errors.fatherName.message}</p>
                    )}
                </div>

                {/* Mother's Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Mother's Name <span className="text-red-400">*</span>
                    </label>
                    <input
                        {...register('motherName')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter mother's full name"
                    />
                    {errors.motherName && (
                        <p className="mt-1 text-sm text-red-400">{errors.motherName.message}</p>
                    )}
                </div>

                {/* Guardian Phone */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Guardian's Phone <span className="text-red-400">*</span>
                    </label>
                    <input
                        {...register('guardianPhone')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                    />
                    {errors.guardianPhone && (
                        <p className="mt-1 text-sm text-red-400">{errors.guardianPhone.message}</p>
                    )}
                </div>

                {/* Guardian Email */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Guardian's Email
                    </label>
                    <input
                        {...register('guardianEmail')}
                        type="email"
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@example.com"
                    />
                    {errors.guardianEmail && (
                        <p className="mt-1 text-sm text-red-400">{errors.guardianEmail.message}</p>
                    )}
                </div>

                {/* School Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        School/College Name
                    </label>
                    <input
                        {...register('schoolName')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter school/college name"
                    />
                </div>

                {/* Class/Grade */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Class/Grade
                    </label>
                    <select
                        {...register('schoolClass')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select class</option>
                        {[...Array(12)].map((_, i) => (
                            <option key={i} value={`${i + 1}`}>Class {i + 1}</option>
                        ))}
                        <option value="college">College</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
        </form>
    );
}
