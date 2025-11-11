import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Briefcase, FileCheck } from "lucide-react"

const LandingPage = ({ onSelectRole }) => {
  const roles = [
    {
      id: "admin",
      title: "Admin",
      description: "Upload policy documents, extract rules, and run tests",
      icon: Settings,
      features: [
        "Upload policy documents",
        "View document library",
        "Extract and manage rules",
        "Test with sample data"
      ]
    },
    {
      id: "broker",
      title: "Broker",
      description: "Submit loan applications and view instant decisions",
      icon: Briefcase,
      features: [
        "Submit customer applications",
        "Get instant decisions",
        "Track application status",
        "View application history"
      ]
    },
    {
      id: "underwriter",
      title: "Underwriter",
      description: "Review applications and make final decisions",
      icon: FileCheck,
      features: [
        "Review all applications",
        "Analyze risk indicators",
        "Manual review queue",
        "Approve or reject applications"
      ]
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--color-background))' }}>
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
              <h1 className="text-2xl font-bold tracking-tight">UW Small Business Loan Platform</h1>
              <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                Policy compliance and underwriting management system
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Select Your Role</h2>
            <p className="text-lg" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
              Choose your dashboard to get started with loan underwriting
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icon
              return (
                <Card key={role.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--color-primary))' }}>
                      <Icon className="w-8 h-8" style={{ color: 'white' }} />
                    </div>
                    <CardTitle className="text-2xl">{role.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 flex flex-col flex-1">
                    <div className="space-y-2 flex-1">
                      {role.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: 'hsl(var(--color-primary))' }} />
                          <span style={{ color: 'hsl(var(--color-muted-foreground))' }}>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full mt-auto" 
                      size="lg"
                      onClick={() => onSelectRole(role.id)}
                    >
                      Enter {role.title} Dashboard
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
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

export default LandingPage

