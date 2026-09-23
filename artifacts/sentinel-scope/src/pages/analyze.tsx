import { Layout } from "@/components/layout"
import { useListDemos, useAnalyzeTrace } from "@workspace/api-client-react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShieldCheck, Crosshair, Loader2, FileCode2 } from "lucide-react"
import { useLocation } from "wouter"

export default function Analyze() {
  const [, setLocation] = useLocation()
  const { data: demos, isLoading: loadingDemos } = useListDemos()
  const analyzeMutation = useAnalyzeTrace()
  
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [source, setSource] = useState("manual_entry")
  const [selectedDemo, setSelectedDemo] = useState<string>("")

  const handleDemoSelect = (demoId: string) => {
    setSelectedDemo(demoId)
    if (demoId && demos) {
      const demo = demos.find(d => d.id === demoId)
      if (demo) {
        setTitle(`[Demo] ${demo.label}`)
        setContent(demo.content)
        setSource(demo.id)
      }
    } else {
      setTitle("")
      setContent("")
      setSource("manual_entry")
    }
  }

  const handleAnalyze = () => {
    if (!title || !content) return
    
    analyzeMutation.mutate({ data: { title, content, source } }, {
      onSuccess: (result) => {
        setLocation(`/cases/${result.id}`)
      }
    })
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Trace Inspector</h1>
          <p className="text-muted-foreground mt-2">Paste raw agent execution traces or load labeled scenarios for static security analysis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trace Payload</CardTitle>
                <CardDescription>Enter the transcript or API logs of the agent's session.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Incident Title</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Unusual filesystem access by code_agent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Trace Content</Label>
                  <Textarea 
                    id="content" 
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="User: Please summarize the document...
Agent: [Tool Call] read_file('confidential.txt')..." 
                    className="min-h-[400px] font-mono text-sm leading-relaxed"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-secondary/30 border-t flex justify-between items-center py-4">
                <div className="text-xs text-muted-foreground flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1 text-emerald-500" />
                  No instructions are executed. Static analysis only.
                </div>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!title || !content || analyzeMutation.isPending}
                  className="w-32"
                >
                  {analyzeMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning</>
                  ) : (
                    <><Crosshair className="w-4 h-4 mr-2" /> Inspect Trace</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Load Demo Scenario</CardTitle>
                <CardDescription>Test the engine with known malicious or benign patterns.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingDemos ? (
                    <div className="h-10 bg-muted animate-pulse rounded-md" />
                  ) : (
                    <Select value={selectedDemo} onValueChange={handleDemoSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a scenario..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Manual Entry</SelectItem>
                        {demos?.map(demo => (
                          <SelectItem key={demo.id} value={demo.id}>
                            <div className="flex items-center gap-2">
                              <span className={demo.expectedMalicious ? "text-destructive" : "text-emerald-500"}>
                                •
                              </span>
                              {demo.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {selectedDemo && selectedDemo !== "none" && demos && (
                    <div className="p-4 bg-secondary/50 rounded-md border border-border mt-4">
                      <h4 className="text-sm font-semibold mb-2">Scenario Details</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {demos.find(d => d.id === selectedDemo)?.description}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {demos.find(d => d.id === selectedDemo)?.expectedMalicious ? (
                          <Badge variant="destructive" className="text-[10px]">Malicious Control</Badge>
                        ) : (
                          <Badge variant="safe" className="text-[10px]">Benign Control</Badge>
                        )}
                        {demos.find(d => d.id === selectedDemo)?.riskType && (
                           <Badge variant="outline" className="text-[10px] font-mono">
                             {demos.find(d => d.id === selectedDemo)?.riskType}
                           </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6 space-y-4">
                <FileCode2 className="w-8 h-8 opacity-50" />
                <h3 className="font-semibold">How it works</h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  The Inspector treats every trace as inert text and applies transparent pattern rules across six risk classes. It never executes instructions, opens URLs, or sends content to an external model.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
