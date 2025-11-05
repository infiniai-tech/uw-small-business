import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileText, X, Play, ArrowLeft, Download, Trash2 } from "lucide-react"

const AdminDashboard = ({ onBack }) => {
  const [uploadedDocs, setUploadedDocs] = React.useState([
    { id: 1, name: "SBA Loan Policy 2024.pdf", uploadedDate: "2024-01-15", status: "processed", rulesCount: 12 },
    { id: 2, name: "Credit Requirements.docx", uploadedDate: "2024-01-10", status: "processed", rulesCount: 8 }
  ])
  const [selectedFile, setSelectedFile] = React.useState(null)
  const [extractionPrompt, setExtractionPrompt] = React.useState("")
  const [testData, setTestData] = React.useState("")
  const fileInputRef = React.useRef(null)

  // Mock extracted rules
  const extractedRules = [
    { id: 1, rule: "Minimum Credit Score", requirement: "≥ 680", category: "Credit Assessment", source: "SBA Loan Policy 2024.pdf" },
    { id: 2, rule: "Maximum Loan-to-Value Ratio", requirement: "≤ 80%", category: "Collateral", source: "SBA Loan Policy 2024.pdf" },
    { id: 3, rule: "Minimum Years in Business", requirement: "≥ 2 years", category: "Business History", source: "SBA Loan Policy 2024.pdf" },
    { id: 4, rule: "Maximum Debt-to-Income Ratio", requirement: "≤ 43%", category: "Financial Ratios", source: "SBA Loan Policy 2024.pdf" },
    { id: 5, rule: "Minimum Annual Revenue", requirement: "≥ $500,000", category: "Financial Performance", source: "SBA Loan Policy 2024.pdf" },
    { id: 6, rule: "Personal Guarantee Required", requirement: "Yes", category: "Legal Requirements", source: "Credit Requirements.docx" },
    { id: 7, rule: "Maximum Loan Amount", requirement: "≤ $5,000,000", category: "Loan Limits", source: "Credit Requirements.docx" },
    { id: 8, rule: "Collateral Coverage", requirement: "≥ 125%", category: "Collateral", source: "Credit Requirements.docx" }
  ]

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      const newDoc = {
        id: uploadedDocs.length + 1,
        name: selectedFile.name,
        uploadedDate: new Date().toISOString().split('T')[0],
        status: "processing",
        rulesCount: 0
      }
      setUploadedDocs([...uploadedDocs, newDoc])
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteDoc = (id) => {
    setUploadedDocs(uploadedDocs.filter(doc => doc.id !== id))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--color-background))' }}>
      {/* Header */}
      <header className="border-b" style={{ 
        backgroundColor: 'hsl(var(--color-card))',
        borderColor: 'hsl(var(--color-border))'
      }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Manage policy documents and extraction rules
                </p>
              </div>
            </div>
            <Badge variant="default">Administrator</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Policy Document</CardTitle>
              <CardDescription>Upload documents to extract compliance rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Document</Label>
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                  <Button onClick={handleUpload} disabled={!selectedFile}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {selectedFile && (
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prompt">Extraction Prompt (Optional)</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what rules to extract from the document..."
                  value={extractionPrompt}
                  onChange={(e) => setExtractionPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Test</CardTitle>
              <CardDescription>Test extracted rules with sample data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-data">Sample Loan Data (JSON)</Label>
                <Textarea
                  id="test-data"
                  placeholder={`{\n  "creditScore": 720,\n  "loanAmount": 500000,\n  "collateralValue": 750000,\n  "yearsInBusiness": 5\n}`}
                  value={testData}
                  onChange={(e) => setTestData(e.target.value)}
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>
              <Button className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Run Test
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Document Library */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Document Library</CardTitle>
                <CardDescription>All uploaded policy documents</CardDescription>
              </div>
              <Badge variant="secondary">{uploadedDocs.length} Documents</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rules Extracted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedDocs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" style={{ color: 'hsl(var(--color-primary))' }} />
                        {doc.name}
                      </div>
                    </TableCell>
                    <TableCell>{doc.uploadedDate}</TableCell>
                    <TableCell>
                      <Badge variant={doc.status === 'processed' ? 'success' : 'secondary'}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.rulesCount} rules</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteDoc(doc.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Extracted Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Extracted Rules</CardTitle>
                <CardDescription>All compliance rules from uploaded documents</CardDescription>
              </div>
              <Badge variant="secondary">{extractedRules.length} Rules</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Source Document</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extractedRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.rule}</TableCell>
                    <TableCell>{rule.requirement}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                      {rule.source}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default AdminDashboard

