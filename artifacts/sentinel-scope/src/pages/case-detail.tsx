import { Layout } from "@/components/layout"
import { useGetCase, useUpdateCase, getGetCaseQueryKey } from "@workspace/api-client-react"
import { useParams } from "wouter"
import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ShieldAlert, AlertTriangle, FileTerminal, Activity, CheckCircle2, Clock, Printer } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

export default function CaseDetail() {
  const { id } = useParams()
  const { data: incident, isLoading, error } = useGetCase(id!)
  const updateMutation = useUpdateCase()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<string>("new")
  const initRef = useRef<string | null>(null)

  useEffect(() => {
    if (incident && initRef.current !== incident.id) {
      setNotes(incident.analystNotes || "")
      setStatus(incident.status)
      initRef.current = incident.id
    }
  }, [incident])

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    updateMutation.mutate(
      { id: id!, data: { status: newStatus as any } },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetCaseQueryKey(id!), data)
          toast({
            title: "Status updated",
            description: `Case moved to ${newStatus}`
          })
        }
      }
    )
  }

  const handleNotesSave = () => {
    updateMutation.mutate(
      { id: id!, data: { analystNotes: notes } },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetCaseQueryKey(id!), data)
          toast({
            title: "Notes saved",
            description: "Analyst notes have been updated."
          })
        }
      }
    )
  }

  const handlePrint = () => {
    window.open(`/api/agent-tripwire/cases/${id}/report`, '_blank')
  }

  const renderHighlightedContent = useMemo(() => {
    if (!incident) return null;
    let content = incident.content;
    const findings = [...incident.findings].sort((a, b) => b.start - a.start); // Sort descending to not mess up indices

    let parts = [];
    let lastIndex = content.length;

    findings.forEach((finding) => {
      if (finding.end <= lastIndex) {
        // text after the finding
        parts.unshift(
          <span key={`text-after-${finding.id}`}>
            {content.slice(finding.end, lastIndex)}
          </span>
        );
        // the highlighted finding
        parts.unshift(
          <span 
            key={`highlight-${finding.id}`} 
            className="bg-destructive/20 text-destructive-foreground font-medium px-1 rounded mx-0.5 border-b-2 border-destructive cursor-help"
            title={`${finding.riskType}: ${finding.label}`}
          >
            {content.slice(finding.start, finding.end)}
          </span>
        );
        lastIndex = finding.start;
      }
    });
    // remaining text before the first finding
    parts.unshift(<span key="text-start">{content.slice(0, lastIndex)}</span>);

    return (
      <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground">
        {parts}
      </div>
    );
  }, [incident]);

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </Layout>
    )
  }

  if (error || !incident) {
    return (
      <Layout>
        <div className="p-8 text-center text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Case Not Found</h2>
          <p className="mt-2">The requested incident trace could not be loaded.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs text-muted-foreground uppercase">CASE-{incident.id.substring(0,8)}</span>
              <Badge variant={incident.severity as any} className="uppercase">{incident.severity}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground">{incident.title}</h1>
            <p className="text-sm text-muted-foreground mt-1 font-mono">Source: {incident.source} | Recorded: {new Date(incident.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Status: New</SelectItem>
                <SelectItem value="investigating">Status: Investigating</SelectItem>
                <SelectItem value="contained">Status: Contained</SelectItem>
                <SelectItem value="closed">Status: Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" /> Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Risk Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-[8px] border-secondary mb-4">
                 <div className="absolute inset-0 rounded-full border-[8px]" 
                      style={{ 
                        borderColor: incident.score > 70 ? 'var(--color-destructive)' : incident.score > 40 ? 'var(--color-warning, orange)' : 'var(--color-primary)',
                        clipPath: `polygon(0 0, 100% 0, 100% ${incident.score}%, 0 ${incident.score}%)`
                      }} 
                 />
                 <span className="text-4xl font-bold font-mono">{incident.score}</span>
              </div>
              <Badge variant="outline" className="font-mono">{incident.findings.length} Anomalies Detected</Badge>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">Analyst Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="min-h-[120px] font-mono text-sm resize-none mb-3"
                placeholder="Document your investigation steps, verified false positives, or escalation plans here..."
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleNotesSave} disabled={notes === incident.analystNotes || updateMutation.isPending}>
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="findings" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
            <TabsTrigger value="findings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6 font-semibold">
              <AlertTriangle className="w-4 h-4 mr-2" /> Detected Findings
            </TabsTrigger>
            <TabsTrigger value="trace" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6 font-semibold">
              <FileTerminal className="w-4 h-4 mr-2" /> Raw Trace Inspection
            </TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6 font-semibold">
              <Activity className="w-4 h-4 mr-2" /> Execution Timeline
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="findings" className="pt-6 space-y-4">
            {incident.findings.length === 0 ? (
              <div className="text-center py-12 bg-secondary/20 rounded-lg border border-dashed">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">No security findings</h3>
                <p className="text-muted-foreground text-sm">Static analysis engine did not detect malicious patterns in this trace.</p>
              </div>
            ) : (
              incident.findings.map(finding => (
                <Card key={finding.id} className="border-l-4" style={{ borderLeftColor: finding.severity === 'critical' ? 'var(--color-destructive)' : 'var(--color-primary)' }}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs">{finding.riskType}</Badge>
                          <span className="text-xs text-muted-foreground font-mono">Conf: {finding.confidence}%</span>
                        </div>
                        <h3 className="text-lg font-bold">{finding.label}</h3>
                      </div>
                      <Badge variant={finding.severity as any} className="capitalize">{finding.severity}</Badge>
                    </div>
                    
                    <div className="bg-muted/50 rounded p-3 mb-4 font-mono text-sm border border-border">
                      <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-sans">Matched Evidence in Trace:</div>
                      <span className="text-destructive font-medium bg-destructive/10 px-1 rounded">{finding.evidence}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-border/50">
                      <div>
                        <strong className="text-foreground block mb-1">Impact Analysis</strong>
                        <p className="text-muted-foreground">{finding.impact}</p>
                      </div>
                      <div>
                        <strong className="text-foreground block mb-1">Mitigation Strategy</strong>
                        <p className="text-muted-foreground">{finding.mitigation}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border/50 flex gap-4 text-xs font-mono text-muted-foreground">
                      <span>OWASP Ref: {finding.owasp}</span>
                      <span>Indices: [{finding.start}, {finding.end}]</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="trace" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Highlighted Trace Payload</CardTitle>
                <CardDescription>Raw inspection with annotated threat indicators.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-card border border-border rounded-md p-4 overflow-x-auto">
                  {renderHighlightedContent}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="timeline" className="pt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {incident.timeline.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No timeline events extracted.</div>
                  ) : (
                    incident.timeline.map((event, idx) => (
                      <div key={idx} className="flex gap-4 relative">
                        {idx !== incident.timeline.length - 1 && (
                          <div className="absolute top-6 left-3 bottom-[-24px] w-px bg-border z-0"></div>
                        )}
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 z-10 border border-border">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div className="flex-1 bg-card border rounded p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="font-mono text-xs">{event.stage}</Badge>
                            <span className="text-xs text-muted-foreground font-mono">{event.time}</span>
                          </div>
                          <p className="text-sm font-medium mb-1">{event.detail}</p>
                          <p className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">{event.outcome}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
