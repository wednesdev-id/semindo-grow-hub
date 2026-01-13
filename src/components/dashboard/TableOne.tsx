import React from 'react';
import { Link } from 'react-router-dom';

const TableOne = () => {
    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                Rekomendasi Prioritas
            </h4>

            <div className="flex flex-col">
                <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
                    <div className="p-2.5 xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">
                            Rekomendasi
                        </h5>
                    </div>
                    <div className="p-2.5 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">
                            Kategori
                        </h5>
                    </div>
                    <div className="p-2.5 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">
                            Impact
                        </h5>
                    </div>
                    <div className="hidden p-2.5 text-center sm:block xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">
                            Status
                        </h5>
                    </div>
                    <div className="hidden p-2.5 text-center sm:block xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">
                            Action
                        </h5>
                    </div>
                </div>

                <div className="grid grid-cols-3 border-b border-stroke dark:border-strokedark sm:grid-cols-5">
                    <div className="flex items-center gap-3 p-2.5 xl:p-5">
                        <div className="flex-shrink-0">
                            {/* Icon placeholder */}
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                1
                            </div>
                        </div>
                        <p className="hidden text-black dark:text-white sm:block">
                            Lengkapi Profil Bisnis
                        </p>
                    </div>

                    <div className="flex items-center justify-center p-2.5 xl:p-5">
                        <p className="text-black dark:text-white">Legalitas</p>
                    </div>

                    <div className="flex items-center justify-center p-2.5 xl:p-5">
                        <p className="text-meta-3">High</p>
                    </div>

                    <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                        <p className="text-black dark:text-white">Pending</p>
                    </div>

                    <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                        <Link to="/profile" className="text-primary hover:underline">
                            Start
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-3 border-b border-stroke dark:border-strokedark sm:grid-cols-5">
                    <div className="flex items-center gap-3 p-2.5 xl:p-5">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                2
                            </div>
                        </div>
                        <p className="hidden text-black dark:text-white sm:block">
                            Kursus Digital Marketing
                        </p>
                    </div>

                    <div className="flex items-center justify-center p-2.5 xl:p-5">
                        <p className="text-black dark:text-white">Pemasaran</p>
                    </div>

                    <div className="flex items-center justify-center p-2.5 xl:p-5">
                        <p className="text-meta-5">Medium</p>
                    </div>

                    <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                        <p className="text-black dark:text-white">In Progress</p>
                    </div>

                    <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                        <Link to="/lms" className="text-primary hover:underline">
                            Continue
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-3 border-b border-stroke dark:border-strokedark sm:grid-cols-5">
                    <div className="flex items-center gap-3 p-2.5 xl:p-5">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                3
                            </div>
                        </div>
                        <p className="hidden text-black dark:text-white sm:block">
                            Laporan Keuangan Bulanan
                        </p>
                    </div>

                    <div className="flex items-center justify-center p-2.5 xl:p-5">
                        <p className="text-black dark:text-white">Keuangan</p>
                    </div>

                    <div className="flex items-center justify-center p-2.5 xl:p-5">
                        <p className="text-meta-3">High</p>
                    </div>

                    <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                        <p className="text-black dark:text-white">Pending</p>
                    </div>

                    <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                        <Link to="/finance" className="text-primary hover:underline">
                            Upload
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableOne;
