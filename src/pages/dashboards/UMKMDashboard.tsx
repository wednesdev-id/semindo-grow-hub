import React from 'react';
import CardDataStats from '@/components/dashboard/CardDataStats';
import ChartOne from '@/components/dashboard/ChartOne';
import ChartThree from '@/components/dashboard/ChartThree';
import ChartFour from '@/components/dashboard/ChartFour';
import TableOne from '@/components/dashboard/TableOne';
import { Activity, FileText, MessageSquare, BookOpen } from 'lucide-react';

const UMKMDashboard: React.FC = () => {
    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                <CardDataStats title="Health Score" total="68/100" rate="5.0%" levelUp>
                    <Activity className="text-primary dark:text-white" size={22} />
                </CardDataStats>
                <CardDataStats title="Assessments" total="3" rate="1" levelUp>
                    <FileText className="text-primary dark:text-white" size={22} />
                </CardDataStats>
                <CardDataStats title="Consultations" total="1" rate="0" levelDown>
                    <MessageSquare className="text-primary dark:text-white" size={22} />
                </CardDataStats>
                <CardDataStats title="Courses" total="2" rate="12%" levelUp>
                    <BookOpen className="text-primary dark:text-white" size={22} />
                </CardDataStats>
            </div>

            <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
                <ChartOne />
                <ChartFour />
                <ChartThree />
                <div className="col-span-12 xl:col-span-7">
                    <TableOne />
                </div>
            </div>
        </>
    );
};

export default UMKMDashboard;
