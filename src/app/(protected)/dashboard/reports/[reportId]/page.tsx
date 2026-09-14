"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Shield } from "lucide-react";

interface Report {
  id: string;
  engagement_id: string;
  generated_at: string;
  status: string;
}

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
}

const SOC2_CONTROLS = [
  { code: "CC6.1", label: "Logical Access Controls" },
  { code: "CC6.3", label: "Access Privilege Management" },
  { code: "CC6.7", label: "Data Transmission Protection" },
  { code: "CC6.8", label: "Malicious Software Prevention" },
  { code: "CC7.1", label: "Vulnerability Management" },
  { code: "CC7.2", label: "Security Incident Monitoring" },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-600 hover:bg-red-700",
  high: "bg-orange-500 hover:bg-orange-600",
  medium: "bg-yellow-500 text-black hover:bg-yellow-600",
  low: "bg-gray-400 text-black hover:bg-gray-500",
};

// Inline styles for html2pdf (Tailwind classes aren't available in the cloned element)
const SEVERITY_INLINE: Record<string, string> = {
  critical: "#dc2626",
  high: "#f97316",
  medium: "#eab308",
  low: "#9ca3af",
};

const SEVERITY_ORDER = ["critical", "high", "medium", "low"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getOverallRisk(findings: Finding[]): { level: string; color: string } {
  for (const sev of SEVERITY_ORDER) {
    if (findings.some((f) => f.severity === sev && f.status === "open")) {
      return {
        level: sev.charAt(0).toUpperCase() + sev.slice(1),
        color: SEVERITY_COLORS[sev],
      };
    }
  }
  if (findings.length === 0)
    return { level: "Not Assessed", color: "bg-gray-400 text-black" };
  return { level: "Low", color: SEVERITY_COLORS.low };
}

export default function ReportPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const supabase = createClient();
  const reportRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState<Report | null>(null);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [markingFinal, setMarkingFinal] = useState(false);

  const fetchData = useCallback(async () => {
    const { data: rpt } = await supabase
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (!rpt) {
      setLoading(false);
      return;
    }
    setReport(rpt);

    const [engRes, findRes] = await Promise.all([
      supabase
        .from("engagements")
        .select("id, name, client_name")
        .eq("id", rpt.engagement_id)
        .single(),
      supabase
        .from("findings")
        .select("*")
        .eq("engagement_id", rpt.engagement_id)
        .order("created_at", { ascending: true }),
    ]);

    setEngagement(engRes.data);
    setFindings(findRes.data ?? []);
    setLoading(false);
  }, [reportId, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleExportPdf() {
    if (!reportRef.current || !engagement) return;
    setExporting(true);

    const html2pdf = (await import("html2pdf.js")).default;

    const filename = `${engagement.client_name.replace(/\s+/g, "-")}-A2A-Security-Assessment.pdf`;

    const opt = {
      margin: [20, 15, 20, 15] as [number, number, number, number],
      filename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
      pagebreak: {
        mode: ["css" as const],
      },
    };

    const element = reportRef.current;

    // Use the worker API to add page headers after rendering
    const worker = html2pdf().set(opt).from(element);

    await worker
      .toPdf()
      .get("pdf")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((pdf: any) => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setTextColor(150);
          pdf.text(
            "Aegis Security Platform \u2014 Confidential",
            pdf.internal.pageSize.getWidth() / 2,
            10,
            { align: "center" }
          );
        }
      })
      .save();

    setExporting(false);
  }

  async function handleMarkFinal() {
    if (!report) return;
    setMarkingFinal(true);
    await supabase
      .from("reports")
      .update({ status: "final" })
      .eq("id", report.id);
    setReport({ ...report, status: "final" });
    setMarkingFinal(false);
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading report...</p>;
  }

  if (!report || !engagement) {
    return <p className="text-muted-foreground">Report not found.</p>;
  }

  // Computed stats
  const severityCounts = SEVERITY_ORDER.reduce(
    (acc, sev) => {
      acc[sev] = findings.filter((f) => f.severity === sev).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const overallRisk = getOverallRisk(findings);

  const soc2Coverage = SOC2_CONTROLS.map((ctrl) => {
    const mapped = findings.filter((f) => f.soc2_control === ctrl.code);
    let status: string;
    let statusColor: string;
    let statusInline: string;
    if (mapped.length === 0) {
      status = "Not Tested";
      statusColor = "bg-gray-400 text-black";
      statusInline = "#9ca3af";
    } else if (mapped.some((f) => f.status === "open")) {
      status = "Vulnerable";
      statusColor = "bg-red-600";
      statusInline = "#dc2626";
    } else {
      status = "Passing";
      statusColor = "bg-green-600";
      statusInline = "#16a34a";
    }
    return { ...ctrl, count: mapped.length, status, statusColor, statusInline };
  });

  return (
    <div className="space-y-8">
      {/* Action buttons — excluded from PDF */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Report</h2>
          <Badge
            variant={report.status === "final" ? "default" : "secondary"}
            className={
              report.status === "final"
                ? "bg-green-600 hover:bg-green-700"
                : ""
            }
          >
            {report.status === "final" ? "Final" : "Draft"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {report.status !== "final" && (
            <Button
              variant="outline"
              onClick={handleMarkFinal}
              disabled={markingFinal}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {markingFinal ? "Updating..." : "Mark as Final"}
            </Button>
          )}
          <Button onClick={handleExportPdf} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Generating..." : "Export PDF"}
          </Button>
        </div>
      </div>

      {/* ─── REPORT CONTENT (captured by html2pdf) ─── */}
      <div ref={reportRef} className="report-content space-y-8 bg-white text-black p-2">
        {/* ─── REPORT HEADER ─── */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8" style={{ color: "#1e293b" }} />
            <span className="text-2xl font-bold tracking-tight" style={{ color: "#1e293b" }}>
              Aegis
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontSize: "24px", color: "#0f172a" }}>
            {engagement.client_name} &mdash; A2A Security Assessment
          </h1>
          <div className="mt-2 space-y-1" style={{ color: "#64748b", fontSize: "14px" }}>
            <p>Engagement: {engagement.name}</p>
            <p>Date Generated: {formatDate(report.generated_at)}</p>
            {report.status === "final" && (
              <p className="font-semibold" style={{ color: "#16a34a" }}>
                Status: Final
              </p>
            )}
          </div>
        </div>

        {/* ─── EXECUTIVE SUMMARY ─── */}
        <section className="space-y-4" style={{ pageBreakBefore: "always" }}>
          <h2 className="text-2xl font-semibold" style={{ fontSize: "20px", color: "#0f172a" }}>
            Executive Summary
          </h2>
          <div className="grid grid-cols-3 gap-4" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm" style={{ color: "#64748b", fontSize: "12px" }}>Total Findings</p>
              <p className="text-3xl font-bold" style={{ fontSize: "28px", color: "#0f172a" }}>{findings.length}</p>
            </div>
            {SEVERITY_ORDER.map((sev) => (
              <div key={sev} className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm" style={{ color: "#64748b", fontSize: "12px" }}>
                  {sev.charAt(0).toUpperCase() + sev.slice(1)}
                </p>
                <p className="text-3xl font-bold" style={{ fontSize: "28px", color: "#0f172a" }}>
                  {severityCounts[sev]}
                </p>
              </div>
            ))}
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm" style={{ color: "#64748b", fontSize: "12px" }}>Overall Risk</p>
              <span
                className="mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold text-white"
                style={{
                  backgroundColor: SEVERITY_INLINE[overallRisk.level.toLowerCase()] ?? "#9ca3af",
                  color: ["medium", "low"].includes(overallRisk.level.toLowerCase()) ? "#000" : "#fff",
                  fontSize: "13px",
                }}
              >
                {overallRisk.level}
              </span>
            </div>
          </div>
        </section>

        {/* ─── FINDINGS DETAIL ─── */}
        <section className="space-y-4" style={{ pageBreakBefore: "always" }}>
          <h2 className="text-2xl font-semibold" style={{ fontSize: "20px", color: "#0f172a" }}>
            Findings Detail
          </h2>
          {findings.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "14px" }}>No findings recorded.</p>
          ) : (
            <div className="space-y-4">
              {findings.map((f, idx) => (
                <div
                  key={f.id}
                  className="rounded-lg border border-gray-200 p-5"
                  style={{ pageBreakInside: "avoid" }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <p className="text-lg font-semibold" style={{ fontSize: "16px", color: "#0f172a" }}>
                      {idx + 1}. {f.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {f.severity && (
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{
                            backgroundColor: SEVERITY_INLINE[f.severity] ?? "#9ca3af",
                            color: ["medium", "low"].includes(f.severity) ? "#000" : "#fff",
                          }}
                        >
                          {f.severity.charAt(0).toUpperCase() + f.severity.slice(1)}
                        </span>
                      )}
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                        style={{
                          backgroundColor: f.status === "remediated" ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {f.status === "remediated" ? "Remediated" : "Open"}
                      </span>
                    </div>
                  </div>
                  <dl className="grid grid-cols-2 gap-3" style={{ fontSize: "13px" }}>
                    {f.affected_agent && (
                      <div>
                        <dt style={{ color: "#64748b" }}>Affected Agent</dt>
                        <dd className="font-medium" style={{ color: "#0f172a" }}>{f.affected_agent}</dd>
                      </div>
                    )}
                    {f.soc2_control && (
                      <div>
                        <dt style={{ color: "#64748b" }}>SOC 2 Control</dt>
                        <dd className="font-medium" style={{ color: "#0f172a" }}>{f.soc2_control}</dd>
                      </div>
                    )}
                    {f.description && (
                      <div className="col-span-2">
                        <dt style={{ color: "#64748b" }}>Description</dt>
                        <dd className="mt-1 whitespace-pre-wrap" style={{ color: "#1e293b" }}>
                          {f.description}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── SOC 2 CONTROL COVERAGE ─── */}
        <section className="space-y-4" style={{ pageBreakBefore: "always" }}>
          <h2 className="text-2xl font-semibold" style={{ fontSize: "20px", color: "#0f172a" }}>
            SOC 2 Control Coverage
          </h2>
          <table
            className="w-full text-sm"
            style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                <th className="text-left p-3 font-medium" style={{ color: "#64748b", padding: "10px" }}>Control</th>
                <th className="text-left p-3 font-medium" style={{ color: "#64748b", padding: "10px" }}>Description</th>
                <th className="text-center p-3 font-medium" style={{ color: "#64748b", padding: "10px" }}>Findings</th>
                <th className="text-left p-3 font-medium" style={{ color: "#64748b", padding: "10px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {soc2Coverage.map((ctrl) => (
                <tr key={ctrl.code} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td className="p-3 font-medium" style={{ padding: "10px", color: "#0f172a" }}>{ctrl.code}</td>
                  <td className="p-3" style={{ padding: "10px", color: "#1e293b" }}>{ctrl.label}</td>
                  <td className="p-3 text-center" style={{ padding: "10px", color: "#0f172a" }}>{ctrl.count}</td>
                  <td className="p-3" style={{ padding: "10px" }}>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: ctrl.statusInline,
                        color: ctrl.status === "Not Tested" ? "#000" : "#fff",
                      }}
                    >
                      {ctrl.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="border-t border-gray-200 pt-6" style={{ fontSize: "12px", color: "#94a3b8" }}>
          <p>Generated by Aegis Security Platform</p>
          <p>{formatDate(report.generated_at)}</p>
        </footer>
      </div>
    </div>
  );
}
