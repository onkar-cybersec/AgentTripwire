import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, BookOpen, AlertTriangle } from "lucide-react"

export default function About() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">About AgentTripwire</h1>
          <p className="text-muted-foreground mt-2">Defensive static analysis for autonomous agent traces.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" /> Threat Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Autonomous agents execute actions on behalf of users, often possessing elevated permissions to read files, run code, or access external networks. This broad operational surface area makes them susceptible to subversion.
            </p>
            <p>
              AgentTripwire performs <strong>defensive static trace inspection</strong>. It does not block agents in real time or execute trace content; it helps analysts review user input, retrieved content, tool requests, and memory operations as inert text.
            </p>
            <div className="bg-secondary/40 p-4 rounded-md border border-border mt-4">
              <h4 className="font-semibold text-foreground mb-2 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" /> Tracked Vulnerabilities
              </h4>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Direct Prompt Injection:</strong> User explicitly attempts to override system instructions.</li>
                <li><strong>Indirect Injection:</strong> Agent ingests external poisoned data (e.g., summarizing a malicious webpage) that hijacks control flow.</li>
                <li><strong>Data Exfiltration:</strong> Agent attempts to send sensitive context to unauthorized endpoints via tools (e.g., `fetch` or `curl`).</li>
                <li><strong>Unsafe Tool Use:</strong> Execution of destructive or high-risk commands outside of expected guardrails.</li>
                <li><strong>Memory Poisoning:</strong> Persistent states or long-term memory manipulated to affect future sessions.</li>
                <li><strong>Prompt Extraction / Role Spoofing:</strong> Attempts to reveal the hidden system prompt or assume an administrative persona.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-600">
              <AlertTriangle className="w-5 h-5 mr-2" /> Limitations & Guardrails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              AgentTripwire relies on transparent heuristic pattern matching. It is <strong>not a foolproof prevention mechanism</strong>, and its confidence values are rule strength rather than calibrated probabilities.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Evasion via Obfuscation:</strong> Highly obfuscated injections (e.g., Base64-encoded context or subtle multi-turn manipulation) may bypass static pattern rules.</li>
              <li><strong>False Positives on Security Discussions:</strong> Legitimate discussions about cybersecurity, prompt injection, or debugging code will heavily trigger the engine. Analysts must verify these cases manually.</li>
              <li><strong>No Prevention Guarantee:</strong> This tool supports human review. Runtime sandboxing, policy enforcement, approvals, and least-privilege tool scopes remain mandatory.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center pt-8 pb-4 text-sm text-muted-foreground font-mono">
          AgentTripwire v1.0.0 — Defensive Security Analysis
        </div>
      </div>
    </Layout>
  )
}
