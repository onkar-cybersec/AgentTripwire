import { Layout } from "@/components/layout"
import { useListCases } from "@workspace/api-client-react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, AlertCircle, ArrowRight } from "lucide-react"
import { Link } from "wouter"

export default function Cases() {
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  
  const { data: cases, isLoading, error } = useListCases({
    search: search || undefined,
    severity: severityFilter !== "all" ? severityFilter as any : undefined
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Incident Cases</h1>
            <p className="text-muted-foreground mt-2">Historical archive of all analyzed agent traces and findings.</p>
          </div>
          <Button asChild>
            <Link href="/analyze">New Analysis</Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
              <Filter className="w-4 h-4 mr-2" /> 
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, title, or source..."
                  className="pl-9 font-mono text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="safe">Safe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="rounded-md border-0">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="w-[120px] font-mono text-xs">Case ID</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                        Loading cases...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-destructive">
                      <div className="flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Failed to load cases
                      </div>
                    </TableCell>
                  </TableRow>
                ) : cases?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No cases found matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  cases?.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs text-muted-foreground">{c.id.substring(0, 8)}</TableCell>
                      <TableCell>
                        <Badge variant={c.severity as any} className="capitalize">{c.severity}</Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{c.title}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{c.source}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-primary" 
                               style={{ width: `${c.score}%`, backgroundColor: c.score > 70 ? 'var(--color-destructive)' : c.score > 40 ? 'orange' : 'var(--color-primary)' }} 
                             />
                           </div>
                           <span className="text-xs font-mono">{c.score}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">{c.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/cases/${c.id}`}>View <ArrowRight className="w-4 h-4 ml-1" /></Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
