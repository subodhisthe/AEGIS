"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileText, Plus } from "lucide-react";

interface Engagement {
  id: string;
  name: string;
  client_name: string;
}

interface Finding {
  id: string;
  title: string;
  description: string | null;
  severity: string | null;
  affected_agent: string | null;
  soc2_control: string | null;
  status: string;
  created_at: string;
}

const SOC2_OPTIONS = [
  { value: "CC6.1", label: "CC6.1 - Logical Access Controls" },
  { value: "CC6.3", label: "CC6.3 - Access Privilege Management" },
  { value: "CC6.7", label: "CC6.7 - Data Transmission Protection" },
  { value: "CC6.8", label: "CC6.8 - Malicious Software Prevention" },
  { value: "CC7.1", label: "CC7.1 - Vulnerability Management" },
  { value: "CC7.2", label: "CC7.2 - Security Incident Monitoring" },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-600 hover:bg-red-700",
  high: "bg-orange-500 hover:bg-orange-600",
  medium: "bg-yellow-500 text-black hover:bg-yellow-600",
  low: "bg-gray-400 text-black hover:bg-gray-500",
};

export default function FindingsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");
  const [affectedAgent, setAffectedAgent] = useState("");
  const [soc2Control, setSoc2Control] = useState("");

  const fetchData = useCallback(async () => {
    const [engRes, findRes] = await Promise.all([
      supabase.from("engagements").select("id, name, client_name").eq("id", id).single(),
      supabase
        .from("findings")
        .select("*")
        .eq("engagement_id", id)
        .order("created_at", { ascending: false }),
    ]);
    setEngagement(engRes.data);
    setFindings(findRes.data ?? []);
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setSeverity("");
    setAffectedAgent("");
    setSoc2Control("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    await supabase.from("findings").insert({
      engagement_id: id,
      title,
      description: description || null,
      severity: severity || null,
      affected_agent: affectedAgent || null,
      soc2_control: soc2Control || null,
    });

    resetForm();
    setDialogOpen(false);
    setSubmitting(false);
    fetchData();
  }

  async function handleGenerateReport() {
    setGeneratingReport(true);
    const { data } = await supabase
      .from("reports")
      .insert({ engagement_id: id, status: "draft" })
      .select("id")
      .single();

    if (data) {
      router.push(`/dashboard/reports/${data.id}`);
    }
    setGeneratingReport(false);
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!engagement) {
    return <p className="text-muted-foreground">Engagement not found.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/dashboard/engagements/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Engagement
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {engagement.name}
        </h1>
        <p className="mt-1 text-muted-foreground">{engagement.client_name}</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Findings</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateReport}
            disabled={generatingReport}
          >
            <FileText className="mr-2 h-4 w-4" />
            {generatingReport ? "Generating..." : "Generate Report"}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Finding
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Finding</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="finding_title">Title</Label>
                <Input
                  id="finding_title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Agent prompt injection via tool call"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finding_desc">Description</Label>
                <Textarea
                  id="finding_desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the finding in detail..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>SOC 2 Control</Label>
                  <Select value={soc2Control} onValueChange={setSoc2Control}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select control" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOC2_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finding_agent">Affected Agent</Label>
                <Input
                  id="finding_agent"
                  value={affectedAgent}
                  onChange={(e) => setAffectedAgent(e.target.value)}
                  placeholder="e.g. orchestrator, data-retrieval-agent"
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Saving..." : "Save Finding"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Affected Agent</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>SOC 2 Control</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {findings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No findings yet. Add your first one.
                </TableCell>
              </TableRow>
            ) : (
              findings.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.title}</TableCell>
                  <TableCell>{f.affected_agent ?? "—"}</TableCell>
                  <TableCell>
                    {f.severity ? (
                      <Badge
                        className={SEVERITY_COLORS[f.severity] ?? ""}
                      >
                        {f.severity.charAt(0).toUpperCase() +
                          f.severity.slice(1)}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{f.soc2_control ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        f.status === "remediated"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }
                    >
                      {f.status === "remediated" ? "Remediated" : "Open"}
                    </Badge>
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
