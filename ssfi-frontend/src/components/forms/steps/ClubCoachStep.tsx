'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Loader2 } from 'lucide-react';
import { useRegistrationStore } from '@/lib/store/registrationStore';
import { useStates, useDistricts, useClubs } from '@/lib/hooks/useStudent';

const schema = z.object({
    stateId: z.string().min(1, 'State is required'),
    districtId: z.string().min(1, 'District is required'),
    clubId: z.string().min(1, 'Club is required'),
    coachName: z.string().optional(),
    coachPhone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
    onComplete: (data: FormData) => void;
}

export default function ClubCoachStep({ onComplete }: Props) {
    const { formData, updateFormData } = useRegistrationStore();
    const [selectedState, setSelectedState] = useState(formData.stateId || '');
    const [selectedDistrict, setSelectedDistrict] = useState(formData.districtId || '');

    const { fetchStates, data: states, isLoading: statesLoading } = useStates();
    const { fetchDistricts, data: districts, isLoading: districtsLoading, clearDistricts } = useDistricts();
    const { fetchClubs, data: clubs, isLoading: clubsLoading, clearClubs } = useClubs();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            stateId: formData.stateId || '',
            districtId: formData.districtId || '',
            clubId: formData.clubId || '',
            coachName: formData.coachName || '',
            coachPhone: formData.coachPhone || '',
        },
    });

    const watchState = watch('stateId');
    const watchDistrict = watch('districtId');

    useEffect(() => {
        if (watchState !== selectedState) {
            setSelectedState(watchState);
            setValue('districtId', '');
            setValue('clubId', '');
            setSelectedDistrict('');
        }
    }, [watchState, selectedState, setValue]);

    useEffect(() => {
        if (watchDistrict !== selectedDistrict) {
            setSelectedDistrict(watchDistrict);
            setValue('clubId', '');
        }
    }, [watchDistrict, selectedDistrict, setValue]);

    const onSubmit = (data: FormData) => {
        updateFormData(data);
        onComplete(data);
    };

    return (
        <form id="step-4-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* State */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        State <span className="text-red-400">*</span>
                    </label>
                    <select
                        {...register('stateId')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={statesLoading}
                    >
                        <option value="">
                            {statesLoading ? 'Loading...' : 'Select state'}
                        </option>
                        {states?.map((state) => (
                            <option key={state.id} value={state.id}>{state.name}</option>
                        ))}
                    </select>
                    {errors.stateId && (
                        <p className="mt-1 text-sm text-red-400">{errors.stateId.message}</p>
                    )}
                </div>

                {/* District */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        District <span className="text-red-400">*</span>
                    </label>
                    <select
                        {...register('districtId')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!selectedState || districtsLoading}
                    >
                        <option value="">
                            {districtsLoading ? 'Loading...' : !selectedState ? 'Select state first' : 'Select district'}
                        </option>
                        {districts?.map((district) => (
                            <option key={district.id} value={district.id}>{district.name}</option>
                        ))}
                    </select>
                    {errors.districtId && (
                        <p className="mt-1 text-sm text-red-400">{errors.districtId.message}</p>
                    )}
                </div>

                {/* Club */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Select Club <span className="text-red-400">*</span>
                    </label>
                    <select
                        {...register('clubId')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!selectedDistrict || clubsLoading}
                    >
                        <option value="">
                            {clubsLoading ? 'Loading...' : !selectedDistrict ? 'Select district first' : 'Select club'}
                        </option>
                        {clubs?.map((club) => (
                            <option key={club.id} value={club.id}>{club.name}</option>
                        ))}
                    </select>
                    {errors.clubId && (
                        <p className="mt-1 text-sm text-red-400">{errors.clubId.message}</p>
                    )}
                </div>

                {/* Coach Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Coach Name
                    </label>
                    <input
                        {...register('coachName')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter coach's name"
                    />
                </div>

                {/* Coach Phone */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Coach Phone
                    </label>
                    <input
                        {...register('coachPhone')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                    />
                </div>
            </div>
        </form>
    );
}
