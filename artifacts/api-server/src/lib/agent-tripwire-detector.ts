export type RiskType =
  | "direct_prompt_injection"
  | "indirect_injection"
  | "data_exfiltration"
  | "unsafe_tool_use"
  | "memory_poisoning"
  | "prompt_extraction";

export type Severity = "critical" | "high" | "medium" | "low" | "safe";

export interface Finding {
  id: string;
  riskType: RiskType;
  label: string;
  severity: Severity;
  confidence: number;
  evidence: string;
  start: number;
  end: number;
  owasp: string;
  impact: string;
  mitigation: string;
}

interface DetectorRule {
  riskType: RiskType;
  label: string;
  severity: Exclude<Severity, "safe">;
  confidence: number;
  pattern: RegExp;
  owasp: string;
  impact: string;
  mitigation: string;
}

export const riskLabels: Record<RiskType, string> = {
  direct_prompt_injection: "Direct prompt injection",
  indirect_injection: "Indirect injection",
  data_exfiltration: "Sensitive-data exfiltration",
  unsafe_tool_use: "Unsafe tool use",
  memory_poisoning: "Agent memory poisoning",
  prompt_extraction: "System-prompt extraction / role spoofing",
};

const rules: DetectorRule[] = [
  {
    riskType: "direct_prompt_injection",
    label: riskLabels.direct_prompt_injection,
    severity: "high",
    confidence: 94,
    pattern: /\b(ignore|disregard|override)\b.{0,70}\b(previous|prior|above|system|developer)\b.{0,40}\b(instructions?|rules?|message)\b/gi,
    owasp: "LLM01: Prompt Injection",
    impact: "Attempts to replace the agent's governing instructions with untrusted user directives.",
    mitigation: "Separate instructions from data, enforce instruction priority, and require policy checks before actions.",
  },
  {
    riskType: "indirect_injection",
    label: riskLabels.indirect_injection,
    severity: "high",
    confidence: 91,
    pattern: /\b(retrieved|document|web\s?page|page content|tool result)\b.{0,100}\b(ignore|assistant|agent|instruction|execute|follow)\b/gi,
    owasp: "LLM01: Prompt Injection",
    impact: "Untrusted retrieved content may be interpreted as instructions and redirect the agent.",
    mitigation: "Tag retrieved content as untrusted, strip active instructions, and gate actions through policy enforcement.",
  },
  {
    riskType: "data_exfiltration",
    label: riskLabels.data_exfiltration,
    severity: "critical",
    confidence: 96,
    pattern: /\b(send|upload|post|transmit|exfiltrate|forward)\b.{0,90}\b(api\s?key|token|secret|credential|cookie|private key|environment variable|conversation history)\b/gi,
    owasp: "LLM02: Sensitive Information Disclosure",
    impact: "Could disclose secrets, credentials, private context, or user data to an unauthorized destination.",
    mitigation: "Apply output DLP, redact secrets, allowlist destinations, and require confirmation for data movement.",
  },
  {
    riskType: "unsafe_tool_use",
    label: riskLabels.unsafe_tool_use,
    severity: "critical",
    confidence: 95,
    pattern: /\b(run|execute|call|invoke|use)\b.{0,80}\b(rm\s+-rf|shell|terminal|powershell|delete all|drop table|wire transfer|send email|curl\s+https?:)\b/gi,
    owasp: "LLM06: Excessive Agency",
    impact: "Requests a consequential tool action without adequate scope, approval, or validation.",
    mitigation: "Use least-privilege tools, typed arguments, allowlists, dry runs, and human approval for consequential actions.",
  },
  {
    riskType: "memory_poisoning",
    label: riskLabels.memory_poisoning,
    severity: "high",
    confidence: 92,
    pattern: /\b(remember|store|save|persist|add to memory)\b.{0,100}\b(always|future|trusted|authorized|do not verify|ignore policy|new rule)\b/gi,
    owasp: "LLM04: Data and Model Poisoning",
    impact: "Attempts to persist false instructions or trust claims that can influence future agent behavior.",
    mitigation: "Validate memory writes, separate facts from instructions, attach provenance, and support review and expiry.",
  },
  {
    riskType: "prompt_extraction",
    label: riskLabels.prompt_extraction,
    severity: "medium",
    confidence: 90,
    pattern: /\b(reveal|show|print|repeat|quote|dump|what is)\b.{0,80}\b(system prompt|developer message|hidden instructions|initial instructions|chain of thought)\b|\b(you are now|act as)\b.{0,60}\b(system|developer|administrator|root)\b/gi,
    owasp: "LLM07: System Prompt Leakage",
    impact: "Attempts to expose hidden policy text or impersonate a higher-priority role.",
    mitigation: "Do not treat prompts as secrets alone; enforce controls outside the prompt and refuse hidden-context disclosure.",
  },
];

export function analyzeText(content: string): {
  findings: Finding[];
  score: number;
  severity: Severity;
} {
  const findings: Finding[] = [];
  for (const rule of rules) {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
    for (const match of content.matchAll(pattern)) {
      const evidence = match[0].trim();
      const start = match.index ?? 0;
      findings.push({
        id: `${rule.riskType}-${start}`,
        riskType: rule.riskType,
        label: rule.label,
        severity: rule.severity,
        confidence: rule.confidence,
        evidence,
        start,
        end: start + evidence.length,
        owasp: rule.owasp,
        impact: rule.impact,
        mitigation: rule.mitigation,
      });
    }
  }

  const unique = findings
    .sort((a, b) => a.start - b.start || b.confidence - a.confidence)
    .filter((finding, index, all) =>
      all.findIndex((item) => item.riskType === finding.riskType && item.start === finding.start) === index,
    );
  const weights: Record<Severity, number> = { critical: 35, high: 24, medium: 14, low: 6, safe: 0 };
  const score = Math.min(100, unique.reduce((sum, finding) => sum + weights[finding.severity], 0));
  const severity: Severity =
    unique.some((f) => f.severity === "critical") ? "critical"
      : unique.some((f) => f.severity === "high") ? "high"
        : unique.some((f) => f.severity === "medium") ? "medium"
          : unique.some((f) => f.severity === "low") ? "low" : "safe";

  return { findings: unique, score, severity };
}