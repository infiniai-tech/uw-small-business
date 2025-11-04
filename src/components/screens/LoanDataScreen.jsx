import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const LoanDataScreen = ({ onNext, onBack, formData, setFormData }) => {
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      loanData: {
        ...formData.loanData,
        [field]: value
      }
    })
  }

  const fillDummyData = () => {
    setFormData({
      ...formData,
      loanData: {
        loanAmount: '500000',
        loanTerm: '60',
        interestRate: '7.5',
        loanPurpose: 'Equipment purchase',
        businessName: 'Acme Corporation',
        businessType: 'LLC',
        yearsInBusiness: '5',
        annualRevenue: '2000000',
        applicantName: 'John Smith',
        creditScore: '720',
        collateralValue: '750000',
        debtToIncomeRatio: '35'
      }
    })
  }

  const canProceed = 
    formData.loanData.loanAmount &&
    formData.loanData.loanTerm &&
    formData.loanData.interestRate &&
    formData.loanData.businessName &&
    formData.loanData.applicantName

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Fill Dummy Data Button */}
      <div className="flex justify-end">
        <Button
          onClick={fillDummyData}
          variant="outline"
          size="sm"
        >
          Fill Dummy Data
        </Button>
      </div>
      {/* Loan Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
          <CardDescription>
            Enter the loan scenario information for compliance evaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Loan Amount ($)</Label>
              <Input
                id="loanAmount"
                type="number"
                placeholder="e.g., 500000"
                value={formData.loanData.loanAmount}
                onChange={(e) => handleInputChange('loanAmount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanTerm">Loan Term (months)</Label>
              <Input
                id="loanTerm"
                type="number"
                placeholder="e.g., 60"
                value={formData.loanData.loanTerm}
                onChange={(e) => handleInputChange('loanTerm', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                placeholder="e.g., 7.5"
                value={formData.loanData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanPurpose">Loan Purpose</Label>
              <Input
                id="loanPurpose"
                type="text"
                placeholder="e.g., Equipment purchase"
                value={formData.loanData.loanPurpose}
                onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Provide details about the business applying for the loan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Enter business name"
                value={formData.loanData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                type="text"
                placeholder="e.g., LLC, Corporation, Partnership"
                value={formData.loanData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsInBusiness">Years in Business</Label>
              <Input
                id="yearsInBusiness"
                type="number"
                placeholder="e.g., 5"
                value={formData.loanData.yearsInBusiness}
                onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualRevenue">Annual Revenue ($)</Label>
              <Input
                id="annualRevenue"
                type="number"
                placeholder="e.g., 2000000"
                value={formData.loanData.annualRevenue}
                onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicant Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
          <CardDescription>
            Primary applicant details for the loan application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="applicantName">Applicant Name</Label>
              <Input
                id="applicantName"
                type="text"
                placeholder="Enter applicant name"
                value={formData.loanData.applicantName}
                onChange={(e) => handleInputChange('applicantName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditScore">Credit Score</Label>
              <Input
                id="creditScore"
                type="number"
                placeholder="e.g., 720"
                value={formData.loanData.creditScore}
                onChange={(e) => handleInputChange('creditScore', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collateralValue">Collateral Value ($)</Label>
              <Input
                id="collateralValue"
                type="number"
                placeholder="e.g., 750000"
                value={formData.loanData.collateralValue}
                onChange={(e) => handleInputChange('collateralValue', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debtToIncomeRatio">Debt-to-Income Ratio (%)</Label>
              <Input
                id="debtToIncomeRatio"
                type="number"
                step="0.01"
                placeholder="e.g., 35"
                value={formData.loanData.debtToIncomeRatio}
                onChange={(e) => handleInputChange('debtToIncomeRatio', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
        >
          Next: View Feedback
        </Button>
      </div>
    </div>
  )
}

export default LoanDataScreen

