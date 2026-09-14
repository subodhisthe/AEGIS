"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileSearch } from "lucide-react";

interface Engagement {
  id: string;
  name: string;
  client_name: string;
  status: string;
  created_at: string;
}

export default function EngagementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("engagements")
        .select("*")
        .eq("id", id)
        .single();
      setEngagement(data);
      setLoading(false);
    }
    fetch();
  }, [id, supabase]);

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!engagement) {
    return <p className="text-muted-foreground">Engagement not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/dashboard/engagements">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Engagements
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {engagement.name}
          </h1>
          <Badge
            className={
              engagement.status === "complete"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-yellow-500 text-black hover:bg-yellow-600"
            }
          >
            {engagement.status === "complete" ? "Complete" : "In Progress"}
          </Badge>
        </div>
        <p className="mt-1 text-lg text-muted-foreground">
          {engagement.client_name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Client</p>
              <p className="font-medium">{engagement.client_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Engagement</p>
              <p className="font-medium">{engagement.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">
                {engagement.status === "complete" ? "Complete" : "In Progress"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">
                {new Date(engagement.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <Button asChild>
            <Link href={`/dashboard/engagements/${engagement.id}/findings`}>
              <FileSearch className="mr-2 h-4 w-4" />
              View Findings
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
