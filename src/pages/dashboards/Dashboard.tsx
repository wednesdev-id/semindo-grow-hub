import { useAuth } from '@/contexts/AuthContext'
import UMKMDashboard from './UMKMDashboard'
import { Navigate } from 'react-router-dom'

export default function Dashboard() {
    const { roles, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
        )
    }

    // Get primary role
    const primaryRole = roles[0]?.name

    // Route to appropriate dashboard based on role
    switch (primaryRole) {
        case 'umkm':
            return <UMKMDashboard />

        case 'konsultan':
            // TODO: Implement KonsultanDashboard
            return <div>Konsultan Dashboard - Coming Soon</div>

        case 'admin':
        case 'super_admin':
            // TODO: Implement AdminDashboard
            return <div>Admin Dashboard - Coming Soon</div>

        case 'finance_partner':
            // TODO: Implement FinancePartnerDashboard
            return <div>Finance Partner Dashboard - Coming Soon</div>

        case 'ecosystem_partner':
            // TODO: Implement EcosystemPartnerDashboard
            return <div>Ecosystem Partner Dashboard - Coming Soon</div>

        default:
            return <Navigate to="/select-role" replace />
    }
}
