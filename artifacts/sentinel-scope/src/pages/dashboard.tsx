import { Layout } from "@/components/layout"
import { useGetDashboard } from "@workspace/api-client-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, ShieldAlert, ArrowRight, ShieldCheck, Bug, Database, Lock, Eye, Network, FileText, Activity, Crosshair, Info } from "lucide-react"

export default function Dashboard() {
  const { data: dashboard, isLoading, error } = useGetDashboard()

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-lg"></div>)}
          </div>
          <div className="h-64 bg-muted rounded-lg w-full"></div>
        </div>
      </Layout>
    )
  }

  if (error || !dashboard) {
    return (
      <Layout>
        <div className="p-6 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          Failed to load dashboard data.
        </div>
      </Layout>
    )
  }

  const riskIconMap: Record<string, React.ReactNode> = {
    direct_prompt_injection: <ShieldAlert className="w-5 h-5 text-red-500" />,
    indirect_injection: <Network className="w-5 h-5 text-orange-500" />,
    data_exfiltration: <Database className="w-5 h-5 text-purple-500" />,
    unsafe_tool_use: <Bug className="w-5 h-5 text-amber-500" />,
    memory_poisoning: <Eye className="w-5 h-5 text-indigo-500" />,
    prompt_extraction: <Lock className="w-5 h-5 text-blue-500" />
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Operational Overview</h1>
          <p className="text-muted-foreground mt-2">Real-time status of agent trace inspections and findings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Cases</p>
                  <p className="text-3xl font-bold">{dashboard.totalCases}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Open Investigations</p>
                  <p className="text-3xl font-bold">{dashboard.openCases}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">High Risk Cases</p>
                  <p className="text-3xl font-bold text-destructive">{dashboard.highRiskCases}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Avg Risk Score</p>
                  <p className="text-3xl font-bold">{dashboard.averageScore}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <Crosshair className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Incidents</CardTitle>
                  <CardDescription>Latest trace analyses requiring attention.</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/cases">View All <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.recentCases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-md">
                      No recent incidents recorded.
                    </div>
                  ) : (
                    dashboard.recentCases.map(incident => (
                      <Link key={incident.id} href={`/cases/${incident.id}`} className="block group">
                        <div className="flex items-center justify-between p-4 rounded-md border border-border bg-card group-hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="shrink-0">
                              {incident.severity === 'critical' && <ShieldAlert className="w-8 h-8 text-destructive" />}
                              {incident.severity === 'high' && <AlertCircle className="w-8 h-8 text-orange-500" />}
                              {incident.severity === 'medium' && <AlertCircle className="w-8 h-8 text-amber-500" />}
                              {incident.severity === 'low' && <Info className="w-8 h-8 text-blue-500" />}
                              {incident.severity === 'safe' && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-foreground">{incident.title}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant={incident.severity as any} className="capitalize text-[10px] px-1.5">{incident.severity}</Badge>
                                <span className="text-xs text-muted-foreground font-mono">{incident.source}</span>
                                <span className="text-xs text-muted-foreground">{new Date(incident.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="capitalize text-xs">{incident.status}</Badge>
                            <div className="text-xs text-muted-foreground mt-1 font-mono">{incident.findingCount} findings</div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Breakdown by vulnerability category.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.riskCounts.map(risk => (
                    <div key={risk.riskType} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                           {riskIconMap[risk.riskType] || <ShieldAlert className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium">{risk.label}</span>
                      </div>
                      <Badge variant="secondary" className="font-mono">{risk.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

