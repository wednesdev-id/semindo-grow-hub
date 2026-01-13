import { ArrowDown, ArrowUp, Users, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EcommerceMetrics() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <Users className="text-gray-800 size-6 dark:text-white/90" />
                </div>

                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total UMKM
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                            3,782
                        </h4>
                    </div>
                    <Badge variant="success" className="gap-1">
                        <ArrowUp className="size-3" />
                        11.01%
                    </Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <FileText className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Assessments
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                            5,359
                        </h4>
                    </div>

                    <Badge variant="error" className="gap-1">
                        <ArrowDown className="size-3" />
                        9.05%
                    </Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}
        </div>
    );
}
