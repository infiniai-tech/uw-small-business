import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle, Eye, ThumbsUp, ThumbsDown } from "lucide-react"

const UnderwriterDashboard = ({ onBack }) => {
  const [selectedApplication, setSelectedApplication] = React.useState(null)
  const [reviewNotes, setReviewNotes] = React.useState("")

  // Mock applications
  const [applications, setApplications] = React.useState([
    {
      id: "APP-2024-001",
      businessName: "Tech Solutions LLC",
      applicantName: "John Smith",
      loanAmount: "$500,000",
      submittedDate: "2024-01-15",
      status: "approved",
      decision: "Auto-Approved",
      creditScore: 720,
      yearsInBusiness: 5,
      ltv: 66.7,
      dti: 35,
      annualRevenue: "$2,000,000"
    },
    {
      id: "APP-2024-002",
      businessName: "Green Energy Corp",
      applicantName: "Sarah Johnson",
      loanAmount: "$750,000",
      submittedDate: "2024-01-14",
      status: "manual_review",
      decision: "Pending Review",
      creditScore: 690,
      yearsInBusiness: 3,
      ltv: 75,
      dti: 40,
      annualRevenue: "$1,500,000"
    },
    {
      id: "APP-2024-003",
      businessName: "Retail Plus Inc",
      applicantName: "Mike Davis",
      loanAmount: "$250,000",
      submittedDate: "2024-01-12",
      status: "rejected",
      decision: "Auto-Rejected",
      creditScore: 630,
      yearsInBusiness: 1,
      ltv: 95,
      dti: 48,
      annualRevenue: "$400,000"
    },
    {
      id: "APP-2024-004",
      businessName: "Manufacturing Co",
      applicantName: "Lisa Brown",
      loanAmount: "$1,200,000",
      submittedDate: "2024-01-13",
      status: "manual_review",
      decision: "Pending Review",
      creditScore: 705,
      yearsInBusiness: 4,
      ltv: 78,
      dti: 42,
      annualRevenue: "$3,000,000"
    }
  ])

  const manualReviewQueue = applications.filter(app => app.status === "manual_review")
  const approvedCount = applications.filter(app => app.status === "approved").length
  const rejectedCount = applications.filter(app => app.status === "rejected").length

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
        return <Badge variant="secondary">Pending Review</Badge>
      default:
        return null
    }
  }

  const getRiskIndicator = (value, threshold, isLessThan = true) => {
    const isGood = isLessThan ? value <= threshold : value >= threshold
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{value}</span>
        {!isGood && <AlertTriangle className="w-4 h-4" style={{ color: 'hsl(var(--color-warning))' }} />}
      </div>
    )
  }

  const handleReview = (appId, decision) => {
    setApplications(applications.map(app => 
      app.id === appId 
        ? { ...app, status: decision, decision: decision === 'approved' ? 'Manually Approved' : 'Manually Rejected' }
        : app
    ))
    setSelectedApplication(null)
    setReviewNotes("")
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
                <h1 className="text-xl font-bold">Underwriter Dashboard</h1>
                <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Review applications and make final decisions
                </p>
              </div>
            </div>
            <Badge variant="default">Underwriter</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Total Applications</p>
                  <p className="text-3xl font-bold mt-1">{applications.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--color-primary)/10)' }}>
                  <Eye className="w-6 h-6" style={{ color: 'hsl(var(--color-primary))' }} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Pending Review</p>
                  <p className="text-3xl font-bold mt-1">{manualReviewQueue.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--color-warning)/10)' }}>
                  <Clock className="w-6 h-6" style={{ color: 'hsl(var(--color-warning))' }} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Approved</p>
                  <p className="text-3xl font-bold mt-1">{approvedCount}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--color-success)/10)' }}>
                  <CheckCircle className="w-6 h-6" style={{ color: 'hsl(var(--color-success))' }} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Rejected</p>
                  <p className="text-3xl font-bold mt-1">{rejectedCount}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--color-destructive)/10)' }}>
                  <XCircle className="w-6 h-6" style={{ color: 'hsl(var(--color-destructive))' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedApplication ? (
          /* Application Detail View */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Application Review - {selectedApplication.id}</CardTitle>
                  <CardDescription>Detailed risk analysis and decision</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                  Back to List
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Applicant Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-muted)/30)' }}>
                <div>
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Business Name</p>
                  <p className="font-medium">{selectedApplication.businessName}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Applicant Name</p>
                  <p className="font-medium">{selectedApplication.applicantName}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Loan Amount</p>
                  <p className="font-medium">{selectedApplication.loanAmount}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Submitted Date</p>
                  <p className="font-medium">{selectedApplication.submittedDate}</p>
                </div>
              </div>

              {/* Risk Indicators */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Risk Indicators</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'hsl(var(--color-border))' }}>
                    <span className="text-sm">Credit Score (Min: 680)</span>
                    {getRiskIndicator(selectedApplication.creditScore, 680, false)}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'hsl(var(--color-border))' }}>
                    <span className="text-sm">Loan-to-Value Ratio (Max: 80%)</span>
                    {getRiskIndicator(`${selectedApplication.ltv}%`, 80, true)}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'hsl(var(--color-border))' }}>
                    <span className="text-sm">Debt-to-Income Ratio (Max: 43%)</span>
                    {getRiskIndicator(`${selectedApplication.dti}%`, 43, true)}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'hsl(var(--color-border))' }}>
                    <span className="text-sm">Years in Business (Min: 2)</span>
                    {getRiskIndicator(`${selectedApplication.yearsInBusiness} years`, 2, false)}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'hsl(var(--color-border))' }}>
                    <span className="text-sm">Annual Revenue</span>
                    <span className="font-medium">{selectedApplication.annualRevenue}</span>
                  </div>
                </div>
              </div>

              {/* Review Notes */}
              <div className="space-y-2">
                <Label htmlFor="reviewNotes">Underwriter Notes</Label>
                <Textarea
                  id="reviewNotes"
                  placeholder="Add your review notes and decision rationale..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Decision Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={() => handleReview(selectedApplication.id, 'approved')}
                  style={{ backgroundColor: 'hsl(var(--color-success))', color: 'white' }}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve Application
                </Button>
                <Button 
                  className="flex-1" 
                  size="lg"
                  variant="destructive"
                  onClick={() => handleReview(selectedApplication.id, 'rejected')}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject Application
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Manual Review Queue */}
            {manualReviewQueue.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Manual Review Queue</CardTitle>
                      <CardDescription>Applications requiring underwriter review</CardDescription>
                    </div>
                    <Badge variant="secondary">{manualReviewQueue.length} Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application ID</TableHead>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Loan Amount</TableHead>
                        <TableHead>Credit Score</TableHead>
                        <TableHead>LTV</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {manualReviewQueue.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.id}</TableCell>
                          <TableCell>{app.businessName}</TableCell>
                          <TableCell>{app.loanAmount}</TableCell>
                          <TableCell>{app.creditScore}</TableCell>
                          <TableCell>{app.ltv}%</TableCell>
                          <TableCell>{app.submittedDate}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" onClick={() => setSelectedApplication(app)}>
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* All Applications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Applications</CardTitle>
                    <CardDescription>Complete application history</CardDescription>
                  </div>
                  <Badge variant="secondary">{applications.length} Total</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{getStatusIcon(app.status)}</TableCell>
                        <TableCell className="font-medium">{app.id}</TableCell>
                        <TableCell>{app.businessName}</TableCell>
                        <TableCell>{app.applicantName}</TableCell>
                        <TableCell>{app.loanAmount}</TableCell>
                        <TableCell>{app.submittedDate}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(app)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}

export default UnderwriterDashboard

