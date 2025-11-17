import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CheckCircle, XCircle, Clock, Send, Loader2 } from "lucide-react"
import { evaluatePolicy } from "@/services/api"

const BrokerDashboard = () => {
  const navigate = useNavigate()
  const [policyType, setPolicyType] = React.useState("loan")
  const [formData, setFormData] = React.useState({
    bankId: "chase",
    age: "",
    annualIncome: "",
    creditScore: "",
    // Loan specific
    loanAmount: "",
    personalGuarantee: false,
    // Insurance specific
    coverageAmount: "",
    term: "",
    insuranceType: "term_life",
    healthConditions: "good",
    smoker: false
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [decisionResult, setDecisionResult] = React.useState(null)
  const [error, setError] = React.useState(null)

  // Mock applications history
  const [applications, setApplications] = React.useState([
    { id: "APP-2024-001", type: "loan", submittedDate: "2024-01-15", amount: "$150,000", status: "approved", decision: "Auto-Approved" },
    { id: "APP-2024-002", type: "insurance", submittedDate: "2024-01-14", amount: "$500,000", status: "manual_review", decision: "Manual Review Required" },
    { id: "APP-2024-003", type: "loan", submittedDate: "2024-01-12", amount: "$250,000", status: "rejected", decision: "Auto-Rejected" }
  ])

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handlePolicyTypeChange = (value) => {
    setPolicyType(value)
    setDecisionResult(null)
    setError(null)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Build request body based on policy type
      const requestBody = {
        bank_id: formData.bankId,
        policy_type: policyType,
        applicant: {
          age: parseInt(formData.age),
          annualIncome: parseFloat(formData.annualIncome),
          creditScore: parseInt(formData.creditScore)
        },
        policy: {}
      }

      if (policyType === "loan") {
        requestBody.applicant = {
          ...requestBody.applicant
        }
        requestBody.policy = {
          loanAmount: parseFloat(formData.loanAmount),
          personalGuarantee: formData.personalGuarantee
        }
      } else {
        // Insurance
        requestBody.applicant = {
          ...requestBody.applicant,
          healthConditions: formData.healthConditions,
          smoker: formData.smoker
        }
        requestBody.policy = {
          coverageAmount: parseFloat(formData.coverageAmount),
          term: parseInt(formData.term),
          type: formData.insuranceType
        }
      }

      // Call the API
      const result = await evaluatePolicy(requestBody)
      
      // Add to application history
      const newApp = {
        id: `APP-2024-${String(applications.length + 1).padStart(3, '0')}`,
        type: policyType,
        submittedDate: new Date().toISOString().split('T')[0],
        amount: policyType === "loan" 
          ? `$${parseInt(formData.loanAmount).toLocaleString()}`
          : `$${parseInt(formData.coverageAmount).toLocaleString()}`,
        status: result.decision?.approved ? "approved" : "rejected",
        decision: result.decision?.approved ? "Approved" : "Rejected"
      }
      
      setApplications([newApp, ...applications])
      setDecisionResult(result)
      setError(null) // Clear any previous errors on success
    } catch (err) {
      // Enhanced error handling
      let errorMessage = "Failed to evaluate application. Please try again."
      
      if (err.message) {
        errorMessage = err.message
        // Add status code if available
        if (err.status) {
          errorMessage = `[${err.status}] ${errorMessage}`
        }
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = "Unable to connect to the server. Please check if the API server is running on http://localhost:9000"
      } else if (err.name === 'TypeError') {
        errorMessage = "Network error. Please check your connection and try again."
      }
      
      setError(errorMessage)
      console.error("API Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewApplication = () => {
    setDecisionResult(null)
    setError(null)
    setFormData({
      bankId: "chase",
      age: "",
      annualIncome: "",
      creditScore: "",
      loanAmount: "",
      personalGuarantee: false,
      coverageAmount: "",
      term: "",
      insuranceType: "term_life",
      healthConditions: "good",
      smoker: false
    })
  }

  const fillSampleData = () => {
    if (policyType === "loan") {
      setFormData({
        ...formData,
        bankId: "chase",
        age: "35",
        annualIncome: "85000",
        creditScore: "720",
        loanAmount: "150000",
        personalGuarantee: false
      })
    } else {
      setFormData({
        ...formData,
        bankId: "chase",
        age: "35",
        annualIncome: "75000",
        creditScore: "720",
        coverageAmount: "500000",
        term: "20",
        insuranceType: "term_life",
        healthConditions: "good",
        smoker: false
      })
    }
  }

  const canSubmit = formData.bankId && formData.age && formData.annualIncome && formData.creditScore && 
    (policyType === "loan" ? formData.loanAmount : (formData.coverageAmount && formData.term))

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5" style={{ color: 'hsl(var(--color-success))' }} />
      case "rejected":
        return <XCircle className="w-5 h-5" style={{ color: 'hsl(var(--color-destructive))' }} />
      case "manual_review":
        return <Clock className="w-5 h-5" style={{ color: 'hsl(var(--color-warning))' }} />
      default:
        return null
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "manual_review":
        return <Badge variant="secondary">Manual Review</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FEF3E2 0%, #FFF5E6 50%, #FEF3E2 100%)' }}>
      {/* Header */}
      <header className="border-b shadow-lg" style={{ 
        background: 'linear-gradient(135deg, #FEF3E2 0%, #FFF5E6 100%)',
        borderColor: 'rgba(250, 129, 47, 0.2)'
      }}>
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/landing')}
                className="hover:scale-110 transition-transform duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.8) 0%, rgba(254, 243, 226, 0.6) 100%)'
                }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: 'hsl(var(--color-primary))' }} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold" style={{
                  background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Broker Dashboard</h1>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Submit loan applications and track decisions
                </p>
              </div>
            </div>
            <Badge 
              variant="default"
              className="shadow-md"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)'
              }}
            >
              Broker
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Application Form */}
        <Card 
          className="shadow-lg hover:shadow-xl transition-all duration-300 border-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.9) 0%, rgba(254, 243, 226, 0.7) 100%)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold" style={{
                  background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>New {policyType === "loan" ? "Loan" : "Insurance"} Application</CardTitle>
                <CardDescription className="font-medium">Submit customer application for instant decision</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fillSampleData}
                className="shadow-md hover:shadow-lg transition-all duration-300"
                style={{
                  borderColor: 'hsl(var(--color-primary))',
                  color: 'hsl(var(--color-primary))'
                }}
              >
                Fill Sample Data
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Policy Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="policyType">Policy Type *</Label>
              <Select value={policyType} onValueChange={handlePolicyTypeChange}>
                <SelectTrigger id="policyType">
                  <SelectValue placeholder="Select policy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loan">Loan Application</SelectItem>
                  <SelectItem value="insurance">Insurance Application</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vendor ID Field */}
            <div className="space-y-2">
              <Label htmlFor="bankId">Vendor ID *</Label>
              <Input
                id="bankId"
                value={formData.bankId}
                onChange={(e) => handleInputChange('bankId', e.target.value)}
                placeholder="e.g., chase"
              />
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="e.g., 35"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditScore">Credit Score *</Label>
                <Input
                  id="creditScore"
                  type="number"
                  value={formData.creditScore}
                  onChange={(e) => handleInputChange('creditScore', e.target.value)}
                  placeholder="e.g., 720"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="annualIncome">Annual Income ($) *</Label>
                <Input
                  id="annualIncome"
                  type="number"
                  value={formData.annualIncome}
                  onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                  placeholder="e.g., 85000"
                />
              </div>
            </div>

            {/* Loan Specific Fields */}
            {policyType === "loan" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount ($) *</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                    placeholder="e.g., 150000"
                  />
                </div>
                <div className="space-y-2 flex items-end">
                  <div className="flex items-center space-x-2 pb-2">
                    <input
                      type="checkbox"
                      id="personalGuarantee"
                      checked={formData.personalGuarantee}
                      onChange={(e) => handleInputChange('personalGuarantee', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="personalGuarantee" className="cursor-pointer">
                      Personal Guarantee
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Insurance Specific Fields */}
            {policyType === "insurance" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coverageAmount">Coverage Amount ($) *</Label>
                  <Input
                    id="coverageAmount"
                    type="number"
                    value={formData.coverageAmount}
                    onChange={(e) => handleInputChange('coverageAmount', e.target.value)}
                    placeholder="e.g., 500000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">Term (years) *</Label>
                  <Input
                    id="term"
                    type="number"
                    value={formData.term}
                    onChange={(e) => handleInputChange('term', e.target.value)}
                    placeholder="e.g., 20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceType">Insurance Type</Label>
                  <Select 
                    value={formData.insuranceType} 
                    onValueChange={(value) => handleInputChange('insuranceType', value)}
                  >
                    <SelectTrigger id="insuranceType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="term_life">Term Life</SelectItem>
                      <SelectItem value="whole_life">Whole Life</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="healthConditions">Health Conditions</Label>
                  <Select 
                    value={formData.healthConditions} 
                    onValueChange={(value) => handleInputChange('healthConditions', value)}
                  >
                    <SelectTrigger id="healthConditions">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex items-end">
                  <div className="flex items-center space-x-2 pb-2">
                    <input
                      type="checkbox"
                      id="smoker"
                      checked={formData.smoker}
                      onChange={(e) => handleInputChange('smoker', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="smoker" className="cursor-pointer">
                      Smoker
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg border-2" style={{ 
                backgroundColor: '#fee2e2',
                borderColor: '#dc2626',
                color: '#991b1b'
              }}>
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                  <div className="flex-1">
                    <p className="font-semibold mb-1" style={{ color: '#991b1b' }}>Error</p>
                    <p className="text-sm" style={{ color: '#991b1b' }}>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              className="w-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
              onClick={handleSubmit} 
              disabled={!canSubmit || isSubmitting}
              style={{
                background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Decision Result */}
        {decisionResult && (
          <Card 
            className="shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.9) 0%, rgba(254, 243, 226, 0.7) 100%)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <CardHeader>
              <CardTitle className="text-xl font-bold" style={{
                background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Application Decision</CardTitle>
              <CardDescription className="font-medium">
                Evaluation completed in {decisionResult.execution_time_ms}ms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ 
                    backgroundColor: decisionResult.decision?.approved 
                      ? 'hsl(var(--color-success)/10)' 
                      : 'hsl(var(--color-destructive)/10)'
                  }}>
                    {decisionResult.decision?.approved ? (
                      <CheckCircle className="w-10 h-10" style={{ color: 'hsl(var(--color-success))' }} />
                    ) : (
                      <XCircle className="w-10 h-10" style={{ color: 'hsl(var(--color-destructive))' }} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      {decisionResult.decision?.approved ? "Approved" : "Rejected"}
                    </h3>
                    {decisionResult.decision?.premium_rate && (
                      <p className="text-lg font-semibold mb-2" style={{ color: 'hsl(var(--color-primary))' }}>
                        Premium Rate: {(decisionResult.decision.premium_rate * 100).toFixed(2)}%
                      </p>
                    )}
                  </div>
                  <div className="pt-4">
                    {decisionResult.decision?.approved ? (
                      <Badge variant="success">Approved</Badge>
                    ) : (
                      <Badge variant="destructive">Rejected</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Reasons */}
              {decisionResult.decision?.reasons && decisionResult.decision.reasons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Decision Reasons:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {decisionResult.decision.reasons.map((reason, index) => (
                      <li key={index} className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Application Details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'hsl(var(--color-border))' }}>
                <div>
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Vendor ID</p>
                  <p className="font-medium">{decisionResult.bank_id}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Policy Type</p>
                  <p className="font-medium capitalize">{decisionResult.policy_type}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Container ID</p>
                  <p className="font-mono text-xs">{decisionResult.container_id}</p>
                </div>
              </div>

              <Button className="w-full" variant="outline" onClick={handleNewApplication}>
                Submit New Application
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Application History */}
        <Card 
          className="shadow-lg hover:shadow-xl transition-all duration-300 border-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.9) 0%, rgba(254, 243, 226, 0.7) 100%)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold" style={{
                  background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Application History</CardTitle>
                <CardDescription className="font-medium">Recent submitted applications</CardDescription>
              </div>
              <Badge 
                variant="secondary"
                className="shadow-md"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--color-secondary)) 0%, hsl(42, 96%, 50%) 100%)'
                }}
              >
                {applications.length} Applications
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submitted Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{getStatusIcon(app.status)}</TableCell>
                    <TableCell className="font-medium">{app.id}</TableCell>
                    <TableCell className="capitalize">{app.type}</TableCell>
                    <TableCell>{app.amount}</TableCell>
                    <TableCell>{app.submittedDate}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                      {app.decision}
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

export default BrokerDashboard

