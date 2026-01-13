import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
    const navigate = useNavigate()
    const { register } = useAuth()

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        phone: '',
        agreeTerms: false,
        hasUMKM: false, // Saya memiliki usaha UMKM
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

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault()
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
            await register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                businessName: formData.businessName,
                phone: formData.phone,
                role: 'umkm',
                businessCategory: 'retail' // Default for now
            })

            // Redirect based on hasUMKM checkbox
            if (formData.hasUMKM) {
                // User has business, redirect to business onboarding
                navigate('/onboarding/business')
            } else {
                // Regular user, redirect to dashboard
                navigate('/dashboard')
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* ... (rest of the file) ... */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* ... (inputs) ... */}

                <button
                    type="button"
                    onClick={handleSubmit}
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
            {/* ... */}


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
        </div >
    )
}
