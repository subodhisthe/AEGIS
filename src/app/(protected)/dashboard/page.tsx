"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Crosshair,
  Activity,
  Bug,
  AlertTriangle,
  Plus,
  FileText,
} from "lucide-react";

interface Engagement {
  id: string;
  name: string;
  client_name: string;
  status: string;
  created_at: string;
}

interface Stats {
  totalEngagements: number;
  activeEngagements: number;
  totalFindings: number;
  openFindings: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalEngagements: 0,
    activeEngagements: 0,
    totalFindings: 0,
    openFindings: 0,
  });
  const [recent, setRecent] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const [engAll, engActive, findAll, findOpen, recentRes] = await Promise.all([
      supabase.from("engagements").select("id", { count: "exact", head: true }),
      supabase
        .from("engagements")
        .select("id", { count: "exact", head: true })
        .eq("status", "in_progress"),
      supabase.from("findings").select("id", { count: "exact", head: true }),
      supabase
        .from("findings")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
      supabase
        .from("engagements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    setStats({
      totalEngagements: engAll.count ?? 0,
      activeEngagements: engActive.count ?? 0,
      totalFindings: findAll.count ?? 0,
      openFindings: findOpen.count ?? 0,
    });
    setRecent(recentRes.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statCards = [
    {
      label: "Total Engagements",
      value: stats.totalEngagements,
      icon: Crosshair,
    },
    {
      label: "Active Engagements",
      value: stats.activeEngagements,
      icon: Activity,
    },
    {
      label: "Total Findings",
      value: stats.totalFindings,
      icon: Bug,
    },
    {
      label: "Open Findings",
      value: stats.openFindings,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Aegis</h1>
        <p className="mt-1 text-muted-foreground">
          Your A2A security command center
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {loading ? "—" : card.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Engagements */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Engagements</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Engagement Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No engagements yet.
                  </TableCell>
                </TableRow>
              ) : (
                recent.map((eng) => (
                  <TableRow key={eng.id}>
                    <TableCell className="font-medium">{eng.client_name}</TableCell>
                    <TableCell>{eng.name}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          eng.status === "complete"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-yellow-500 text-black hover:bg-yellow-600"
                        }
                      >
                        {eng.status === "complete" ? "Complete" : "In Progress"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/engagements/${eng.id}`)
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/dashboard/engagements">
              <Plus className="mr-2 h-4 w-4" />
              New Engagement
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/reports">
              <FileText className="mr-2 h-4 w-4" />
              View All Reports
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
