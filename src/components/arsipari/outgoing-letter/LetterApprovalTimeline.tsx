
import React from "react";
import { CheckCircle, XCircle, Clock, Circle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { LetterApproval } from "@/types/arsipari";
import { cn } from "@/lib/utils";

interface LetterApprovalTimelineProps {
    approvals: LetterApproval[];
    currentStatus: string;
}

export const LetterApprovalTimeline = ({ approvals, currentStatus }: LetterApprovalTimelineProps) => {
    if (!approvals || approvals.length === 0) {
        return (
            <div className="text-center py-4 text-muted-foreground text-sm">
                Belum ada riwayat persetujuan.
            </div>
        );
    }

    return (
        <div className="space-y-6 relative ml-2">
            {/* Vertical Line */}
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-200" />

            {approvals.map((approval, index) => {
                const isCompleted = approval.status === 'APPROVED' || approval.status === 'REJECTED';
                const isCurrent = approval.status === 'PENDING' && currentStatus === 'REVIEW' &&
                    (!approvals[index - 1] || approvals[index - 1].status === 'APPROVED');

                let Icon = Circle;
                let colorClass = "text-gray-300";
                let bgClass = "bg-white";

                if (approval.status === 'APPROVED') {
                    Icon = CheckCircle;
                    colorClass = "text-green-600";
                    bgClass = "bg-green-50";
                } else if (approval.status === 'REJECTED') {
                    Icon = XCircle;
                    colorClass = "text-red-600";
                    bgClass = "bg-red-50";
                } else if (isCurrent) {
                    Icon = Clock;
                    colorClass = "text-blue-600";
                    bgClass = "bg-blue-50";
                }

                return (
                    <div key={approval.id} className="relative flex gap-4 items-start">
                        <div className={cn("relative z-10 rounded-full p-1 border", bgClass, colorClass)}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center">
                                <p className="font-medium text-sm">
                                    {approval.user?.fullName || "Approver"}
                                </p>
                                {approval.approvalDate && (
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(approval.approvalDate), "d MMM HH:mm", { locale: id })}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Urutan: {approval.sequence} • Status: <span className={cn("font-medium", colorClass)}>
                                    {approval.status === 'APPROVED' ? 'Disetujui' : approval.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                                </span>
                            </p>
                            {approval.notes && (
                                <div className="text-sm bg-gray-50 p-2 rounded text-gray-700 italic border border-gray-100 mt-1">
                                    "{approval.notes}"
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
