import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (err: unknown) {
            console.error('=== LOGIN ERROR DEBUG ===');
            console.error('Error type:', typeof err);
            console.error('Error object:', err);
            console.error('Error stringified:', JSON.stringify(err, null, 2));

            let message = 'Login gagal. Silakan periksa email dan password Anda.';

            // Try to extract error message from various possible structures
            if (err instanceof Error) {
                console.error('Error is instance of Error');
                console.error('Error message:', err.message);

                // Check for specific error messages from backend
                if (err.message.includes('User not found') ||
                    err.message.includes('Invalid password') ||
                    err.message.includes('Invalid credentials') ||
                    err.message.includes('Invalid email or password')) {
                    message = 'Email atau password salah. Silakan coba lagi.';
                } else if (err.message.includes('Network Error')) {
                    message = 'Terjadi kesalahan jaringan. Periksa koneksi internet Anda.';
                } else if (err.message.includes('Too many requests')) {
                    message = 'Terlalu banyak percobaan login. Silakan tunggu beberapa saat.';
                } else if (err.message && err.message.trim() !== '') {
                    message = err.message;
                }
            }

            // Handle API error response structure (axios-like errors)
            if (typeof err === 'object' && err !== null) {
                const apiError = err as any;
                console.error('Checking API error structure...');
                console.error('Has response?', !!apiError.response);
                console.error('Has response.data?', !!(apiError.response && apiError.response.data));
                console.error('Has response.data.message?', !!(apiError.response && apiError.response.data && apiError.response.data.message));

                if (apiError.response?.data?.message) {
                    message = apiError.response.data.message;
                    console.error('Using response.data.message:', message);
                } else if (apiError.response?.data?.error) {
                    message = apiError.response.data.error;
                    console.error('Using response.data.error:', message);
                } else if (apiError.data?.message) {
                    message = apiError.data.message;
                    console.error('Using data.message:', message);
                } else if (apiError.message && typeof apiError.message === 'string' && apiError.message.trim() !== '') {
                    message = apiError.message;
                    console.error('Using message:', message);
                }
            }

            console.error('Final error message to display:', message);
            console.error('=== END LOGIN ERROR DEBUG ===');

            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Branding */}
            <div className="hidden w-1/2 bg-gradient-to-br from-primary to-secondary p-12 lg:flex lg:flex-col lg:justify-between">
                <div>
                    <Link to="/" className="flex items-center gap-2 text-white">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                            <span className="text-2xl font-bold">S</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Semindo</h1>
                            <p className="text-sm text-white/80">UMKM Growth Hub</p>
                        </div>
                    </Link>
                </div>

                <div className="space-y-6">
                    <h2 className="text-4xl font-bold text-white">
                        Tingkatkan Bisnis UMKM Anda
                    </h2>
                    <p className="text-lg text-white/90">
                        Platform lengkap untuk assessment, pembelajaran, konsultasi, dan akses pembiayaan
                        untuk UMKM Indonesia
                    </p>

                    <div className="space-y-4 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-white">Self-Assessment untuk ukur kesehatan bisnis</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-white">Akses kursus dan pelatihan gratis</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-white">Konsultasi dengan ahli bisnis</p>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-white/60">
                    © 2025 Semindo. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex w-full items-center justify-center bg-background p-8 lg:w-1/2">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo for mobile */}
                    <div className="flex justify-center lg:hidden">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                <span className="text-2xl font-bold">S</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">Semindo</h1>
                                <p className="text-sm text-muted-foreground">UMKM Growth Hub</p>
                            </div>
                        </Link>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-foreground">Welcome Back!</h2>
                        <p className="mt-2 text-muted-foreground">
                            Masuk ke akun Anda untuk melanjutkan
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-danger bg-opacity-10 p-4">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-danger">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary"
                                placeholder="nama@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-muted-foreground">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                                Lupa password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Belum punya akun?{' '}
                            <Link to="/register" className="font-medium text-primary hover:underline">
                                Daftar sekarang
                            </Link>
                        </p>
                    </div>

                    <div className="text-center lg:hidden">
                        <p className="text-xs text-muted-foreground">
                            © 2025 Semindo. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
