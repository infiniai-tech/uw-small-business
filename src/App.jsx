import { useState } from 'react'
import { Stepper } from '@/components/Stepper'
import OnboardingScreen from '@/components/screens/OnboardingScreen'
import LoanDataScreen from '@/components/screens/LoanDataScreen'
import FeedbackScreen from '@/components/screens/FeedbackScreen'

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    policyDocument: null,
    prompt: '',
    loanData: {
      loanAmount: '',
      loanTerm: '',
      interestRate: '',
      loanPurpose: '',
      businessName: '',
      businessType: '',
      yearsInBusiness: '',
      annualRevenue: '',
      applicantName: '',
      creditScore: '',
      collateralValue: '',
      debtToIncomeRatio: ''
    }
  })

  const steps = [
    {
      id: 1,
      title: 'Upload Document',
      description: 'Policy & Prompt'
    },
    {
      id: 2,
      title: 'Enter Loan Data',
      description: 'Scenario Details'
    },
    {
      id: 3,
      title: 'View Feedback',
      description: 'Compliance Results'
    }
  ]

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setFormData({
      policyDocument: null,
      prompt: '',
      loanData: {
        loanAmount: '',
        loanTerm: '',
        interestRate: '',
        loanPurpose: '',
        businessName: '',
        businessType: '',
        yearsInBusiness: '',
        annualRevenue: '',
        applicantName: '',
        creditScore: '',
        collateralValue: '',
        debtToIncomeRatio: ''
      }
    })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--color-background))', color: 'hsl(var(--color-foreground))' }}>
      {/* Header */}
      <header className="border-b" style={{ 
        backgroundColor: 'hsl(var(--color-card))',
        borderColor: 'hsl(var(--color-border))'
      }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--color-primary))' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
                style={{ color: 'white' }}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">UW Small Business Loan Analyzer</h1>
              <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                Policy compliance evaluation for small business loans
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="container mx-auto px-4">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-16">
        {currentStep === 1 && (
          <OnboardingScreen
            onNext={handleNext}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {currentStep === 2 && (
          <LoanDataScreen
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {currentStep === 3 && (
          <FeedbackScreen
            onBack={handleBack}
            onReset={handleReset}
            formData={formData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto" style={{ 
        backgroundColor: 'hsl(var(--color-card))',
        borderColor: 'hsl(var(--color-border))'
      }}>
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
            Built with React, Vite, Tailwind CSS, and shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
