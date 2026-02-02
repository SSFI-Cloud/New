'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api/client';
import { useAuth } from '@/lib/hooks/useAuth';

const loginSchema = z.object({
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const { login } = useAuth();

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            // API call to login endpoint
            const response = await api.post('/auth/login', data);

            if (response.data.success) {
                const { accessToken: token, user } = response.data.data;
                await login(token, user);
            } else {
                toast.error(response.data.message || 'Login failed');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block mb-6">
                            <h1 className="text-4xl font-display font-bold text-white">SSFI</h1>
                        </Link>
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400">Login to your SSFI account</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Phone Number */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2">
                                Phone Number
                            </label>
                            <input
                                {...register('phone')}
                                type="tel"
                                placeholder="Enter 10-digit mobile number"
                                className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
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

                        {/* Forgot Password */}
                        <div className="flex items-center justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Login
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="mt-8 text-center text-gray-400">
                        Don't have an account?{' '}
                        <Link
                            href="/register"
                            className="font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            Register here
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Image/Illustration */}
            <div className="hidden lg:block flex-1 relative bg-gradient-to-br from-primary-600 to-accent-600">
                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center">
                        <h2 className="text-5xl font-display font-bold text-white mb-6">
                            Join India's Premier
                            <br />
                            Skating Federation
                        </h2>
                        <p className="text-xl text-white/80 max-w-md mx-auto">
                            10,000+ registered athletes • 28 states • 500+ clubs
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
