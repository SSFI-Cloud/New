'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegistrationStore } from '@/lib/store/registrationStore';

const schema = z.object({
    nomineeName: z.string().min(2, 'Nominee name is required'),
    nomineeRelation: z.string().min(1, 'Relation is required'),
    nomineeAge: z.number().min(18, 'Nominee must be 18+').max(100),
    nomineePhone: z.string().length(10, 'Enter valid 10-digit phone'),
});

type FormData = z.infer<typeof schema>;

interface Props {
    onComplete: (data: FormData) => void;
}

const RELATIONS = [
    'Father',
    'Mother',
    'Spouse',
    'Brother',
    'Sister',
    'Uncle',
    'Aunt',
    'Guardian',
    'Other',
];

export default function NomineeStep({ onComplete }: Props) {
    const { formData, updateFormData } = useRegistrationStore();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            nomineeName: (formData.nomineeName as string) || '',
            nomineeRelation: (formData.nomineeRelation as string) || '',
            nomineeAge: (formData.nomineeAge as number) || 18,
            nomineePhone: (formData.nomineePhone as string) || '',
        },
    });

    const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            setValue('nomineeAge', value);
        }
    };

    const onSubmit = (data: FormData) => {
        updateFormData(data);
        onComplete(data);
    };

    return (
        <form id="step-3-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-300">
                    The nominee will receive insurance benefits in case of any unforeseen circumstances.
                    Nominee must be 18 years or older.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Nominee Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nominee Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                        {...register('nomineeName')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter nominee's full name"
                    />
                    {errors.nomineeName && (
                        <p className="mt-1 text-sm text-red-400">{errors.nomineeName.message}</p>
                    )}
                </div>

                {/* Relation */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Relation with Skater <span className="text-red-400">*</span>
                    </label>
                    <select
                        {...register('nomineeRelation')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select relation</option>
                        {RELATIONS.map((rel) => (
                            <option key={rel} value={rel}>{rel}</option>
                        ))}
                    </select>
                    {errors.nomineeRelation && (
                        <p className="mt-1 text-sm text-red-400">{errors.nomineeRelation.message}</p>
                    )}
                </div>

                {/* Nominee Age */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nominee Age <span className="text-red-400">*</span>
                    </label>
                    <input
                        {...register('nomineeAge', { valueAsNumber: true })}
                        type="number"
                        min={18}
                        max={100}
                        onChange={handleAgeChange}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter age (18+)"
                    />
                    {errors.nomineeAge && (
                        <p className="mt-1 text-sm text-red-400">{errors.nomineeAge.message}</p>
                    )}
                </div>

                {/* Nominee Phone */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nominee Phone <span className="text-red-400">*</span>
                    </label>
                    <input
                        {...register('nomineePhone')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                    />
                    {errors.nomineePhone && (
                        <p className="mt-1 text-sm text-red-400">{errors.nomineePhone.message}</p>
                    )}
                </div>
            </div>
        </form>
    );
}
