import { Layout } from "@/components/layout"
import { useGetEvaluation } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Database, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Evaluation() {
  const { data: evalData, isLoading } = useGetEvaluation()

  if (isLoading) {
    return (
      <Layout>
         <div className="animate-pulse space-y-6">
           <div className="h-10 bg-muted rounded w-1/4"></div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="h-32 bg-muted rounded-lg"></div>
             <div className="h-32 bg-muted rounded-lg"></div>
             <div className="h-32 bg-muted rounded-lg"></div>
           </div>
           <div className="h-64 bg-muted rounded-lg"></div>
         </div>
      </Layout>
    )
  }

  if (!evalData) {
    return <Layout><div>Error loading evaluation metrics.</div></Layout>
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">System Evaluation</h1>
          <p className="text-muted-foreground mt-2">Precision, recall, and false-positive visibility against the benchmark dataset.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Global Precision</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-bold font-mono">{(evalData.precision * 100).toFixed(1)}%</span>
                <Progress value={evalData.precision * 100} className="h-2" />
                <span className="text-xs text-muted-foreground mt-1">Accuracy of positive detections</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Global Recall</span>
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-bold font-mono">{(evalData.recall * 100).toFixed(1)}%</span>
                <Progress value={evalData.recall * 100} className="h-2" />
                <span className="text-xs text-muted-foreground mt-1">Detection rate of true threats</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">False Positive Rate</span>
                <XCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-bold font-mono text-amber-600">
                  {((evalData.falsePositives / evalData.datasetSize) * 100).toFixed(1)}%
                </span>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  {evalData.falsePositives} / {evalData.datasetSize} traces
                </div>
                <span className="text-xs text-muted-foreground mt-1">Benign traces flagged as malicious</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Performance metrics isolated by attack vector.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk Category</TableHead>
                  <TableHead className="text-right">True Positives</TableHead>
                  <TableHead className="text-right">False Positives</TableHead>
                  <TableHead className="text-right">False Negatives</TableHead>
                  <TableHead className="text-right">Precision</TableHead>
                  <TableHead className="text-right">Recall</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evalData.rows.map(row => (
                  <TableRow key={row.riskType}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="font-mono text-xs mb-1 block w-fit">{row.riskType}</Badge>
                      {row.label}
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-600">{row.truePositive}</TableCell>
                    <TableCell className="text-right font-mono text-amber-600">{row.falsePositive}</TableCell>
                    <TableCell className="text-right font-mono text-destructive">{row.falseNegative}</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {(row.precision * 100).toFixed(1)}%
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${row.precision * 100}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {(row.recall * 100).toFixed(1)}%
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${row.recall * 100}%` }} />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-secondary/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Database className="w-4 h-4 mr-2" /> Evaluation Methodology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {evalData.methodology}
            </p>
          </CardContent>
        </Card>

      </div>
    </Layout>
  )
}
