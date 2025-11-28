import EcommerceMetrics from '@/components/dashboard/tailadmin/EcommerceMetrics'
import MonthlySalesChart from '@/components/dashboard/tailadmin/MonthlySalesChart'
import MonthlyTarget from '@/components/dashboard/tailadmin/MonthlyTarget'
import StatisticsChart from '@/components/dashboard/tailadmin/StatisticsChart'

export default function UMKMDashboard() {
    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7">
                <EcommerceMetrics />
                <MonthlySalesChart />
            </div>

            <div className="col-span-12 xl:col-span-5">
                <MonthlyTarget />
            </div>

            <div className="col-span-12">
                <StatisticsChart />
            </div>
        </div>
    )
}
