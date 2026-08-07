"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusToBadgeVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

interface ReportSummary {
  id: string;
  reportNumber: string;
  title: string;
  status: string;
  createdAt: string;
  reportType: { name: string };
  programme: { name: string } | null;
  preparedBy: { firstName: string; lastName: string };
}

interface ReportListResponse {
  data: ReportSummary[];
  meta: { totalItems: number };
}

function useReports(status?: string) {
  return useQuery({
    queryKey: ["reports", status ?? "all"],
    queryFn: () =>
      apiClient.get<ReportListResponse>(`/reports?pageSize=5${status ? `&status=${status}` : ""}`),
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const allReports = useReports();
  const submitted = useReports("SUBMITTED");
  const approved = useReports("APPROVED");
  const rejected = useReports("REJECTED");

  const cards = [
    { label: "Total Reports", value: allReports.data?.meta.totalItems, icon: FileText, tone: "text-primary" },
    { label: "Pending Approval", value: submitted.data?.meta.totalItems, icon: Clock, tone: "text-warning" },
    { label: "Approved", value: approved.data?.meta.totalItems, icon: CheckCircle2, tone: "text-success" },
    { label: "Rejected", value: rejected.data?.meta.totalItems, icon: XCircle, tone: "text-destructive" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome back, {user?.firstName}</h1>
        <p className="text-sm text-muted-foreground">
          Here's a live snapshot from the Reports API (analytics dashboard arrives in Phase 8).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                {card.value === undefined ? (
                  <Skeleton className="mt-1 h-7 w-10" />
                ) : (
                  <p className="text-2xl font-semibold">{card.value}</p>
                )}
              </div>
              <card.icon className={`h-8 w-8 ${card.tone}`} strokeWidth={1.5} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {allReports.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : allReports.data && allReports.data.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Report #</th>
                    <th className="pb-2 pr-4 font-medium">Title</th>
                    <th className="pb-2 pr-4 font-medium">Type</th>
                    <th className="pb-2 pr-4 font-medium">Prepared By</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allReports.data.data.map((report) => (
                    <tr key={report.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-4 font-mono text-xs">{report.reportNumber}</td>
                      <td className="py-2.5 pr-4">{report.title}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{report.reportType.name}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {report.preparedBy.firstName} {report.preparedBy.lastName}
                      </td>
                      <td className="py-2.5">
                        <Badge variant={statusToBadgeVariant(report.status)}>{report.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No reports yet"
              description="Reports you have visibility into will show up here once created."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
