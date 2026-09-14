"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface Engagement {
  id: string;
  name: string;
  client_name: string;
  status: string;
  created_at: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function EngagementsPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [engagementName, setEngagementName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const fetchEngagements = useCallback(async () => {
    const { data } = await supabase
      .from("engagements")
      .select("*")
      .order("created_at", { ascending: false });
    setEngagements(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEngagements();
  }, [fetchEngagements]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("engagements").insert({
      name: engagementName,
      client_name: clientName,
      user_id: user.id,
    });

    setClientName("");
    setEngagementName("");
    setDialogOpen(false);
    setSubmitting(false);
    fetchEngagements();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Engagements</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your security testing engagements.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Engagement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Engagement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engagement_name">Engagement Name</Label>
                <Input
                  id="engagement_name"
                  value={engagementName}
                  onChange={(e) => setEngagementName(e.target.value)}
                  placeholder="e.g. A2A Audit Q1 2025"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Engagement"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Engagement Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : engagements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No engagements yet. Create your first one.
                </TableCell>
              </TableRow>
            ) : (
              engagements.map((eng) => (
                <TableRow key={eng.id}>
                  <TableCell className="font-medium">
                    {eng.client_name}
                  </TableCell>
                  <TableCell>{eng.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        eng.status === "complete" ? "default" : "secondary"
                      }
                      className={
                        eng.status === "complete"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-yellow-500 text-black hover:bg-yellow-600"
                      }
                    >
                      {eng.status === "complete" ? "Complete" : "In Progress"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(eng.created_at)}</TableCell>
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
  );
}
