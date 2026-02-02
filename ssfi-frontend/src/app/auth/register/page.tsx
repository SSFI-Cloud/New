'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const registerSchema = z.object({
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
    email: z.string().email('Invalid email').optional(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain uppercase letter')
        .regex(/[a-z]/, 'Must contain lowercase letter')
        .regex(/[0-9]/, 'Must contain number')
        .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
    confirmPassword: z.string(),
    role: z.enum(['STUDENT', 'CLUB_OWNER', 'DISTRICT_SECRETARY', 'STATE_SECRETARY']),
    terms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: 'STUDENT' },
    });

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        try {
            // API call to register endpoint
            // const response = await api.post('/auth/register', data);

            toast.success('Registration successful! Please verify your phone number.');
            router.push('/verify-otp?phone=' + data.phone);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 flex">
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block mb-6">
                            <h1 className="text-4xl font-display font-bold text-white">SSFI</h1>
                        </Link>
                        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-gray-400">Join the SSFI family today</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Registration Type
                            </label>
                            <select
                                {...register('role')}
                                className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-white/10 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            >
                                <option value="STUDENT">Student (Skater)</option>
                                <option value="CLUB_OWNER">Club Owner</option>
                                <option value="DISTRICT_SECRETARY">District Secretary</option>
                                <option value="STATE_SECRETARY">State Secretary</option>
                            </select>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Phone Number *
                            </label>
                            <input
                                {...register('phone')}
                                type="tel"
                                placeholder="10-digit mobile number"
                                className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Email (Optional)
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create strong password"
                                    className="w-full px-4 py-3 pr-12 rounded-lg bg-dark-800 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Confirm Password *
                            </label>
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                placeholder="Re-enter password"
                                className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3">
                            <input
                                {...register('terms')}
                                type="checkbox"
                                className="mt-1 w-4 h-4 rounded border-white/10 bg-dark-800 text-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            />
                            <label className="text-sm text-gray-400">
                                I agree to the{' '}
                                <Link href="/terms" className="text-primary-400 hover:text-primary-300">
                                    Terms & Conditions
                                </Link>
                            </label>
                        </div>
                        {errors.terms && (
                            <p className="text-sm text-red-400">{errors.terms.message}</p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Register
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-400">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="font-semibold text-primary-400 hover:text-primary-300"
                        >
                            Login here
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Side */}
            <div className="hidden lg:block flex-1 relative bg-gradient-to-br from-primary-600 to-accent-600">
                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div>
                        <h2 className="text-5xl font-display font-bold text-white mb-8">
                            Start Your Journey
                        </h2>
                        <div className="space-y-4">
                            {['Official ID Card', 'National Recognition', 'Insurance Coverage', 'Expert Coaching'].map((item) => (
                                <div key={item} className="flex items-center gap-3 text-white">
                                    <CheckCircle2 className="w-6 h-6 text-accent-300" />
                                    <span className="text-lg">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
