import Link from "next/link";
import {
  Shield,
  UserX,
  MessageSquareWarning,
  KeyRound,
  FlaskConical,
  Map,
  Rocket,
  Check,
} from "lucide-react";

const problems = [
  {
    icon: UserX,
    title: "Agent Impersonation",
    description:
      "Attackers spoof agent identities to hijack workflows and exfiltrate data across your orchestration layer.",
  },
  {
    icon: MessageSquareWarning,
    title: "Prompt Injection",
    description:
      "Malicious payloads embedded in agent messages hijack downstream agents, overriding instructions and guardrails.",
  },
  {
    icon: KeyRound,
    title: "Privilege Escalation",
    description:
      "Agents manipulated into calling APIs they were never authorized to use, breaking the principle of least privilege.",
  },
];

const steps = [
  {
    icon: FlaskConical,
    step: "01",
    title: "We Test",
    description:
      "Adversarial pen-test across 6 attack surfaces specific to agent-to-agent systems.",
  },
  {
    icon: Map,
    step: "02",
    title: "We Map",
    description:
      "Every finding mapped to SOC 2 CC controls automatically — no manual spreadsheet work.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "You Ship",
    description:
      "Auditor-ready evidence report delivered in 5 business days. Pass your audit, close your deals.",
  },
];

const stats = [
  { value: "6", label: "A2A Attack Vectors Tested" },
  { value: "SOC 2", label: "CC Controls Mapped" },
  { value: "5-Day", label: "Report Turnaround" },
];

const included = [
  "Full A2A pen-test across 6 attack vectors",
  "SOC 2 control gap analysis",
  "Auditor-ready evidence report",
  "Executive summary for leadership",
  "Remediation recommendations",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ─── NAV ─── */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <span className="text-lg font-bold tracking-tight">Aegis</span>
          </div>
          <Link
            href="/login"
            className="text-sm text-neutral-400 transition-colors hover:text-white"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="mx-auto max-w-4xl px-6 pb-24 pt-28 text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Your AI Agents Are Talking.
          <br />
          <span className="text-neutral-400">
            Do You Know What They&apos;re Saying?
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400">
          Aegis runs adversarial tests on your agent-to-agent systems and maps
          every vulnerability to SOC&nbsp;2 controls — before your auditor does.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="mailto:subodhbhattarai477@gmail.com"
            className="inline-flex h-11 items-center rounded-md bg-white px-8 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
          >
            Book a Security Assessment
          </a>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center rounded-md border border-white/20 px-8 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            See a Sample Report
          </Link>
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section className="border-t border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            The Attack Surface Nobody&apos;s Watching
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {problems.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-5 w-5 text-neutral-300" />
                  </div>
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SOLUTION ─── */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Compliance-Grade Security for Agent Systems
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/20">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                    Step {s.step}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    {s.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Built for Teams Shipping AI in Production
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center"
              >
                <p className="text-4xl font-bold tracking-tight">{s.value}</p>
                <p className="mt-2 text-sm text-neutral-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-xl px-6 py-24">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
              Security Assessment
            </p>
            <p className="mt-4 text-5xl font-bold tracking-tight">$6,000</p>
            <ul className="mt-8 space-y-3 text-left text-sm text-neutral-300">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="mailto:subodhbhattarai477@gmail.com"
              className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-md bg-white text-sm font-medium text-black transition-colors hover:bg-neutral-200"
            >
              Book Your Assessment
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-12 text-center text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="font-medium text-neutral-400">
              Aegis Security Platform
            </span>
          </div>
          <p>Protecting the agentic web</p>
        </div>
      </footer>
    </div>
  );
}
