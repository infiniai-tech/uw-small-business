import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Briefcase, FileCheck } from "lucide-react"

const LandingPage = () => {
  const navigate = useNavigate()
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FEF3E2 0%, #FFF5E6 50%, #FEF3E2 100%)' }}>
      {/* Header */}
      <header className="border-b shadow-sm" style={{ 
        background: 'linear-gradient(135deg, #FEF3E2 0%, #FFF5E6 100%)',
        borderColor: 'rgba(250, 129, 47, 0.2)'
      }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105" 
              style={{ background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)' }}
            >
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
              <h1 className="text-2xl font-bold tracking-tight" style={{
                background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>UW Small Business Loan Platform</h1>
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
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
            <h2 className="text-5xl font-bold mb-4" style={{
              background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Select Your Role</h2>
            <p className="text-xl font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
              Choose your dashboard to get started with loan underwriting
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role) => {
              const Icon = role.icon
              return (
                <Card 
                  key={role.id} 
                  className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full border-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.9) 0%, rgba(254, 243, 226, 0.7) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <CardHeader className="text-center">
                    <div 
                      className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110"
                      style={{ 
                        background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)',
                        boxShadow: '0 4px 12px rgba(250, 129, 47, 0.4)'
                      }}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold mb-2">{role.title}</CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 flex flex-col flex-1">
                    <div className="space-y-3 flex-1">
                      {role.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3 text-sm">
                          <div 
                            className="w-2 h-2 rounded-full mt-2" 
                            style={{ 
                              background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)'
                            }} 
                          />
                          <span className="font-medium" style={{ color: 'hsl(var(--color-foreground))' }}>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full mt-auto h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                      onClick={() => navigate(`/${role.id}`)}
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)'
                      }}
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
      <footer className="border-t mt-auto shadow-sm" style={{ 
        background: 'linear-gradient(135deg, #FEF3E2 0%, #FFF5E6 100%)',
        borderColor: 'rgba(250, 129, 47, 0.2)'
      }}>
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
            Built with React, Vite, Tailwind CSS, and shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

