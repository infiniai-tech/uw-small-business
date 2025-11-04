import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

const FeedbackScreen = ({ onBack, onReset, formData }) => {
  // Mock extracted rules with categories
  const extractedRules = [
    {
      id: 1,
      rule: "Minimum Credit Score",
      requirement: "≥ 680",
      category: "Credit Assessment"
    },
    {
      id: 2,
      rule: "Maximum Loan-to-Value Ratio",
      requirement: "≤ 80%",
      category: "Collateral"
    },
    {
      id: 3,
      rule: "Minimum Years in Business",
      requirement: "≥ 2 years",
      category: "Business History"
    },
    {
      id: 4,
      rule: "Maximum Debt-to-Income Ratio",
      requirement: "≤ 43%",
      category: "Financial Ratios"
    },
    {
      id: 5,
      rule: "Minimum Annual Revenue",
      requirement: "≥ $500,000",
      category: "Financial Performance"
    },
  ]

  // Generate unified compliance feedback with all information
  const generateComplianceFeedback = () => {
    const { loanData } = formData
    const loanAmount = parseFloat(loanData.loanAmount) || 0
    const collateralValue = parseFloat(loanData.collateralValue) || 0
    const ltv = collateralValue > 0 ? (loanAmount / collateralValue) * 100 : 100
    
    return extractedRules.map((rule) => {
      let actualValue, status, message
      
      switch (rule.id) {
        case 1: // Credit Score
          actualValue = loanData.creditScore || "N/A"
          status = parseInt(loanData.creditScore) >= 680 ? "pass" : parseInt(loanData.creditScore) < 680 ? "fail" : "warning"
          message = parseInt(loanData.creditScore) >= 680 
            ? "Meets minimum credit score requirement" 
            : parseInt(loanData.creditScore) < 680 
            ? "Below minimum credit score requirement" 
            : "Credit score not provided"
          break
        case 2: // LTV Ratio
          actualValue = `${ltv.toFixed(1)}%`
          status = ltv <= 80 ? "pass" : "fail"
          message = ltv <= 80 ? "Within acceptable LTV range" : "Exceeds maximum LTV ratio"
          break
        case 3: // Years in Business
          actualValue = `${loanData.yearsInBusiness || "N/A"} years`
          status = parseInt(loanData.yearsInBusiness) >= 2 ? "pass" : parseInt(loanData.yearsInBusiness) < 2 ? "fail" : "warning"
          message = parseInt(loanData.yearsInBusiness) >= 2 
            ? "Meets minimum business history requirement" 
            : parseInt(loanData.yearsInBusiness) < 2 
            ? "Below minimum years in business" 
            : "Years in business not provided"
          break
        case 4: // DTI Ratio
          actualValue = `${loanData.debtToIncomeRatio || "N/A"}%`
          status = parseFloat(loanData.debtToIncomeRatio) <= 43 ? "pass" : parseFloat(loanData.debtToIncomeRatio) > 43 ? "fail" : "warning"
          message = parseFloat(loanData.debtToIncomeRatio) <= 43 
            ? "Within acceptable DTI range" 
            : parseFloat(loanData.debtToIncomeRatio) > 43 
            ? "Exceeds maximum debt-to-income ratio" 
            : "DTI ratio not provided"
          break
        case 5: // Annual Revenue
          actualValue = `$${parseInt(loanData.annualRevenue || 0).toLocaleString()}`
          status = parseInt(loanData.annualRevenue) >= 500000 ? "pass" : parseInt(loanData.annualRevenue) < 500000 ? "fail" : "warning"
          message = parseInt(loanData.annualRevenue) >= 500000 
            ? "Meets minimum revenue requirement" 
            : parseInt(loanData.annualRevenue) < 500000 
            ? "Below minimum annual revenue" 
            : "Annual revenue not provided"
          break
        default:
          actualValue = "N/A"
          status = "warning"
          message = "No data available"
      }
      
      return {
        ...rule,
        actualValue,
        status,
        message
      }
    })
  }

  const complianceFeedback = generateComplianceFeedback()
  const passCount = complianceFeedback.filter(f => f.status === "pass").length
  const failCount = complianceFeedback.filter(f => f.status === "fail").length
  const warningCount = complianceFeedback.filter(f => f.status === "warning").length
  const overallStatus = failCount === 0 && warningCount === 0 ? "approved" : failCount > 0 ? "rejected" : "review"

  const getStatusIcon = (status) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-5 h-5" style={{ color: 'hsl(var(--color-success))' }} />
      case "fail":
        return <XCircle className="w-5 h-5" style={{ color: 'hsl(var(--color-destructive))' }} />
      case "warning":
        return <AlertCircle className="w-5 h-5" style={{ color: 'hsl(var(--color-warning))' }} />
      default:
        return null
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pass":
        return <Badge variant="success">Pass</Badge>
      case "fail":
        return <Badge variant="destructive">Fail</Badge>
      case "warning":
        return <Badge variant="secondary">Warning</Badge>
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Overall Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Compliance Assessment</CardTitle>
              <CardDescription>
                Results based on extracted policy rules and loan scenario data
              </CardDescription>
            </div>
            <div>
              {overallStatus === "approved" && (
                <Badge variant="success" className="text-base px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approved
                </Badge>
              )}
              {overallStatus === "rejected" && (
                <Badge variant="destructive" className="text-base px-4 py-2">
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejected
                </Badge>
              )}
              {overallStatus === "review" && (
                <Badge variant="secondary" className="text-base px-4 py-2">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Needs Review
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" style={{ color: 'hsl(var(--color-success))' }} />
              <span className="text-sm font-medium">{passCount} Passed</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4" style={{ color: 'hsl(var(--color-destructive))' }} />
              <span className="text-sm font-medium">{failCount} Failed</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" style={{ color: 'hsl(var(--color-warning))' }} />
              <span className="text-sm font-medium">{warningCount} Warnings</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unified Compliance Rules & Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Rules & Compliance Results</CardTitle>
          <CardDescription>
            Extracted policy rules and compliance check results for the loan scenario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Rule</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Requirement</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceFeedback.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>{getStatusIcon(feedback.status)}</TableCell>
                  <TableCell className="font-medium">{feedback.rule}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{feedback.category}</Badge>
                  </TableCell>
                  <TableCell>{feedback.requirement}</TableCell>
                  <TableCell className="font-medium">{feedback.actualValue}</TableCell>
                  <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                  <TableCell style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                    {feedback.message}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
        >
          Back to Edit
        </Button>
        <Button
          onClick={onReset}
          variant="secondary"
          size="lg"
        >
          Start New Analysis
        </Button>
      </div>
    </div>
  )
}

export default FeedbackScreen

