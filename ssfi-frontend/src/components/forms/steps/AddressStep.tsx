'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegistrationStore } from '@/lib/store/registrationStore';

const schema = z.object({
    addressLine1: z.string().min(5, 'Address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    stateId: z.string().min(1, 'State is required'),
    districtId: z.string().min(1, 'District is required'),
    pincode: z.string().length(6, 'Pincode must be 6 digits'),
});

type FormData = z.infer<typeof schema>;

interface Props {
    onComplete: (data: FormData) => void;
}

const STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar', 'Chandigarh', 'Dadra and Nagar Haveli',
    'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
    'Lakshadweep', 'Puducherry',
];

export default function AddressStep({ onComplete }: Props) {
    const { formData, updateFormData } = useRegistrationStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            addressLine1: formData.addressLine1 || '',
            addressLine2: formData.addressLine2 || '',
            city: formData.city || '',
            stateId: formData.stateId || '',
            districtId: formData.districtId || '',
            pincode: formData.pincode || '',
        },
    });

    const onSubmit = (data: FormData) => {
        updateFormData(data);
        onComplete(data);
    };

    return (
        <form id="step-5-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Address Line 1 */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Address Line 1 <span className="text-red-400">*</span>
                    </label>
                    <input
                        {...register('addressLine1')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="House no., Street, Locality"
                    />
                    {errors.addressLine1 && (
                        <p className="mt-1 text-sm text-red-400">{errors.addressLine1.message}</p>
                    )}
                </div>

                {/* Address Line 2 */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Address Line 2 <span className="text-slate-500">(Optional)</span>
                    </label>
                    <input
                        {...register('addressLine2')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Area, Landmark"
                    />
                </div>

                {/* City */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        City/Town <span className="text-red-400">*</span>
                    </label>
                    <input
                        {...register('city')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter city name"
                    />
                    {errors.city && (
                        <p className="mt-1 text-sm text-red-400">{errors.city.message}</p>
                    )}
                </div>

                {/* District */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        District <span className="text-red-400">*</span>
                    </label>
                    <input
                        {...register('districtId')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter district"
                    />
                    {errors.districtId && (
                        <p className="mt-1 text-sm text-red-400">{errors.districtId.message}</p>
                    )}
                </div>

                {/* State */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        State/UT <span className="text-red-400">*</span>
                    </label>
                    <select
                        {...register('stateId')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select state</option>
                        {STATES.map((state) => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                    {errors.stateId && (
                        <p className="mt-1 text-sm text-red-400">{errors.stateId.message}</p>
                    )}
                </div>

                {/* Pincode */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Pincode <span className="text-red-400">*</span>
                    </label>
                    <input
                        {...register('pincode')}
                        className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="6-digit pincode"
                        maxLength={6}
                    />
                    {errors.pincode && (
                        <p className="mt-1 text-sm text-red-400">{errors.pincode.message}</p>
                    )}
                </div>
            </div>
        </form>
    );
}
