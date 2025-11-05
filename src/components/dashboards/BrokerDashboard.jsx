import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, CheckCircle, XCircle, Clock, Send } from "lucide-react"

const BrokerDashboard = ({ onBack }) => {
  const [formData, setFormData] = React.useState({
    businessName: "",
    applicantName: "",
    loanAmount: "",
    creditScore: "",
    annualRevenue: "",
    yearsInBusiness: "",
    collateralValue: "",
    debtToIncomeRatio: ""
  })
  const [showResult, setShowResult] = React.useState(false)
  const [decisionResult, setDecisionResult] = React.useState(null)

  // Mock applications history
  const [applications, setApplications] = React.useState([
    { id: "APP-2024-001", businessName: "Tech Solutions LLC", submittedDate: "2024-01-15", loanAmount: "$500,000", status: "approved", decision: "Auto-Approved" },
    { id: "APP-2024-002", businessName: "Green Energy Corp", submittedDate: "2024-01-14", loanAmount: "$750,000", status: "manual_review", decision: "Manual Review Required" },
    { id: "APP-2024-003", businessName: "Retail Plus Inc", submittedDate: "2024-01-12", loanAmount: "$250,000", status: "rejected", decision: "Auto-Rejected" }
  ])

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = () => {
    // Mock decision logic
    const creditScore = parseInt(formData.creditScore)
    const yearsInBusiness = parseInt(formData.yearsInBusiness)
    const loanAmount = parseFloat(formData.loanAmount)
    const collateralValue = parseFloat(formData.collateralValue)
    const ltv = collateralValue > 0 ? (loanAmount / collateralValue) * 100 : 100

    let status, decision, message
    
    if (creditScore >= 720 && yearsInBusiness >= 5 && ltv <= 70) {
      status = "approved"
      decision = "Approved"
      message = "Application meets all policy requirements and has been automatically approved."
    } else if (creditScore < 650 || yearsInBusiness < 2 || ltv > 90) {
      status = "rejected"
      decision = "Rejected"
      message = "Application does not meet minimum policy requirements."
    } else {
      status = "manual_review"
      decision = "Manual Review Required"
      message = "Application requires underwriter review due to borderline criteria."
    }

    const newApp = {
      id: `APP-2024-${String(applications.length + 1).padStart(3, '0')}`,
      businessName: formData.businessName,
      submittedDate: new Date().toISOString().split('T')[0],
      loanAmount: `$${parseInt(formData.loanAmount).toLocaleString()}`,
      status,
      decision
    }

    setApplications([newApp, ...applications])
    setDecisionResult({ status, decision, message, appId: newApp.id })
    setShowResult(true)
  }

  const handleNewApplication = () => {
    setShowResult(false)
    setDecisionResult(null)
    setFormData({
      businessName: "",
      applicantName: "",
      loanAmount: "",
      creditScore: "",
      annualRevenue: "",
      yearsInBusiness: "",
      collateralValue: "",
      debtToIncomeRatio: ""
    })
  }

  const fillSampleData = () => {
    setFormData({
      businessName: "Sample Business LLC",
      applicantName: "John Doe",
      loanAmount: "500000",
      creditScore: "720",
      annualRevenue: "2000000",
      yearsInBusiness: "5",
      collateralValue: "750000",
      debtToIncomeRatio: "35"
    })
  }

  const canSubmit = formData.businessName && formData.applicantName && formData.loanAmount && formData.creditScore

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
                <h1 className="text-xl font-bold">Broker Dashboard</h1>
                <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Submit loan applications and track decisions
                </p>
              </div>
            </div>
            <Badge variant="default">Broker</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {!showResult ? (
          <>
            {/* Application Form */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>New Loan Application</CardTitle>
                    <CardDescription>Submit customer application for instant decision</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fillSampleData}>
                    Fill Sample Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Enter business name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicantName">Applicant Name *</Label>
                    <Input
                      id="applicantName"
                      value={formData.applicantName}
                      onChange={(e) => handleInputChange('applicantName', e.target.value)}
                      placeholder="Enter applicant name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">Loan Amount ($) *</Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      value={formData.loanAmount}
                      onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                      placeholder="e.g., 500000"
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
                  <div className="space-y-2">
                    <Label htmlFor="annualRevenue">Annual Revenue ($)</Label>
                    <Input
                      id="annualRevenue"
                      type="number"
                      value={formData.annualRevenue}
                      onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                      placeholder="e.g., 2000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsInBusiness">Years in Business</Label>
                    <Input
                      id="yearsInBusiness"
                      type="number"
                      value={formData.yearsInBusiness}
                      onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collateralValue">Collateral Value ($)</Label>
                    <Input
                      id="collateralValue"
                      type="number"
                      value={formData.collateralValue}
                      onChange={(e) => handleInputChange('collateralValue', e.target.value)}
                      placeholder="e.g., 750000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="debtToIncomeRatio">Debt-to-Income Ratio (%)</Label>
                    <Input
                      id="debtToIncomeRatio"
                      type="number"
                      step="0.01"
                      value={formData.debtToIncomeRatio}
                      onChange={(e) => handleInputChange('debtToIncomeRatio', e.target.value)}
                      placeholder="e.g., 35"
                    />
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={handleSubmit} disabled={!canSubmit}>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Decision Result */
          <Card>
            <CardHeader>
              <CardTitle>Application Decision</CardTitle>
              <CardDescription>Instant decision for application {decisionResult.appId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ 
                    backgroundColor: decisionResult.status === 'approved' ? 'hsl(var(--color-success)/10)' : 
                                     decisionResult.status === 'rejected' ? 'hsl(var(--color-destructive)/10)' : 
                                     'hsl(var(--color-warning)/10)'
                  }}>
                    {getStatusIcon(decisionResult.status)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{decisionResult.decision}</h3>
                    <p style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                      {decisionResult.message}
                    </p>
                  </div>
                  <div className="pt-4">
                    {getStatusBadge(decisionResult.status)}
                  </div>
                </div>
              </div>
              <Button className="w-full" onClick={handleNewApplication}>
                Submit New Application
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Application History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Application History</CardTitle>
                <CardDescription>Recent submitted applications</CardDescription>
              </div>
              <Badge variant="secondary">{applications.length} Applications</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Loan Amount</TableHead>
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
                    <TableCell>{app.businessName}</TableCell>
                    <TableCell>{app.loanAmount}</TableCell>
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

