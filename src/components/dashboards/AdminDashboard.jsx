import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, X, Play, ArrowLeft, Download, Trash2, Loader2, CheckCircle, AlertCircle, Inbox, FileQuestion } from "lucide-react"
import { uploadDocumentToS3, processPolicyFromS3, getProcessingStatus, downloadFromS3 } from "@/services/api"

const AdminDashboard = ({ onBack }) => {
  const [uploadedDocs, setUploadedDocs] = React.useState([])
  const [selectedFile, setSelectedFile] = React.useState(null)
  const [policyType, setPolicyType] = React.useState("insurance")
  const [bankId, setBankId] = React.useState("")
  const [extractionPrompt, setExtractionPrompt] = React.useState("")
  const [testData, setTestData] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)
  const [processingResults, setProcessingResults] = React.useState(null)
  const [uploadError, setUploadError] = React.useState(null)
  const fileInputRef = React.useRef(null)

  const [extractedRules, setExtractedRules] = React.useState([])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setUploadError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    if (!bankId.trim()) {
      setUploadError("Bank ID is required");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setProcessingResults(null);

    try {
      // Step 1: Upload document to S3 and get the S3 URL
      const uploadResult = await uploadDocumentToS3(selectedFile);
      const s3Url = uploadResult.s3_url;

      // Step 2: Process the policy document from S3
      const result = await processPolicyFromS3({
        s3_url: s3Url,
        policy_type: policyType,
        bank_id: bankId,
      });

      setProcessingResults(result);

      // Add to uploaded docs list
      const newDoc = {
        id: uploadedDocs.length + 1,
        name: selectedFile.name,
        uploadedDate: new Date().toISOString().split('T')[0],
        status: result.status || "processing",
        rulesCount: 0,
        containerId: result.container_id,
        s3Url: result.s3_url,
        jarUrl: result.jar_s3_url,
        drlUrl: result.drl_s3_url,
        excelUrl: result.excel_s3_url,
      };

      setUploadedDocs([newDoc, ...uploadedDocs]);

      // Reset form
      setSelectedFile(null);
      setBankId("");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Poll for status updates if still in progress
      if (result.status === "in_progress") {
        pollProcessingStatus(result.container_id, newDoc.id);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Failed to process document");
    } finally {
      setIsUploading(false);
    }
  };

  const pollProcessingStatus = async (containerId, docId) => {
    try {
      const result = await getProcessingStatus(containerId);
      
      // Update document status
      setUploadedDocs(prevDocs =>
        prevDocs.map(doc =>
          doc.id === docId
            ? { ...doc, status: result.status, jarUrl: result.jar_s3_url, drlUrl: result.drl_s3_url, excelUrl: result.excel_s3_url }
            : doc
        )
      );

      // Continue polling if still in progress
      if (result.status === "in_progress") {
        setTimeout(() => pollProcessingStatus(containerId, docId), 3000);
      }
    } catch (error) {
      console.error("Status polling error:", error);
    }
  };

  const handleDeleteDoc = (id) => {
    setUploadedDocs(uploadedDocs.filter(doc => doc.id !== id))
  }

  const handleDownload = async (url, fileName) => {
    try {
      await downloadFromS3(url, fileName);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file");
    }
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
                <Input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy-type">Policy Type</Label>
                  <Select value={policyType} onValueChange={setPolicyType}>
                    <SelectTrigger id="policy-type">
                      <SelectValue placeholder="Select policy type" />
                    </SelectTrigger>
                    <SelectContent sideOffset={5} position="popper">
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="mortgage">Mortgage</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="underwriting">Underwriting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bank-id">Bank ID <span className="text-red-500">*</span></Label>
                  <Input
                    id="bank-id"
                    type="text"
                    placeholder="e.g., chase, wells_fargo"
                    value={bankId}
                    onChange={(e) => setBankId(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prompt">Extraction Prompt (Optional)</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what rules to extract from the document..."
                  value={extractionPrompt}
                  onChange={(e) => setExtractionPrompt(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {uploadError && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-600">{uploadError}</p>
                </div>
              )}

              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Process
                  </>
                )}
              </Button>
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
            {uploadedDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="w-12 h-12 mb-4" style={{ color: 'hsl(var(--color-muted-foreground))' }} />
                <p className="text-lg font-medium mb-2">No documents uploaded</p>
                <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Upload your first policy document to get started
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Container ID</TableHead>
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
                        {doc.status === 'in_progress' ? (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {doc.status}
                          </Badge>
                        ) : doc.status === 'success' || doc.status === 'processed' ? (
                          <Badge variant="default" className="flex items-center gap-1 w-fit bg-green-600">
                            <CheckCircle className="w-3 h-3" />
                            {doc.status}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{doc.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-mono" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        {doc.containerId || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {doc.jarUrl && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownload(doc.jarUrl, `${doc.name.split('.')[0]}.jar`)}
                              title="Download JAR"
                            >
                              <Download className="w-4 h-4" />
                              <span className="ml-1 text-xs">JAR</span>
                            </Button>
                          )}
                          {doc.drlUrl && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownload(doc.drlUrl, `${doc.name.split('.')[0]}.drl`)}
                              title="Download DRL"
                            >
                              <Download className="w-4 h-4" />
                              <span className="ml-1 text-xs">DRL</span>
                            </Button>
                          )}
                          {doc.excelUrl && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownload(doc.excelUrl, `${doc.name.split('.')[0]}.xlsx`)}
                              title="Download Excel"
                            >
                              <Download className="w-4 h-4" />
                              <span className="ml-1 text-xs">Excel</span>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteDoc(doc.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Processing Results */}
        {processingResults && (
          <Card>
            <CardHeader>
              <CardTitle>Processing Results</CardTitle>
              <CardDescription>Detailed extraction and deployment status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">S3 URL</p>
                  <p className="text-sm text-blue-600 truncate">{processingResults.s3_url}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Container ID</p>
                  <p className="text-sm font-mono">{processingResults.container_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Policy Type</p>
                  <p className="text-sm">{processingResults.policy_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Bank ID</p>
                  <p className="text-sm">{processingResults.bank_id}</p>
                </div>
              </div>

              {processingResults.steps && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">Processing Steps</h4>
                  
                  {processingResults.steps.text_extraction && (
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))', borderWidth: '1px' }}>
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: 'hsl(var(--color-foreground))' }}>Text Extraction</p>
                        <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          Status: {processingResults.steps.text_extraction.status} | 
                          Length: {processingResults.steps.text_extraction.length}
                        </p>
                      </div>
                      <Badge variant={processingResults.steps.text_extraction.status === 'success' ? 'success' : 'secondary'} className={processingResults.steps.text_extraction.status === 'success' ? 'bg-green-600 text-white' : ''}>
                        {processingResults.steps.text_extraction.status}
                      </Badge>
                    </div>
                  )}

                  {processingResults.steps.query_generation && (
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))', borderWidth: '1px' }}>
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: 'hsl(var(--color-foreground))' }}>Query Generation</p>
                        <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          Method: {processingResults.steps.query_generation.method} | 
                          Count: {processingResults.steps.query_generation.count}
                        </p>
                      </div>
                      <Badge variant={processingResults.steps.query_generation.status === 'success' ? 'success' : 'secondary'} className={processingResults.steps.query_generation.status === 'success' ? 'bg-green-600 text-white' : ''}>
                        {processingResults.steps.query_generation.status}
                      </Badge>
                    </div>
                  )}

                  {processingResults.steps.data_extraction && (
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))', borderWidth: '1px' }}>
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: 'hsl(var(--color-foreground))' }}>Data Extraction</p>
                        <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          Method: {processingResults.steps.data_extraction.method}
                        </p>
                      </div>
                      <Badge variant={processingResults.steps.data_extraction.status === 'success' ? 'success' : 'secondary'} className={processingResults.steps.data_extraction.status === 'success' ? 'bg-green-600 text-white' : ''}>
                        {processingResults.steps.data_extraction.status}
                      </Badge>
                    </div>
                  )}

                  {processingResults.steps.rule_generation && (
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))', borderWidth: '1px' }}>
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: 'hsl(var(--color-foreground))' }}>Rule Generation</p>
                        <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          DRL Length: {processingResults.steps.rule_generation.drl_length} | 
                          Decision Table: {processingResults.steps.rule_generation.has_decision_table ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <Badge variant={processingResults.steps.rule_generation.status === 'success' ? 'success' : 'secondary'} className={processingResults.steps.rule_generation.status === 'success' ? 'bg-green-600 text-white' : ''}>
                        {processingResults.steps.rule_generation.status}
                      </Badge>
                    </div>
                  )}

                  {processingResults.steps.deployment && (
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))', borderWidth: '1px' }}>
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: 'hsl(var(--color-foreground))' }}>Deployment</p>
                        <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          {processingResults.steps.deployment.message}
                        </p>
                        {processingResults.steps.deployment.release_id && (
                          <p className="text-xs mt-1 font-mono" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                            {processingResults.steps.deployment.release_id['group-id']}:
                            {processingResults.steps.deployment.release_id['artifact-id']}:
                            {processingResults.steps.deployment.release_id.version}
                          </p>
                        )}
                      </div>
                      <Badge variant={processingResults.steps.deployment.status === 'success' ? 'success' : 'secondary'} className={processingResults.steps.deployment.status === 'success' ? 'bg-green-600 text-white' : ''}>
                        {processingResults.steps.deployment.status}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {(processingResults.jar_s3_url || processingResults.drl_s3_url || processingResults.excel_s3_url) && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Download Generated Files</h4>
                  <div className="flex gap-2">
                    {processingResults.jar_s3_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(processingResults.jar_s3_url, 'rules.jar')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        JAR File
                      </Button>
                    )}
                    {processingResults.drl_s3_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(processingResults.drl_s3_url, 'rules.drl')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        DRL File
                      </Button>
                    )}
                    {processingResults.excel_s3_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(processingResults.excel_s3_url, 'rules.xlsx')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Excel File
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
            {extractedRules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileQuestion className="w-12 h-12 mb-4" style={{ color: 'hsl(var(--color-muted-foreground))' }} />
                <p className="text-lg font-medium mb-2">No rules extracted yet</p>
                <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Rules will appear here after processing policy documents
                </p>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default AdminDashboard

