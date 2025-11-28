import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function RegisterPage() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        phone: '',
        agreeTerms: false,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak cocok')
            return
        }

        if (!formData.agreeTerms) {
            setError('Anda harus menyetujui syarat dan ketentuan')
            return
        }

        setLoading(true)

        try {
            //TODO: Implement actual registration API call
            console.log('Registration data:', formData)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Redirect to login after successful registration
            navigate('/login')
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Branding */}
            <div className="hidden w-1/2 bg-gradient-to-br from-success to-primary p-12 lg:flex lg:flex-col lg:justify-between">
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
                        Bergabung dengan Ribuan UMKM Lainnya
                    </h2>
                    <p className="text-lg text-white/90">
                        Dapatkan akses ke tools, pelatihan, dan konsultasi yang akan membantu
                        bisnis Anda berkembang lebih cepat
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-6">
                        <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
                            <p className="text-3xl font-bold text-white">10K+</p>
                            <p className="text-sm text-white/80">UMKM Terdaftar</p>
                        </div>
                        <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
                            <p className="text-3xl font-bold text-white">50+</p>
                            <p className="text-sm text-white/80">Kursus Gratis</p>
                        </div>
                        <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
                            <p className="text-3xl font-bold text-white">95%</p>
                            <p className="text-sm text-white/80">Kepuasan User</p>
                        </div>
                        <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
                            <p className="text-3xl font-bold text-white">24/7</p>
                            <p className="text-sm text-white/80">Support</p>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-white/60">
                    © 2025 Semindo. All rights reserved.
                </div>
            </div>

            {/* Right Side - Register Form */}
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
                        <h2 className="text-3xl font-bold text-foreground">Create Account</h2>
                        <p className="mt-2 text-muted-foreground">
                            Daftar gratis dan mulai tingkatkan bisnis Anda
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-foreground">
                                Nama Lengkap
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border-2 border-border bg-background px-4 py-2.5 text-foreground outline-none transition focus:border-primary"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border-2 border-border bg-background px-4 py-2.5 text-foreground outline-none transition focus:border-primary"
                                placeholder="nama@email.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                    className="w-full rounded-lg border-2 border-border bg-background px-4 py-2.5 text-foreground outline-none transition focus:border-primary"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-foreground">
                                    Confirm
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border-2 border-border bg-background px-4 py-2.5 text-foreground outline-none transition focus:border-primary"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="businessName" className="mb-2 block text-sm font-medium text-foreground">
                                Nama Bisnis (Opsional)
                            </label>
                            <input
                                id="businessName"
                                name="businessName"
                                type="text"
                                value={formData.businessName}
                                onChange={handleChange}
                                className="w-full rounded-lg border-2 border-border bg-background px-4 py-2.5 text-foreground outline-none transition focus:border-primary"
                                placeholder="Toko Saya"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-foreground">
                                No. Telepon (Opsional)
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full rounded-lg border-2 border-border bg-background px-4 py-2.5 text-foreground outline-none transition focus:border-primary"
                                placeholder="08xx-xxxx-xxxx"
                            />
                        </div>

                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                name="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleChange}
                                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-muted-foreground">
                                Saya setuju dengan{' '}
                                <Link to="/terms" className="text-primary hover:underline">
                                    Syarat & Ketentuan
                                </Link>{' '}
                                dan{' '}
                                <Link to="/privacy" className="text-primary hover:underline">
                                    Kebijakan Privasi
                                </Link>
                            </span>
                        </label>

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
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Sudah punya akun?{' '}
                            <Link to="/login" className="font-medium text-primary hover:underline">
                                Login sekarang
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
