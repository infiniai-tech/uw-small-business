import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X } from "lucide-react"

const OnboardingScreen = ({ onNext, formData, setFormData }) => {
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file) => {
    if (file) {
      setFormData({
        ...formData,
        policyDocument: file
      })
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveFile = () => {
    setFormData({
      ...formData,
      policyDocument: null
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePromptChange = (e) => {
    setFormData({
      ...formData,
      prompt: e.target.value
    })
  }

  const canProceed = formData.policyDocument && formData.prompt.trim()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Policy Document Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Policy Document</CardTitle>
          <CardDescription>
            Upload your policy document to extract compliance rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          {!formData.policyDocument ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/10)]'
                  : 'border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))]'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: 'hsl(var(--color-muted-foreground))' }} />
              <p className="text-sm font-medium mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                PDF, DOC, DOCX, or TXT (MAX. 10MB)
              </p>
            </div>
          ) : (
            <div className="border rounded-lg p-4 flex items-center justify-between" style={{ borderColor: 'hsl(var(--color-border))' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[hsl(var(--color-primary)/10)] flex items-center justify-center">
                  <FileText className="w-5 h-5" style={{ color: 'hsl(var(--color-primary))' }} />
                </div>
                <div>
                  <p className="text-sm font-medium">{formData.policyDocument.name}</p>
                  <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                    {(formData.policyDocument.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="hover:bg-[hsl(var(--color-destructive)/10)]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extraction Prompt Card */}
      <Card>
        <CardHeader>
          <CardTitle>Extraction Prompt</CardTitle>
          <CardDescription>
            Provide instructions on what rules to extract from the document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Example: Extract all lending criteria and eligibility requirements for small business loans, including minimum credit scores, revenue requirements, and collateral conditions..."
              className="min-h-[150px]"
              value={formData.prompt}
              onChange={handlePromptChange}
            />
            <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
              Be specific about what information you want to extract from the policy document.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
        >
          Next: Enter Loan Data
        </Button>
      </div>
    </div>
  )
}

export default OnboardingScreen

