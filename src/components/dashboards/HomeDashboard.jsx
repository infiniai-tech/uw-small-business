import * as React from "react"
import { useCallback } from "react"
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  addEdge,
  MarkerType,
  Position,
  BackgroundVariant,
  Handle
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FileCheck, BarChart3, Users, Shield, TrendingUp, LayoutDashboard, Building2, Plus, Search, Upload, X, Loader2, CheckCircle, AlertCircle, FileText, Download, Eye, Play, XCircle, Clock, Zap, ArrowRight, GitBranch, ChevronLeft, ChevronRight, Edit } from "lucide-react"
import { getAllBanks, getBankPolicies, getPolicyDetails, getExtractedRules, evaluatePolicy, uploadDocumentToS3, processPolicyFromS3, updateHierarchicalRules, addHierarchicalRule } from "@/services/api"
import EditRuleModal from "@/components/EditRuleModal"
import AddRuleModal from "@/components/AddRuleModal"

// Custom Rule Node Component for the board
const RuleNode = ({ data }) => {
  return (
    <div 
      className="px-4 py-3 shadow-lg rounded-xl border-2 transition-all duration-200 hover:shadow-xl relative"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 250, 240, 0.95) 100%)',
        borderColor: data.passed ? '#22c55e' : (data.passed === false ? '#ef4444' : 'rgba(250, 129, 47, 0.4)'),
        borderLeftWidth: '6px',
        borderLeftColor: data.passed ? '#22c55e' : (data.passed === false ? '#ef4444' : '#FA812F'),
        minWidth: '280px',
        maxWidth: '350px'
      }}
    >
      {/* Target Handle (Left side - for incoming connections) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#FA812F',
          width: '12px',
          height: '12px',
          border: '2px solid white'
        }}
      />
      
      {/* Source Handle (Right side - for outgoing connections) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#FA812F',
          width: '12px',
          height: '12px',
          border: '2px solid white'
        }}
      />
      {/* Node Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div 
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: data.passed ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)'
                : (data.passed === false ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(250, 129, 47, 0.2) 0%, rgba(250, 129, 47, 0.1) 100%)')
            }}
          >
            {data.passed ? (
              <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />
            ) : data.passed === false ? (
              <XCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
            ) : (
              <AlertCircle className="w-4 h-4" style={{ color: '#FA812F' }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight break-words" style={{ color: 'hsl(var(--color-foreground))' }}>
              {data.label || data.name || data.rule_name || 'Rule'}
            </p>
          </div>
        </div>
        {data.passed !== undefined && (
          <span 
            className="px-2 py-0.5 rounded-md text-xs font-bold shrink-0"
            style={{
              background: data.passed ? '#22c55e' : '#ef4444',
              color: 'white'
            }}
          >
            {data.passed ? 'PASS' : 'FAIL'}
          </span>
        )}
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-xs leading-tight mb-2" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
          {data.description}
        </p>
      )}

      {/* Expected vs Actual */}
      {data.expected && (
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div 
            className="rounded px-2 py-1.5 border"
            style={{
              background: 'rgba(250, 129, 47, 0.06)',
              borderColor: 'rgba(250, 129, 47, 0.2)'
            }}
          >
            <p className="text-xs font-medium mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))', fontSize: '10px' }}>
              Expected
            </p>
            <p className="text-xs font-bold font-mono" style={{ color: 'hsl(var(--color-primary))' }}>
              {data.expected}
            </p>
          </div>
          <div 
            className="rounded px-2 py-1.5 border"
            style={{
              background: data.passed ? 'rgba(34, 197, 94, 0.06)' : 'rgba(239, 68, 68, 0.06)',
              borderColor: data.passed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
            }}
          >
            <p className="text-xs font-medium mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))', fontSize: '10px' }}>
              Actual
            </p>
            <p className="text-xs font-bold font-mono" style={{ color: data.passed ? '#22c55e' : '#ef4444' }}>
              {data.actual}
            </p>
          </div>
        </div>
      )}

      {/* Confidence Bar */}
      {data.confidence !== undefined && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium" style={{ color: 'hsl(var(--color-muted-foreground))', fontSize: '10px' }}>
              Confidence
            </span>
            <span className="text-xs font-bold" style={{ color: 'hsl(var(--color-primary))' }}>
              {(data.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div 
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(250, 129, 47, 0.1)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${data.confidence * 100}%`,
                background: 'linear-gradient(90deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)'
              }}
            />
          </div>
        </div>
      )}

      {/* Dependency badge */}
      {data.dependencyCount > 0 && (
        <div 
          className="mt-2 flex items-center gap-1 px-2 py-1 rounded"
          style={{
            background: 'rgba(147, 51, 234, 0.1)',
            borderLeft: '2px solid #9333ea'
          }}
        >
          <GitBranch className="w-3 h-3" style={{ color: '#9333ea' }} />
          <span className="text-xs font-semibold" style={{ color: '#9333ea' }}>
            {data.dependencyCount} sub-rules
          </span>
        </div>
      )}
    </div>
  )
}

const nodeTypes = {
  ruleNode: RuleNode
}

const HomeDashboard = () => {
  const [activeSection, setActiveSection] = React.useState("overview")
  const [selectedBankForTest, setSelectedBankForTest] = React.useState("")
  const [selectedPolicyForTest, setSelectedPolicyForTest] = React.useState("")
  const [isAddBankModalOpen, setIsAddBankModalOpen] = React.useState(false)
  const [showCloseConfirmation, setShowCloseConfirmation] = React.useState(false)

  // Recursive component to render rule dependencies as a tree
  const RuleDependency = ({ dep, depth = 1, isLast = false, onEdit, onView }) => {
    const maxDepth = 5
    const depthColors = [
      '#9333ea', // Purple
      '#3b82f6', // Blue
      '#10b981', // Teal
      '#f59e0b', // Amber
      '#ec4899'  // Pink
    ]
    const lineColor = depthColors[Math.min(depth - 1, maxDepth - 1)]

    return (
      <div className="relative flex gap-2">
        {/* Tree connector lines */}
        <div className="relative flex-shrink-0" style={{ width: '24px' }}>
          {/* Vertical line from parent */}
          {depth > 1 && (
            <div 
              className="absolute left-0 top-0 w-0.5" 
              style={{ 
                height: isLast ? '12px' : '100%',
                background: lineColor,
                opacity: 0.3
              }} 
            />
          )}
          {/* Horizontal connector */}
          <div 
            className="absolute left-0 top-3 h-0.5" 
            style={{ 
              width: '16px',
              background: lineColor,
              opacity: 0.4
            }} 
          />
          {/* Node circle */}
          <div 
            className="absolute left-[-3px] top-2.5 w-2 h-2 rounded-full border-2"
            style={{
              borderColor: lineColor,
              background: lineColor
            }}
          />
        </div>

        {/* Rule content */}
        <div className="flex-1 pb-3">
          <div 
            className="p-3 rounded-lg border transition-all duration-200 hover:shadow-md"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderColor: 'rgba(250, 129, 47, 0.15)',
              borderLeftWidth: '3px',
              borderLeftColor: lineColor
            }}
          >
            {/* Header with title and badges */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-left" style={{ color: 'hsl(var(--color-foreground))' }}>
                  {dep.id}. {dep.name}
                </p>
                {dep.dependencies && dep.dependencies.length > 0 && (
                  <div 
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md"
                    style={{
                      background: `${lineColor}15`,
                      border: `1px solid ${lineColor}40`
                    }}
                  >
                    <GitBranch className="w-3 h-3" style={{ color: lineColor }} />
                    <span className="text-xs font-semibold" style={{ color: lineColor }}>
                      {dep.dependencies.length}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: 'rgba(250, 129, 47, 0.08)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'hsl(var(--color-primary))' }}>
                    {(dep.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                {onView && (
                  <div
                    className="h-6 w-6 hover:bg-blue-50 transition-colors rounded-md flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      onView(dep)
                    }}
                    title="View rule details"
                  >
                    <Eye className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
                  </div>
                )}
                {onEdit && (
                  <div
                    className="h-6 w-6 hover:bg-orange-50 transition-colors rounded-md flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(dep)
                    }}
                    title="Edit rule"
                  >
                    <Edit className="w-3.5 h-3.5" style={{ color: 'hsl(var(--color-primary))' }} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Description */}
            <p className="text-xs leading-relaxed mb-2 text-left" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
              {dep.description}
            </p>

            {/* Expected Condition */}
            <div className="text-xs text-left">
              <span className="font-semibold text-left" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Expected: </span>
              <span className="font-mono font-semibold text-left" style={{ color: 'hsl(var(--color-foreground))' }}>
                {dep.expected}
              </span>
            </div>
          </div>

          {/* Recursively render nested dependencies */}
          {dep.dependencies && dep.dependencies.length > 0 && (
            <div className="mt-2">
              {dep.dependencies.map((nestedDep, index) => (
                <RuleDependency 
                  key={nestedDep.id} 
                  dep={nestedDep} 
                  depth={depth + 1}
                  isLast={index === dep.dependencies.length - 1}
                  onEdit={onEdit}
                  onView={onView}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
  const [selectedFile, setSelectedFile] = React.useState(null)
  const [insuranceType, setInsuranceType] = React.useState("")
  const [bankName, setBankName] = React.useState("")
  const [processingStatus, setProcessingStatus] = React.useState("idle") // idle, processing, completed, error
  const [processingOutput, setProcessingOutput] = React.useState(null)
  const [visibleSteps, setVisibleSteps] = React.useState(0)
  const [currentProcessingStep, setCurrentProcessingStep] = React.useState(0) // 0 = none, 1-5 = step being processed
  const fileInputRef = React.useRef(null)
  const processingTimersRef = React.useRef([])
  
  // Bank Details States
  const [selectedBank, setSelectedBank] = React.useState(null)
  const [selectedPolicy, setSelectedPolicy] = React.useState("")
  const [testExample, setTestExample] = React.useState("approved")
  const [testResponse, setTestResponse] = React.useState(null)
  const [isExecuting, setIsExecuting] = React.useState(false)

  // Mock bank policies data
  const bankPoliciesData = {
    chase: [
      { id: "insurance", name: "Insurance Policy", type: "insurance", rulesCount: 12 },
      { id: "loan", name: "Loan Policy", type: "loan", rulesCount: 10 }
    ],
    wells_fargo: [
      { id: "insurance", name: "Insurance Policy", type: "insurance", rulesCount: 8 }
    ],
    bank_of_america: [
      { id: "insurance", name: "Insurance Policy", type: "insurance", rulesCount: 15 }
    ],
    cibc: [
      { id: "loan", name: "Loan Policy", type: "loan", rulesCount: 6 }
    ]
  }

  // Default test examples (fallback)
  const defaultTestExamples = {
    approved: {
      name: "Insurance Application (Approved)",
      request: {
        bank_id: "chase",
        policy_type: "insurance",
        applicant: {
          age: 35,
          annualIncome: 75000,
          creditScore: 720,
          healthConditions: "good",
          smoker: false
        },
        policy: {
          coverageAmount: 500000,
          termYears: 20,
          type: "term_life"
        }
      }
    },
    rejectedAge: {
      name: "Insurance Application (Rejected - Age)",
      request: {
        bank_id: "chase",
        policy_type: "insurance",
        applicant: {
          age: 70,
          annualIncome: 75000,
          creditScore: 720,
          healthConditions: "good",
          smoker: false
        },
        policy: {
          coverageAmount: 500000,
          termYears: 20,
          type: "term_life"
        }
      }
    },
    rejectedCredit: {
      name: "Insurance Application (Rejected - Credit Score)",
      request: {
        bank_id: "chase",
        policy_type: "insurance",
        applicant: {
          age: 35,
          annualIncome: 75000,
          creditScore: 620,
          healthConditions: "good",
          smoker: false
        },
        policy: {
          coverageAmount: 500000,
          termYears: 20,
          type: "term_life"
        }
      }
    }
  }

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard
    },
    {
      id: "bank-management",
      label: "Vendor Management",
      icon: Building2
    }
  ]

  const stats = [
    {
      label: "Total Applications",
      value: "1,247",
      change: "+12.5%",
      icon: FileCheck,
      color: "#FA812F" // Orange
    },
    {
      label: "Approved Rate",
      value: "68.2%",
      change: "+3.2%",
      icon: TrendingUp,
      color: "#22c55e" // Green
    },
    {
      label: "Active Policies",
      value: "892",
      change: "+8.1%",
      icon: Shield,
      color: "#3b82f6" // Blue
    },
    {
      label: "Total Users",
      value: "342",
      change: "+5.4%",
      icon: Users,
      color: "#FA812F" // Orange
    }
  ]

  // Banks state
  const [banks, setBanks] = React.useState([])
  const [isLoadingBanks, setIsLoadingBanks] = React.useState(true)
  const [banksError, setBanksError] = React.useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  // Fetch all banks function (can be called on retry)
  const fetchBanks = React.useCallback(async () => {
    setIsLoadingBanks(true)
    setBanksError(null)
    try {
      const response = await getAllBanks()
      console.log('All Banks Response:', response)
      
      // Handle different response formats
      const banksList = response.banks || response.data || response || []
      
      if (!Array.isArray(banksList) || banksList.length === 0) {
        setBanks([])
        setIsLoadingBanks(false)
        return
      }
      
      // Fetch policy counts for each bank
      const banksWithPolicies = await Promise.all(
        banksList.map(async (bank) => {
          try {
            const policiesResponse = await getBankPolicies(bank.bank_id || bank.id)
            const policies = policiesResponse.policies || policiesResponse.data || []
            return {
              id: bank.bank_id || bank.id,
              name: bank.bank_name || bank.name || bank.bank_id || bank.id,
              policies: policies.length,
              status: bank.status || "active",
              lastUpdated: bank.last_updated || bank.updated_at || new Date().toISOString().split('T')[0]
            }
          } catch (error) {
            console.error(`Failed to fetch policies for bank ${bank.bank_id || bank.id}:`, error)
            // Still return the bank even if policy fetch fails
            return {
              id: bank.bank_id || bank.id,
              name: bank.bank_name || bank.name || bank.bank_id || bank.id,
              policies: 0,
              status: bank.status || "active",
              lastUpdated: bank.last_updated || bank.updated_at || new Date().toISOString().split('T')[0]
            }
          }
        })
      )
      
      setBanks(banksWithPolicies)
    } catch (error) {
      console.error('Failed to fetch banks:', error)
      setBanksError(error.message || 'Failed to load banks')
    } finally {
      setIsLoadingBanks(false)
    }
  }, [])

  // Fetch all banks on component mount
  React.useEffect(() => {
    fetchBanks()
  }, [fetchBanks])

  // Reset to page 1 when banks list changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [banks.length])

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="flex items-center justify-between p-6 rounded-2xl" style={{
        background: 'linear-gradient(135deg, rgba(250, 129, 47, 0.1) 0%, rgba(250, 177, 47, 0.05) 100%)',
        border: '1px solid rgba(250, 129, 47, 0.2)'
      }}>
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Overview</h2>
          <p className="text-base" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
            Dashboard insights and recent activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="shadow-md hover:shadow-lg transition-all duration-300"
            style={{
              background: 'rgba(255, 250, 240, 0.95)',
              borderColor: 'hsl(var(--color-primary))',
              color: 'hsl(var(--color-primary))'
            }}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card 
              key={index} 
              className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.9) 0%, rgba(254, 243, 226, 0.7) 100%)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div 
                className="absolute top-0 right-0 w-32 h-32 opacity-10"
                style={{
                  background: `radial-gradient(circle at center, ${stat.color} 0%, transparent 70%)`
                }}
              />
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.9) 0%, rgba(254, 243, 226, 0.7) 100%)',
                      border: `2px solid ${stat.color}`,
                      boxShadow: `0 4px 12px ${stat.color}40`
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: stat.color }} />
                  </div>
                  <p className="text-3xl font-bold" style={{ color: '#22c55e' }}>
                    {stat.change}
                  </p>
                </div>
                <p className="text-sm font-semibold mb-2 uppercase tracking-wide" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  {stat.label}
                </p>
                <p className="text-4xl font-bold" style={{
                  color: stat.color
                }}>{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card 
        className="border-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.9) 0%, rgba(254, 243, 226, 0.7) 100%)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Recent Activity</CardTitle>
          <CardDescription className="text-base">Latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div 
              className="flex items-start gap-4 p-5 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-x-1" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.02) 100%)',
                borderLeft: '4px solid hsl(var(--color-success))'
              }}
            >
              <div 
                className="w-10 h-10 rounded-full mt-1 flex items-center justify-center shadow-md" 
                style={{ 
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg mb-1">New application submitted</p>
                <p className="text-sm mb-2" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Loan application APP-2024-125 submitted by Broker
                </p>
                <p className="text-xs font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  2 hours ago
                </p>
              </div>
            </div>
            <div 
              className="flex items-start gap-4 p-5 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-x-1" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(250, 177, 47, 0.05) 0%, rgba(250, 177, 47, 0.02) 100%)',
                borderLeft: '4px solid hsl(var(--color-secondary))'
              }}
            >
              <div 
                className="w-10 h-10 rounded-full mt-1 flex items-center justify-center shadow-md" 
                style={{ 
                  background: 'linear-gradient(135deg, hsl(var(--color-secondary)) 0%, hsl(42, 96%, 50%) 100%)'
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg mb-1">Policy document processed</p>
                <p className="text-sm mb-2" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Insurance policy document successfully extracted and deployed
                </p>
                <p className="text-xs font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  5 hours ago
                </p>
              </div>
            </div>
            <div 
              className="flex items-start gap-4 p-5 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-x-1" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(250, 129, 47, 0.05) 0%, rgba(250, 129, 47, 0.02) 100%)',
                borderLeft: '4px solid hsl(var(--color-primary))'
              }}
            >
              <div 
                className="w-10 h-10 rounded-full mt-1 flex items-center justify-center shadow-md" 
                style={{ 
                  background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)'
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg mb-1">Application approved</p>
                <p className="text-sm mb-2" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Application APP-2024-124 has been approved by Underwriter
                </p>
                <p className="text-xs font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  1 day ago
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleBankNameChange = React.useCallback((e) => {
    setBankName(e.target.value)
  }, [])

  const handleAddBank = async () => {
    if (!selectedFile || !insuranceType || !bankName) return

    // Clear any existing timers
    processingTimersRef.current.forEach(timer => clearTimeout(timer))
    processingTimersRef.current = []

    setProcessingStatus("processing")
    setProcessingOutput(null)
    setVisibleSteps(0)
    setCurrentProcessingStep(0)

    const bankId = bankName.toLowerCase().replace(/\s+/g, '_')

    // IMMEDIATELY START THE API CALL IN THE BACKGROUND
    const apiCallPromise = (async () => {
      try {
        // Upload file to S3
        console.log('Uploading file to S3...')
        const uploadResult = await uploadDocumentToS3(selectedFile, 'policies')
        const s3Url = uploadResult.s3_url
        console.log('File uploaded successfully:', s3Url)

        // Process policy from S3 (this takes ~12 minutes)
        console.log('Processing policy document...')
        const apiResponse = await processPolicyFromS3({
          s3_url: s3Url,
          policy_type: insuranceType,
          bank_id: bankId
        })
        console.log('Policy processed successfully:', apiResponse)

        // Fetch extracted rules from the API
        console.log('Fetching extracted rules...')
        const rulesResponse = await getExtractedRules(bankId, insuranceType)
        console.log('Extracted rules fetched:', rulesResponse)

        // Transform API response to match UI format
        const rules = rulesResponse.rules || rulesResponse.extracted_rules || apiResponse.extracted_rules || apiResponse.rules || []
        const transformedRules = rules.map((rule, index) => ({
          id: rule.id || index + 1,
          name: rule.rule_name || rule.name || `Rule ${index + 1}`,
          description: rule.description || rule.requirement || `${rule.field || ''} ${rule.operator || ''} ${rule.value || ''}`.trim(),
          status: rule.is_active !== false ? "Active" : "Inactive",
          confidence: rule.confidence || rule.confidence_score || 0.9,
          category: rule.category || "General"
        }))

        return {
          success: true,
          data: {
            bankId: bankId,
            bankName: bankName,
            insuranceType: insuranceType,
            fileName: selectedFile.name,
            fileSize: (selectedFile.size / 1024 / 1024).toFixed(2) + " MB",
            processedAt: new Date().toLocaleString(),
            status: "success",
            rulesExtracted: transformedRules.length,
            containerId: apiResponse.container_id || apiResponse.containerId || "container_" + Date.now(),
            s3Url: s3Url,
            jarUrl: apiResponse.jar_url || apiResponse.jarUrl,
            drlUrl: apiResponse.drl_url || apiResponse.drlUrl,
            excelUrl: apiResponse.excel_url || apiResponse.excelUrl,
            container: apiResponse.container || rulesResponse.container || {},
            rules: transformedRules
          }
        }
      } catch (error) {
        console.error('API Error:', error)
        return {
          success: false,
          error: error.message || "Failed to process document"
        }
      }
    })()

    // MOCK UI PROCESSING STEPS WHILE API RUNS IN BACKGROUND
    // Step 1: Text Extraction (2 minutes)
    processingTimersRef.current.push(
      setTimeout(() => {
        setVisibleSteps(1)
        setCurrentProcessingStep(1)
      }, 500)
    )
    
    // Step 1 completes, Step 2 starts (2 minutes later)
    processingTimersRef.current.push(
      setTimeout(() => {
        setCurrentProcessingStep(0)
        setTimeout(() => {
          setVisibleSteps(2)
          setCurrentProcessingStep(2)
        }, 300)
      }, 120500) // 2 minutes + 500ms initial delay
    )
    
    // Step 2 completes, Step 3 starts (2 minutes later)
    processingTimersRef.current.push(
      setTimeout(() => {
        setCurrentProcessingStep(0)
        setTimeout(() => {
          setVisibleSteps(3)
          setCurrentProcessingStep(3)
        }, 300)
      }, 240800) // 4 minutes total
    )
    
    // Step 3 completes, Step 4 starts (2 minutes later)
    processingTimersRef.current.push(
      setTimeout(() => {
        setCurrentProcessingStep(0)
        setTimeout(() => {
          setVisibleSteps(4)
          setCurrentProcessingStep(4)
        }, 300)
      }, 361100) // 6 minutes total
    )
    
    // Step 4 completes, Step 5 starts (2 minutes later)
    processingTimersRef.current.push(
      setTimeout(() => {
        setCurrentProcessingStep(0)
        setTimeout(() => {
          setVisibleSteps(5)
          setCurrentProcessingStep(5)
        }, 300)
      }, 481400) // 8 minutes total
    )
    
    // Step 5: Wait for API to complete and show results
    try {
      const result = await apiCallPromise
      
      // Mark step 5 as complete
      setCurrentProcessingStep(0)
      
      setTimeout(() => {
        if (result.success) {
          setProcessingStatus("completed")
          setProcessingOutput(result.data)
        } else {
          setProcessingStatus("error")
          setProcessingOutput({
            status: "error",
            error: result.error,
            bankName: bankName,
            fileName: selectedFile.name,
            processedAt: new Date().toLocaleString()
          })
        }
      }, 300)
    } catch (error) {
      console.error('Error in handleAddBank:', error)
      setCurrentProcessingStep(0)
      setProcessingStatus("error")
      setProcessingOutput({
        status: "error",
        error: error.message || "An unexpected error occurred",
        bankName: bankName,
        fileName: selectedFile.name,
        processedAt: new Date().toLocaleString()
      })
    }
  }

  const handleCloseModal = () => {
    if (processingStatus === "processing") {
      setShowCloseConfirmation(true)
    } else {
      resetForm()
    }
  }

  const confirmClose = () => {
    setShowCloseConfirmation(false)
    resetForm()
  }

  const resetForm = () => {
    // Clear any processing timers
    processingTimersRef.current.forEach(timer => clearTimeout(timer))
    processingTimersRef.current = []
    
    setBankName("")
    setInsuranceType("")
    setSelectedFile(null)
    setProcessingStatus("idle")
    setProcessingOutput(null)
    setVisibleSteps(0)
    setCurrentProcessingStep(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setIsAddBankModalOpen(false)
  }

  const handleViewBank = (bank) => {
    setSelectedBank(bank)
    setSelectedPolicy("") // Reset to show empty state initially
    setTestResponse(null) // Reset test response
    setActiveSection("bank-details") // Show bank details in main content area
  }

  const handleExecuteTest = async () => {
    setIsExecuting(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const mockResponses = {
        approved: {
          decision: "APPROVED",
          timeTaken: 142,
          totalRules: 12,
          rulesEvaluated: 12,
          rulesPassed: 12,
          rulesFailed: 0,
          rules: [
            { id: 1, name: "Age Verification Rule", passed: true, expected: "18-65", actual: "35", confidence: 0.95, description: "Applicant age within valid range" },
            { id: 2, name: "Credit Score Assessment", passed: true, expected: "≥ 650", actual: "720", confidence: 0.92, description: "Credit score meets minimum requirement" },
            { id: 3, name: "Income Verification", passed: true, expected: "≥ $30,000", actual: "$75,000", confidence: 0.88, description: "Annual income exceeds threshold" },
            { id: 4, name: "Employment Status Check", passed: true, expected: "2+ years", actual: "Employed", confidence: 0.90, description: "Continuous employment verified" },
            { 
              id: 5, 
              name: "Debt-to-Income Ratio", 
              passed: true, 
              expected: "< 43%", 
              actual: "32%", 
              confidence: 0.93, 
              description: "DTI ratio within acceptable range",
              dependencies: [
                { id: "5.1", name: "Monthly Income Calculation", passed: true, expected: "Valid", actual: "$6,250/mo", confidence: 0.95, description: "Monthly income calculated from annual" },
                { id: "5.2", name: "Monthly Debt Calculation", passed: true, expected: "Valid", actual: "$2,000/mo", confidence: 0.92, description: "Total monthly debt obligations calculated" }
              ]
            },
            { id: 6, name: "Previous Claims History", passed: true, expected: "No recent claims", actual: "Clean", confidence: 0.87, description: "No claims in last 5 years" },
            { id: 7, name: "Property Value Assessment", passed: true, expected: "Valid", actual: "Verified", confidence: 0.91, description: "Property value matches loan amount" },
            { id: 8, name: "Geographic Risk Analysis", passed: true, expected: "Low risk", actual: "Low", confidence: 0.85, description: "Location has acceptable risk level" },
            { id: 9, name: "Documentation Completeness", passed: true, expected: "Complete", actual: "All docs", confidence: 0.94, description: "All required documents submitted" },
            { id: 10, name: "Fraud Detection Check", passed: true, expected: "No fraud", actual: "Clean", confidence: 0.89, description: "No fraudulent indicators detected" },
            { 
              id: 11, 
              name: "Collateral Evaluation", 
              passed: true, 
              expected: "Adequate", 
              actual: "Good", 
              confidence: 0.86, 
              description: "Collateral value is sufficient",
              dependencies: [
                { 
                  id: "11.1", 
                  name: "Appraisal Verification", 
                  passed: true, 
                  expected: "Recent", 
                  actual: "30 days old", 
                  confidence: 0.93, 
                  description: "Property appraisal is current",
                  dependencies: [
                    { 
                      id: "11.1.1", 
                      name: "Appraiser License Check", 
                      passed: true, 
                      expected: "Valid", 
                      actual: "Active", 
                      confidence: 0.98, 
                      description: "Appraiser has valid state license",
                      dependencies: [
                        { 
                          id: "11.1.1.1", 
                          name: "State Registry Lookup", 
                          passed: true, 
                          expected: "Found", 
                          actual: "Verified", 
                          confidence: 0.99, 
                          description: "License verified in state registry",
                          dependencies: [
                            { 
                              id: "11.1.1.1.1", 
                              name: "API Connection", 
                              passed: true, 
                              expected: "200 OK", 
                              actual: "200 OK", 
                              confidence: 0.99, 
                              description: "Successfully connected to state registry API" 
                            }
                          ]
                        },
                        { 
                          id: "11.1.1.2", 
                          name: "Expiration Date Check", 
                          passed: true, 
                          expected: "Not expired", 
                          actual: "Valid until 2026", 
                          confidence: 0.99, 
                          description: "License expiration date is in the future" 
                        }
                      ]
                    },
                    { 
                      id: "11.1.2", 
                      name: "Appraisal Date Validation", 
                      passed: true, 
                      expected: "< 90 days", 
                      actual: "30 days", 
                      confidence: 0.97, 
                      description: "Appraisal completed within acceptable timeframe" 
                    }
                  ]
                },
                { id: "11.2", name: "Loan-to-Value Ratio", passed: true, expected: "< 80%", actual: "75%", confidence: 0.89, description: "LTV ratio within acceptable range" },
                { 
                  id: "11.3", 
                  name: "Property Condition Check", 
                  passed: true, 
                  expected: "Good", 
                  actual: "Excellent", 
                  confidence: 0.91, 
                  description: "Property meets condition standards",
                  dependencies: [
                    { 
                      id: "11.3.1", 
                      name: "Inspection Report Review", 
                      passed: true, 
                      expected: "No major issues", 
                      actual: "Minor repairs only", 
                      confidence: 0.94, 
                      description: "Property inspection shows acceptable condition" 
                    }
                  ]
                }
              ]
            },
            { 
              id: 12, 
              name: "Final Approval Gate", 
              passed: true, 
              expected: "Pass", 
              actual: "Pass", 
              confidence: 0.96, 
              description: "All criteria met for approval",
              dependencies: [
                { id: "12.1", name: "All Primary Rules Passed", passed: true, expected: "All pass", actual: "All passed", confidence: 0.98, description: "All primary rules evaluated successfully" },
                { id: "12.2", name: "No Override Flags", passed: true, expected: "No flags", actual: "Clean", confidence: 0.94, description: "No manual override flags present" }
              ]
            }
          ]
        },
        rejectedAge: {
          decision: "REJECTED",
          timeTaken: 89,
          totalRules: 12,
          rulesEvaluated: 5,
          rulesPassed: 4,
          rulesFailed: 1,
          rejectionReason: "Age outside acceptable range",
          rules: [
            { id: 1, name: "Age Verification Rule", passed: false, expected: "18-65", actual: "70", confidence: 0.95, description: "Applicant age exceeds maximum limit" },
            { id: 2, name: "Credit Score Assessment", passed: true, expected: "≥ 650", actual: "720", confidence: 0.92, description: "Credit score meets minimum requirement" },
            { id: 3, name: "Income Verification", passed: true, expected: "≥ $30,000", actual: "$75,000", confidence: 0.88, description: "Annual income exceeds threshold" },
            { id: 4, name: "Employment Status Check", passed: true, expected: "2+ years", actual: "Employed", confidence: 0.90, description: "Continuous employment verified" },
            { 
              id: 5, 
              name: "Debt-to-Income Ratio", 
              passed: true, 
              expected: "< 43%", 
              actual: "32%", 
              confidence: 0.93, 
              description: "DTI ratio within acceptable range",
              dependencies: [
                { id: "5.1", name: "Monthly Income Calculation", passed: true, expected: "Valid", actual: "$6,250/mo", confidence: 0.95, description: "Monthly income calculated from annual" },
                { id: "5.2", name: "Monthly Debt Calculation", passed: true, expected: "Valid", actual: "$2,000/mo", confidence: 0.92, description: "Total monthly debt obligations calculated" }
              ]
            }
          ]
        },
        rejectedCredit: {
          decision: "REJECTED",
          timeTaken: 95,
          totalRules: 12,
          rulesEvaluated: 6,
          rulesPassed: 5,
          rulesFailed: 1,
          rejectionReason: "Credit score below minimum threshold",
          rules: [
            { id: 1, name: "Age Verification Rule", passed: true, expected: "18-65", actual: "35", confidence: 0.95, description: "Applicant age within valid range" },
            { 
              id: 2, 
              name: "Credit Score Assessment", 
              passed: false, 
              expected: "≥ 650", 
              actual: "620", 
              confidence: 0.92, 
              description: "Credit score below minimum requirement",
              dependencies: [
                { id: "2.1", name: "Credit Report Retrieval", passed: true, expected: "Success", actual: "Retrieved", confidence: 0.98, description: "Credit report successfully obtained from bureau" },
                { id: "2.2", name: "Score Calculation", passed: true, expected: "Valid", actual: "620", confidence: 0.96, description: "FICO score calculated from credit report" },
                { id: "2.3", name: "Threshold Comparison", passed: false, expected: "≥ 650", actual: "620", confidence: 0.99, description: "Score compared against minimum threshold - FAILED" }
              ]
            },
            { id: 3, name: "Income Verification", passed: true, expected: "≥ $30,000", actual: "$75,000", confidence: 0.88, description: "Annual income exceeds threshold" },
            { id: 4, name: "Employment Status Check", passed: true, expected: "2+ years", actual: "Employed", confidence: 0.90, description: "Continuous employment verified" },
            { 
              id: 5, 
              name: "Debt-to-Income Ratio", 
              passed: true, 
              expected: "< 43%", 
              actual: "32%", 
              confidence: 0.93, 
              description: "DTI ratio within acceptable range",
              dependencies: [
                { id: "5.1", name: "Monthly Income Calculation", passed: true, expected: "Valid", actual: "$6,250/mo", confidence: 0.95, description: "Monthly income calculated from annual" },
                { id: "5.2", name: "Monthly Debt Calculation", passed: true, expected: "Valid", actual: "$2,000/mo", confidence: 0.92, description: "Total monthly debt obligations calculated" }
              ]
            },
            { id: 6, name: "Previous Claims History", passed: true, expected: "No recent claims", actual: "Clean", confidence: 0.87, description: "No claims in last 5 years" }
          ]
        }
      }

      setTestResponse(mockResponses[testExample])
      setIsExecuting(false)
    }, 1500)
  }

  // Convert rules to nodes and edges for the board
  const convertRulesToNodesAndEdges = (rules) => {
    const nodes = []
    const edges = []
    let yPosition = 0
    const levelSpacing = 400
    const nodeSpacing = 250

    const processRule = (rule, xOffset = 0, parentId = null, level = 0) => {
      const nodeId = `rule-${rule.id}`
      
      // Extract rule name from various possible fields (prioritize rule_name to match extracted rules format)
      const ruleName = rule.rule_name || rule.name || rule.label || `Rule ${rule.id || ''}`
      
      // Add main rule node
      nodes.push({
        id: nodeId,
        type: 'ruleNode',
        position: { x: xOffset, y: yPosition },
        data: {
          label: ruleName,
          name: ruleName,
          rule_name: ruleName,
          description: rule.description || rule.requirement,
          expected: rule.expected,
          actual: rule.actual,
          confidence: rule.confidence,
          passed: rule.passed,
          dependencyCount: rule.dependencies?.length || 0
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left
      })

      // If this node has a parent, create an edge from parent to this node
      if (parentId) {
        edges.push({
          id: `edge-${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: rule.passed ? '#22c55e' : '#ef4444',
            strokeWidth: 2
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: rule.passed ? '#22c55e' : '#ef4444'
          }
        })
      }

      yPosition += nodeSpacing

      // Process dependencies
      if (rule.dependencies && rule.dependencies.length > 0) {
        rule.dependencies.forEach((dep, index) => {
          // Use consistent ID format: rule-{id} for all nodes
          const depNodeId = `rule-${dep.id}`
          const depXOffset = xOffset + levelSpacing
          
          // Recursively process the dependency (this will create the node and edge)
          processRule(
            { ...dep, dependencies: dep.dependencies || [] }, 
            depXOffset, 
            nodeId, // Pass current node as parent
            level + 1
          )
        })
      }
    }

    rules.forEach(rule => {
      processRule(rule, 0, null, 0)
    })

    return { nodes, edges }
  }

  const QuickTestContent = () => {
    // Mock banks list for dropdown
    const allBanks = [
      { id: "chase", name: "Chase Bank" },
      { id: "wells", name: "Wells Fargo" },
      { id: "bofa", name: "Bank of America" },
      { id: "cibc", name: "CIBC" }
    ]

    // Initialize nodes and edges for the board
    const initialNodesAndEdges = testResponse ? convertRulesToNodesAndEdges(testResponse.rules) : { nodes: [], edges: [] }
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesAndEdges.nodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialNodesAndEdges.edges)

    // Update nodes/edges when testResponse changes
    React.useEffect(() => {
      if (testResponse) {
        const { nodes: newNodes, edges: newEdges } = convertRulesToNodesAndEdges(testResponse.rules)
        setNodes(newNodes)
        setEdges(newEdges)
      }
    }, [testResponse, setNodes, setEdges])

    const onConnect = useCallback(
      (params) => setEdges((eds) => addEdge(params, eds)),
      [setEdges]
    )

    const addNewRuleNode = useCallback(() => {
      const newNode = {
        id: `new-rule-${Date.now()}`,
        type: 'ruleNode',
        position: {
          x: Math.random() * 500,
          y: Math.random() * 500
        },
        data: {
          label: 'New Rule',
          description: 'Click to edit rule details',
          passed: undefined
        }
      }
      setNodes((nds) => [...nds, newNode])
    }, [setNodes])

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between p-6 rounded-2xl" style={{
          background: 'linear-gradient(135deg, rgba(250, 129, 47, 0.1) 0%, rgba(250, 177, 47, 0.05) 100%)',
          border: '1px solid rgba(250, 129, 47, 0.2)'
        }}>
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{
              background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Quick Test</h2>
            <p className="text-base" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
              Test policies with sample data and view rule evaluations
            </p>
          </div>
        </div>

        {/* Bank and Policy Selection */}
        <Card className="border shadow-md" style={{
          background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.95) 0%, rgba(254, 243, 226, 0.8) 100%)',
          borderColor: 'rgba(250, 129, 47, 0.2)'
        }}>
          <CardHeader>
            <CardTitle className="text-lg font-bold" style={{
              background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Select Vendor & Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                  Vendor
                </Label>
                <Select value={selectedBankForTest} onValueChange={setSelectedBankForTest}>
                  <SelectTrigger 
                    className="h-11 shadow-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderColor: 'rgba(250, 129, 47, 0.3)',
                      color: 'hsl(var(--color-foreground))'
                    }}
                  >
                    <SelectValue placeholder="Select a bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {allBanks.map(bank => (
                      <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                  Policy
                </Label>
                <Select 
                  value={selectedPolicyForTest} 
                  onValueChange={setSelectedPolicyForTest}
                  disabled={!selectedBankForTest}
                >
                  <SelectTrigger 
                    className="h-11 shadow-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderColor: 'rgba(250, 129, 47, 0.3)',
                      color: 'hsl(var(--color-foreground))'
                    }}
                  >
                    <SelectValue placeholder="Select a policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedBankForTest && bankPoliciesData[selectedBankForTest]?.map(policy => (
                      <SelectItem key={policy.id} value={policy.id}>
                        {policy.name} - {policy.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedBankForTest && selectedPolicyForTest && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                    Test Example
                  </Label>
                  <Select value={testExample} onValueChange={setTestExample}>
                    <SelectTrigger 
                      className="h-11 shadow-sm"
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderColor: 'rgba(250, 129, 47, 0.3)',
                        color: 'hsl(var(--color-foreground))'
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(testExamples).map(([key, example]) => (
                        <SelectItem key={key} value={key}>{example.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleExecuteTest}
                  disabled={isExecuting}
                  className="w-full h-11 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)',
                    border: 'none'
                  }}
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Execute Test
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Response */}
        {testResponse && (
          <div className="space-y-4">
            {/* Decision Header */}
            <Card className="border shadow-md overflow-hidden" style={{
              background: testResponse.decision === "APPROVED" 
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.03) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.03) 100%)',
              borderColor: testResponse.decision === "APPROVED" ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
            }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-3">
                  <div 
                    className="rounded-full p-3"
                    style={{
                      background: testResponse.decision === "APPROVED" 
                        ? 'rgba(34, 197, 94, 0.1)' 
                        : 'rgba(239, 68, 68, 0.1)'
                    }}
                  >
                    {testResponse.decision === "APPROVED" ? (
                      <CheckCircle className="w-8 h-8" style={{ color: '#22c55e' }} />
                    ) : (
                      <XCircle className="w-8 h-8" style={{ color: '#ef4444' }} />
                    )}
                  </div>
                </div>
                <h3 
                  className="text-3xl font-bold text-center mb-2" 
                  style={{
                    color: testResponse.decision === "APPROVED" ? '#22c55e' : '#ef4444',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {testResponse.decision}
                </h3>
                {testResponse.rejectionReason && (
                  <p className="text-sm text-center font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                    {testResponse.rejectionReason}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border shadow-sm" style={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(250, 129, 47, 0.15)'
              }}>
                <CardContent className="p-4 text-center">
                  <div 
                    className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(250, 129, 47, 0.15) 0%, rgba(250, 129, 47, 0.08) 100%)'
                    }}
                  >
                    <Clock className="w-5 h-5" style={{ color: 'hsl(var(--color-primary))' }} />
                  </div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                    Time Taken
                  </p>
                  <p className="text-xl font-bold" style={{ color: 'hsl(var(--color-primary))' }}>
                    {testResponse.timeTaken}
                    <span className="text-sm font-medium ml-1">ms</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="border shadow-sm" style={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(34, 197, 94, 0.15)'
              }}>
                <CardContent className="p-4 text-center">
                  <div 
                    className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%)'
                    }}
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                  </div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                    Rules Passed
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#22c55e' }}>
                    {testResponse.rulesPassed}
                    <span className="text-sm font-medium mx-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>/</span>
                    <span className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                      {testResponse.rulesEvaluated}
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card className="border shadow-sm" style={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(239, 68, 68, 0.15)'
              }}>
                <CardContent className="p-4 text-center">
                  <div 
                    className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)'
                    }}
                  >
                    <XCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                  </div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                    Rules Failed
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#ef4444' }}>
                    {testResponse.rulesFailed}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Rules Board - Miro Style */}
            <Card className="border shadow-md" style={{
              background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.95) 0%, rgba(254, 243, 226, 0.8) 100%)',
              borderColor: 'rgba(250, 129, 47, 0.2)'
            }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold mb-1" style={{
                      background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>Rules Board</CardTitle>
                    <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                      Interactive rule visualization - Drag nodes to rearrange, scroll to zoom
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold"
                      style={{
                        background: 'linear-gradient(135deg, rgba(250, 129, 47, 0.12) 0%, rgba(250, 177, 47, 0.08) 100%)',
                        color: 'hsl(var(--color-primary))',
                        border: '1px solid rgba(250, 129, 47, 0.2)'
                      }}
                    >
                      {testResponse.rulesEvaluated} evaluated
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div style={{ width: '100%', height: '700px', background: '#FEFAF0' }}>
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.3) 0%, rgba(254, 243, 226, 0.3) 100%)'
                    }}
                  >
                    <Background 
                      variant={BackgroundVariant.Dots}
                      gap={16}
                      size={1}
                      color="rgba(250, 129, 47, 0.2)"
                    />
                    <Controls 
                      style={{
                        button: {
                          background: 'white',
                          borderColor: 'rgba(250, 129, 47, 0.3)'
                        }
                      }}
                    />
                    <MiniMap 
                      nodeColor={(node) => {
                        if (node.data.passed === true) return '#22c55e'
                        if (node.data.passed === false) return '#ef4444'
                        return '#FA812F'
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(250, 129, 47, 0.3)'
                      }}
                    />
                  </ReactFlow>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  const BankManagementContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-6 rounded-2xl" style={{
        background: 'linear-gradient(135deg, rgba(250, 129, 47, 0.1) 0%, rgba(250, 177, 47, 0.05) 100%)',
        border: '1px solid rgba(250, 129, 47, 0.2)'
      }}>
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Vendor Management</h2>
          <p className="text-base" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
            Manage vendors and their associated policies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative" style={{ width: '300px' }}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'hsl(var(--color-muted-foreground))' }} />
            <Input
              placeholder="Search vendors..."
              className="pl-10 pr-4 h-11 text-base shadow-md"
              style={{
                background: 'rgba(255, 250, 240, 0.95)',
                borderColor: 'hsl(var(--color-primary))',
                color: 'hsl(var(--color-foreground))'
              }}
            />
          </div>
          <Button 
            onClick={() => setIsAddBankModalOpen(true)}
            className="h-11 shadow-md hover:shadow-lg transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)',
              border: 'none'
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </div>

      <Card 
        className="border-0 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.9) 0%, rgba(254, 243, 226, 0.7) 100%)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Vendors</CardTitle>
              <CardDescription className="text-base">List of all registered vendors and their policy counts</CardDescription>
            </div>
            {banks.length > 0 && !isLoadingBanks && !banksError && (
              <Badge variant="secondary" className="text-sm font-semibold">
                {banks.length} {banks.length === 1 ? 'vendor' : 'vendors'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Pagination calculations */}
          {(() => {
            const totalPages = Math.ceil(banks.length / itemsPerPage)
            const startIndex = (currentPage - 1) * itemsPerPage
            const endIndex = startIndex + itemsPerPage
            const paginatedBanks = banks.slice(startIndex, endIndex)
            
            return (
              <>
                <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor ID</TableHead>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Policies</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingBanks ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'hsl(var(--color-primary))' }} />
                      <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        Loading banks...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : banksError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6" style={{ color: '#ef4444' }} />
                      <p className="text-sm font-medium text-center max-w-md" style={{ color: '#ef4444' }}>
                        {banksError}
                      </p>
                      <p className="text-xs text-center max-w-md mt-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        Make sure the backend API server is running and accessible.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchBanks}
                        className="mt-2"
                        disabled={isLoadingBanks}
                      >
                        {isLoadingBanks ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Retrying...
                          </>
                        ) : (
                          'Retry'
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : banks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building2 className="w-8 h-8" style={{ color: 'hsl(var(--color-muted-foreground))', opacity: 0.5 }} />
                      <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        No banks found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBanks.map((bank, index) => (
                  <TableRow 
                    key={bank.id}
                    className="transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 cursor-pointer"
                    style={{
                      borderBottom: index !== paginatedBanks.length - 1 ? '1px solid hsl(var(--color-border))' : 'none'
                    }}
                    onClick={() => handleViewBank(bank)}
                  >
                    <TableCell className="font-semibold font-mono text-sm" style={{ color: 'hsl(var(--color-primary))' }}>
                      {bank.id}
                    </TableCell>
                    <TableCell className="font-semibold text-base">{bank.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className="font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, rgba(250, 177, 47, 0.2) 0%, rgba(250, 177, 47, 0.1) 100%)',
                          color: 'hsl(var(--color-secondary))',
                          border: '1px solid rgba(250, 177, 47, 0.3)'
                        }}
                      >
                        {bank.policies} policies
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="default" 
                        className="font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          border: 'none'
                        }}
                      >
                        {bank.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                      {bank.lastUpdated}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-orange-50 transition-all duration-200 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewBank(bank)
                          }}
                        >
                          <Eye className="w-4 h-4" style={{ color: 'hsl(var(--color-primary))' }} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Controls */}
          {banks.length > itemsPerPage && !isLoadingBanks && !banksError && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: 'rgba(250, 129, 47, 0.2)' }}>
              <div className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                Showing <span className="font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                  {startIndex + 1}
                </span> to <span className="font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                  {Math.min(endIndex, banks.length)}
                </span> of <span className="font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                  {banks.length}
                </span> banks
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="shadow-sm"
                  style={{
                    borderColor: 'rgba(250, 129, 47, 0.3)'
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[40px] shadow-sm"
                          style={{
                            background: currentPage === page
                              ? 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)'
                              : 'transparent',
                            borderColor: 'rgba(250, 129, 47, 0.3)',
                            color: currentPage === page ? 'white' : 'hsl(var(--color-foreground))'
                          }}
                        >
                          {page}
                        </Button>
                      )
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="shadow-sm"
                  style={{
                    borderColor: 'rgba(250, 129, 47, 0.3)'
                  }}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
                </>
              )
            })()}
        </CardContent>
      </Card>
    </div>
  )

  const BankDetailsContent = () => {
    // State for policies and details
    const [bankPolicies, setBankPolicies] = React.useState([])
    const [isLoadingPolicies, setIsLoadingPolicies] = React.useState(false)
    const [policyDetails, setPolicyDetails] = React.useState(null)
    const [extractedRules, setExtractedRules] = React.useState([])
    const [hierarchicalRules, setHierarchicalRules] = React.useState([])
    const [testExamples, setTestExamples] = React.useState(defaultTestExamples)
    const [testExample, setTestExample] = React.useState("approved")
    const [testResponse, setTestResponse] = React.useState(null)
    const [isExecuting, setIsExecuting] = React.useState(false)
    const [isLoadingDetails, setIsLoadingDetails] = React.useState(false)
    const [detailsError, setDetailsError] = React.useState(null)
    const [displayedRequestBody, setDisplayedRequestBody] = React.useState({})
    
    // State for edit rule modal
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
    const [selectedRuleForEdit, setSelectedRuleForEdit] = React.useState(null)
    const [isUpdatingRule, setIsUpdatingRule] = React.useState(false)
    const [updateSuccess, setUpdateSuccess] = React.useState(false)
    const [updateError, setUpdateError] = React.useState(null)
    
    // State for add rule modal
    const [isAddRuleModalOpen, setIsAddRuleModalOpen] = React.useState(false)
    const [isAddingRule, setIsAddingRule] = React.useState(false)
    const [addRuleError, setAddRuleError] = React.useState(null)
    
    // State for rule details modal
    const [isRuleDetailsModalOpen, setIsRuleDetailsModalOpen] = React.useState(false)
    const [selectedRuleForDetails, setSelectedRuleForDetails] = React.useState(null)

    // Handler to open edit modal
    const handleEditRule = (rule) => {
      setSelectedRuleForEdit(rule)
      setIsEditModalOpen(true)
      setUpdateSuccess(false)
      setUpdateError(null)
    }

    // Handler to close edit modal
    const handleCloseEditModal = () => {
      setIsEditModalOpen(false)
      setSelectedRuleForEdit(null)
    }

    // Handler to open add rule modal
    const handleOpenAddRuleModal = () => {
      setIsAddRuleModalOpen(true)
      setAddRuleError(null)
    }

    // Handler to close add rule modal
    const handleCloseAddRuleModal = () => {
      setIsAddRuleModalOpen(false)
      setAddRuleError(null)
    }

    // Helper to add a rule to the hierarchical structure
    const addRuleToHierarchy = (rules, newRule, parentId) => {
      if (!parentId) {
        // Add as top-level rule
        return [...rules, newRule]
      }
      
      // Find parent and add as dependency
      return rules.map(rule => {
        if (rule.id === parentId) {
          return {
            ...rule,
            dependencies: [...(rule.dependencies || []), newRule]
          }
        }
        
        // Recursively search in dependencies
        if (rule.dependencies && rule.dependencies.length > 0) {
          return {
            ...rule,
            dependencies: addRuleToHierarchy(rule.dependencies, newRule, parentId)
          }
        }
        
        return rule
      })
    }

    // Handler to save new rule
    const handleSaveNewRule = async (formData) => {
      if (!selectedBank || !selectedPolicy) {
        setAddRuleError('Missing bank or policy information')
        return
      }

      setIsAddingRule(true)
      setAddRuleError(null)
      
      try {
        // Prepare the new rule object
        const newRule = {
          id: formData.rule_id,
          name: formData.name,
          expected: formData.expected,
          description: formData.description,
          requirement: formData.description,
          confidence: 1.0, // New rules start with full confidence
          dependencies: []
        }

        // Call the API to add the rule
        const response = await addHierarchicalRule({
          bank_id: selectedBank.id,
          policy_type: selectedPolicy,
          rule: {
            rule_id: formData.rule_id,
            name: formData.name,
            expected: formData.expected,
            description: formData.description
          },
          parent_rule_id: formData.parent_rule_id || null
        })
        
        console.log('Add rule response:', response)
        
        // Update the local hierarchical rules list
        setHierarchicalRules(prevRules => 
          addRuleToHierarchy(prevRules, newRule, formData.parent_rule_id)
        )
        
        // Close modal first
        handleCloseAddRuleModal()
        
        // Then show success toast after modal closes
        setTimeout(() => {
          setUpdateSuccess(true)
          // Hide toast after 3 seconds
          setTimeout(() => {
            setUpdateSuccess(false)
          }, 3000)
        }, 150)
      } catch (error) {
        console.error('Failed to add rule:', error)
        setAddRuleError(error.message || 'Failed to add rule')
      } finally {
        setIsAddingRule(false)
      }
    }

    // Handler to open rule details modal
    const handleViewRuleDetails = (rule) => {
      // Find matching extraction query from policyDetails
      const extractionQueries = policyDetails?.extraction_queries || []
      
      // Try to find a matching extraction query by comparing rule content
      const matchingQuery = extractionQueries.find(q => 
        q.response_text && rule.description && 
        (q.response_text.toLowerCase().includes(rule.description.substring(0, 30).toLowerCase()) ||
         rule.description.toLowerCase().includes(q.response_text.substring(0, 30).toLowerCase()) ||
         (rule.name && q.query_text && q.query_text.toLowerCase().includes(rule.name.toLowerCase())))
      ) || extractionQueries[0] // Fallback to first query if no match found
      
      const ruleWithDetails = {
        ...rule,
        // Real extraction metadata from API
        extractionMetadata: {
          sourceDocument: matchingQuery?.source_document || policyDetails?.container?.policy_presigned_url || policyDetails?.container?.s3_policy_url || "policy_document.pdf",
          pageNumber: matchingQuery?.page_number || rule.page_number || null,
          extractionMethod: matchingQuery?.extraction_method || "textract",
          extractedAt: matchingQuery?.created_at || policyDetails?.container?.deployed_at || new Date().toISOString(),
          clauseReference: matchingQuery?.clause_reference || rule.clause_reference || (rule.id ? `Section ${rule.id}` : null),
          documentHash: matchingQuery?.document_hash || policyDetails?.container?.document_hash || null,
          confidence: matchingQuery?.confidence_score || (rule.confidence ? rule.confidence * 100 : null),
          queryText: matchingQuery?.query_text || null,
          responseText: matchingQuery?.response_text || rule.description,
          isActive: matchingQuery?.is_active !== undefined ? matchingQuery.is_active : true,
          updatedAt: matchingQuery?.updated_at || null
        },
        // Related queries from extraction_queries (find similar queries)
        relatedQueries: extractionQueries
          .filter(q => q.query_text && q.response_text && q.id !== matchingQuery?.id)
          .slice(0, 5)
          .map(q => ({
            query: q.query_text,
            confidence: q.confidence_score || 0,
            response: q.response_text,
            createdAt: q.created_at
          })),
        // Container details
        containerDetails: policyDetails?.container ? {
          containerId: policyDetails.container.container_id,
          bankId: policyDetails.container.bank_id,
          policyType: policyDetails.container.policy_type_id,
          status: policyDetails.container.status,
          healthStatus: policyDetails.container.health_status,
          deployedAt: policyDetails.container.deployed_at,
          policyUrl: policyDetails.container.policy_presigned_url
        } : null
      }
      setSelectedRuleForDetails(ruleWithDetails)
      setIsRuleDetailsModalOpen(true)
    }

    // Handler to close rule details modal
    const handleCloseRuleDetailsModal = () => {
      setIsRuleDetailsModalOpen(false)
      setSelectedRuleForDetails(null)
      setUpdateError(null)
    }

    // Recursive helper to update a rule at any depth in the hierarchical structure
    const updateRuleRecursively = (rules, ruleId, updateData) => {
      return rules.map(rule => {
        // Check if this is the rule to update
        if (rule.id === ruleId) {
          return {
            ...rule,
            name: updateData.name || rule.name,
            description: updateData.description || rule.description,
            expected: updateData.expected || rule.expected,
            requirement: updateData.description || rule.requirement
          }
        }
        
        // If this rule has dependencies, recursively update them
        if (rule.dependencies && rule.dependencies.length > 0) {
          return {
            ...rule,
            dependencies: updateRuleRecursively(rule.dependencies, ruleId, updateData)
          }
        }
        
        return rule
      })
    }

    // Handler to save rule updates
    const handleSaveRuleUpdate = async (updateData) => {
      if (!selectedBank || !selectedPolicy) {
        setUpdateError('Missing bank or policy information')
        return
      }

      setIsUpdatingRule(true)
      setUpdateError(null)
      
      try {
        // Call the API to update hierarchical rules
        const response = await updateHierarchicalRules({
          bank_id: selectedBank.id,
          policy_type: selectedPolicy,
          updates: [updateData]
        })
        
        console.log('Rule update response:', response)
        
        // Update the local hierarchical rules list (recursively handles nested rules)
        setHierarchicalRules(prevRules => 
          updateRuleRecursively(prevRules, updateData.rule_id, updateData)
        )
        
        // Update the extracted rules list as well
        setExtractedRules(prevRules => 
          prevRules.map(rule => 
            rule.id === updateData.rule_id 
              ? { 
                  ...rule, 
                  name: updateData.name || rule.name,
                  description: updateData.description || rule.description,
                  confidence: updateData.confidence,
                  expected: updateData.expected,
                  actual: updateData.actual,
                  passed: updateData.passed
                }
              : rule
          )
        )
        
        // Close modal first
        handleCloseEditModal()
        
        // Then show success toast after modal closes
        setTimeout(() => {
          setUpdateSuccess(true)
          // Hide toast after 3 seconds
          setTimeout(() => {
            setUpdateSuccess(false)
          }, 3000)
        }, 150)
      } catch (error) {
        console.error('Failed to update rule:', error)
        setUpdateError(error.message || 'Failed to update rule')
        // Hide error after 5 seconds
        setTimeout(() => {
          setUpdateError(null)
        }, 5000)
      } finally {
        setIsUpdatingRule(false)
      }
    }

    // Fetch policies when bank is selected
    React.useEffect(() => {
      if (!selectedBank) return

      const fetchPolicies = async () => {
        setIsLoadingPolicies(true)
        setDetailsError(null)
        try {
          const response = await getBankPolicies(selectedBank.id)
          console.log('Bank Policies Response:', response)
          
          // Handle different response formats
          const policies = response.policies || response.data || []
          
          // Transform to match expected format
          const transformedPolicies = policies.map((policy) => ({
            id: policy.policy_type_id || policy.policy_type || policy.id,
            name: policy.policy_name || policy.policy_type || policy.name,
            type: policy.policy_type || policy.type,
            rulesCount: policy.rules_count || policy.extracted_rules_count || null
          }))
          
          setBankPolicies(transformedPolicies)
          
          // Don't auto-select - user should choose explicitly
        } catch (error) {
          console.error('Failed to fetch policies:', error)
          setDetailsError(error.message || 'Failed to load policies')
          setBankPolicies([])
        } finally {
          setIsLoadingPolicies(false)
        }
      }

      fetchPolicies()
    }, [selectedBank])

    // Fetch policy details and extracted rules when policy is selected
    React.useEffect(() => {
      if (!selectedBank || !selectedPolicy) {
        setPolicyDetails(null)
        setExtractedRules([])
        setHierarchicalRules([])
        setTestExamples(defaultTestExamples)
        return
      }

      const fetchDetails = async () => {
        setIsLoadingDetails(true)
        setDetailsError(null)
        try {
          // Fetch policy details
          const detailsResponse = await getPolicyDetails(selectedBank.id, selectedPolicy)
          console.log('Policy Details Response:', detailsResponse)
          setPolicyDetails(detailsResponse)

          // Fetch extracted rules
          const rulesResponse = await getExtractedRules(selectedBank.id, selectedPolicy)
          console.log('=== LEFT SECTION: EXTRACTED RULES ===')
          console.log('API Endpoint: GET /api/v1/extracted-rules')
          console.log('Full API Response:', rulesResponse)
          console.log('Raw Rules Array:', rulesResponse.rules || rulesResponse.data || [])
          
          // Transform rules to match expected format
          const rules = rulesResponse.rules || rulesResponse.data || []
          const transformedRules = rules.map((rule, index) => ({
            id: rule.id || index + 1,
            name: rule.rule_name || rule.field || `Rule ${index + 1}`,
            description: rule.description || rule.requirement || `${rule.field} ${rule.operator} ${rule.value}`,
            status: rule.is_active !== false ? "Active" : "Inactive",
            confidence: rule.confidence || rule.confidence_score || 0.9,
            category: rule.category || "General"
          }))
          
          // Extract hierarchical rules from policy details response (preserve full structure with dependencies)
          const hierarchicalRulesData = detailsResponse.hierarchical_rules || detailsResponse.data?.hierarchical_rules || []
          console.log('Hierarchical Rules from Policy Details:', hierarchicalRulesData)
          
          // Extract and construct test cases from policy details
          const testCasesData = detailsResponse.test_cases || detailsResponse.data?.test_cases || []
          console.log('Test Cases from Policy Details:', testCasesData)
          
          // Build dynamic test examples from test_cases
          if (testCasesData && testCasesData.length > 0) {
            const dynamicTestExamples = {}
            testCasesData.forEach((testCase, index) => {
              const key = testCase.test_case_id || testCase.id || `test_${index}`
              
              // Extract data from test case - API uses applicant_data and policy_data
              const applicantData = testCase.applicant_data || testCase.input_data?.applicant || testCase.applicant || {}
              const policyData = testCase.policy_data || testCase.input_data?.policy || testCase.policy || {}
              
              // Map test case data to the expected request structure
              const requestBody = {
                bank_id: testCase.bank_id || selectedBank?.id || "rbc",
                policy_type: testCase.policy_type || selectedPolicy || "insurance",
                applicant: {
                  age: applicantData.age || 35,
                  annualIncome: applicantData.annualIncome || applicantData.annual_income || 75000,
                  creditScore: applicantData.creditScore || applicantData.credit_score || 720,
                  healthConditions: applicantData.healthConditions || applicantData.health_conditions || applicantData.healthStatus || "good",
                  smoker: applicantData.smoker !== undefined ? applicantData.smoker : false,
                  criminalRecord: applicantData.criminalRecord || applicantData.criminal_record || "none"
                },
                policy: {
                  coverageAmount: policyData.coverageAmount || policyData.coverage_amount || 500000,
                  termYears: policyData.termYears || policyData.term_years || policyData.term || 20,
                  type: policyData.type || policyData.policy_type || "term_life"
                }
              }
              
              dynamicTestExamples[key] = {
                name: testCase.test_case_name || testCase.name || testCase.description || `Test Case ${index + 1}`,
                request: requestBody
              }
            })
            console.log('Dynamic Test Examples:', dynamicTestExamples)
            console.log('Test Examples Keys:', Object.keys(dynamicTestExamples))
            setTestExamples(dynamicTestExamples)
            
            // Set first test example as default selection if current selection doesn't exist
            const firstKey = Object.keys(dynamicTestExamples)[0]
            console.log('Setting first test example key:', firstKey)
            if (firstKey && dynamicTestExamples[firstKey]) {
              setTestExample(firstKey)
            }
          } else {
            // Fallback to default test examples if no test cases from API
            setTestExamples(defaultTestExamples)
            setTestExample('approved')
          }
          
          console.log('Transformed Rules for Display:', transformedRules)
          console.log('Hierarchical Rules with Dependencies:', hierarchicalRulesData)
          console.log('Total Extracted Rules Count:', transformedRules.length)
          console.log('Total Hierarchical Rules Count:', hierarchicalRulesData.length)
          console.log('====================================')
          
          setExtractedRules(transformedRules)
          setHierarchicalRules(hierarchicalRulesData)
        } catch (error) {
          console.error('Failed to fetch policy details:', error)
          setDetailsError(error.message || 'Failed to load policy details')
          setPolicyDetails(null)
          setExtractedRules([])
          setHierarchicalRules([])
          setTestExamples(defaultTestExamples)
        } finally {
          setIsLoadingDetails(false)
        }
      }

      fetchDetails()
    }, [selectedBank, selectedPolicy])

    // Update displayed request body when test example or related data changes
    React.useEffect(() => {
      console.log('Updating displayed request body...')
      console.log('Current testExample:', testExample)
      console.log('Available testExamples:', Object.keys(testExamples))
      
      const exampleRequest = testExamples[testExample]?.request
      console.log('Example request found:', exampleRequest)
      
      if (exampleRequest) {
        const requestBody = {
          ...exampleRequest,
          bank_id: selectedBank?.id || exampleRequest.bank_id,
          policy_type: selectedPolicy || exampleRequest.policy_type
        }
        console.log('Setting displayed request body:', requestBody)
        setDisplayedRequestBody(requestBody)
      } else {
        console.log('No example request found, clearing displayed request body')
        setDisplayedRequestBody({})
      }
    }, [testExample, testExamples, selectedBank, selectedPolicy])

    if (!selectedBank) {
      return (
        <div className="text-center py-12">
          <p className="text-lg font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
            No bank selected
          </p>
        </div>
      )
    }

    // Create dynamic request body with selected bank and policy
    const getDynamicRequestBody = () => {
      const exampleRequest = testExamples[testExample]?.request
      if (!exampleRequest) {
        return {}
      }
      
      // Always use the currently selected bank and policy
      return {
        ...exampleRequest,
        bank_id: selectedBank?.id || exampleRequest.bank_id,
        policy_type: selectedPolicy || exampleRequest.policy_type
      }
    }

    // Handle test execution using the evaluatePolicy API
    const handleExecuteTest = async () => {
      if (!selectedBank || !selectedPolicy) {
        setDetailsError('Please select a bank and policy first')
        return
      }

      setIsExecuting(true)
      setDetailsError(null)
      
      try {
        const requestBody = getDynamicRequestBody()
        console.log('=== RIGHT SECTION: RULES BOARD (EXECUTE TEST) ===')
        console.log('API Endpoint: POST /api/v1/evaluate-policy')
        console.log('Request Body:', requestBody)
        
        const response = await evaluatePolicy(requestBody)
        console.log('Full API Response:', response)
        console.log('Hierarchical Rules from Response:', response.hierarchical_rules || [])
        console.log('Rule Evaluation Summary:', response.rule_evaluation_summary || {})
        console.log('Decision:', response.decision)
        
        // Transform API response to match UI format
        // Use hierarchical_rules and rule_evaluation_summary from the new API response
        const summary = response.rule_evaluation_summary || {}
        const transformedResponse = {
          decision: response.decision?.approved ? "APPROVED" : "REJECTED",
          timeTaken: response.execution_time_ms || 0,
          totalRules: summary.total_rules || 0,
          rulesEvaluated: summary.total_rules || 0,
          rulesPassed: summary.passed || 0,
          rulesFailed: summary.failed || 0,
          rejectionReason: response.decision?.approved === false 
            ? (response.decision?.reasons?.[0] || 'Application rejected')
            : null,
          rules: response.hierarchical_rules || []
        }
        
        console.log('Transformed Response for Rules Board:', transformedResponse)
        console.log('Rules Count for Visualization:', transformedResponse.rules.length)
        console.log('================================================')
        
        setTestResponse(transformedResponse)
      } catch (error) {
        console.error('Failed to execute test:', error)
        setDetailsError(error.message || 'Failed to execute test. Please try again.')
        setTestResponse(null)
      } finally {
        setIsExecuting(false)
      }
    }

    // Initialize nodes and edges for the Miro board
    const initialNodesAndEdges = testResponse ? convertRulesToNodesAndEdges(testResponse.rules) : { nodes: [], edges: [] }
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesAndEdges.nodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialNodesAndEdges.edges)

    // Update nodes/edges when testResponse changes
    React.useEffect(() => {
      if (testResponse) {
        const { nodes: newNodes, edges: newEdges } = convertRulesToNodesAndEdges(testResponse.rules)
        setNodes(newNodes)
        setEdges(newEdges)
      }
    }, [testResponse, setNodes, setEdges])

    const onConnect = useCallback(
      (params) => setEdges((eds) => addEdge(params, eds)),
      [setEdges]
    )

    const addNewRuleNode = useCallback(() => {
      const newNode = {
        id: `new-rule-${Date.now()}`,
        type: 'ruleNode',
        position: {
          x: Math.random() * 500,
          y: Math.random() * 500
        },
        data: {
          label: 'New Rule',
          description: 'Click to edit rule details',
          passed: undefined
        }
      }
      setNodes((nds) => [...nds, newNode])
    }, [setNodes])

    return (
      <>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between p-6 rounded-2xl" style={{
          background: 'linear-gradient(135deg, rgba(250, 129, 47, 0.1) 0%, rgba(250, 177, 47, 0.05) 100%)',
          border: '1px solid rgba(250, 129, 47, 0.2)'
        }}>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setActiveSection("bank-management")}
              className="hover:bg-orange-50 cursor-pointer"
            >
              <ArrowRight className="w-5 h-5 mr-2 transform rotate-180" style={{ color: 'hsl(var(--color-primary))' }} />
              Back to Vendors
            </Button>
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{
                background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{selectedBank.name} - Policy Details & Testing</h2>
              <p className="text-base" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                View policy rules, test with sample data, and visualize rule flow
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
          {/* Left Column - Policy Details */}
          <div className="space-y-6">
            {/* Policy Selector */}
            <Card className="border shadow-md" style={{
              background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.95) 0%, rgba(254, 243, 226, 0.8) 100%)',
              borderColor: 'rgba(250, 129, 47, 0.2)'
            }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold" style={{
                  background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Select Policy</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPolicies ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" style={{ color: 'hsl(var(--color-primary))' }} />
                    <span className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Loading policies...</span>
                  </div>
                ) : detailsError ? (
                  <div className="flex flex-col items-center justify-center py-4 gap-2">
                    <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                    <span className="text-sm text-center" style={{ color: '#ef4444' }}>{detailsError}</span>
                  </div>
                ) : bankPolicies.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>No policies available</p>
                  </div>
                ) : (
                  <Select value={selectedPolicy} onValueChange={setSelectedPolicy} disabled={isLoadingPolicies}>
                    <SelectTrigger 
                      className="h-11 text-base"
                      style={{
                        background: 'rgba(255, 250, 240, 0.95)',
                        borderColor: 'rgba(250, 129, 47, 0.3)',
                        color: 'hsl(var(--color-foreground))'
                      }}
                    >
                      <SelectValue placeholder="Select a policy" />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        background: 'rgba(255, 250, 240, 0.98)',
                        borderColor: 'rgba(250, 129, 47, 0.2)'
                      }}
                    >
                      {bankPolicies.map((policy) => (
                        <SelectItem key={policy.id} value={policy.id}>
                          {policy.name} {policy.rulesCount !== null ? `(${policy.rulesCount} rules)` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>

            {!selectedPolicy ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-16 h-16 mb-4" style={{ color: 'hsl(var(--color-muted-foreground))', opacity: 0.5 }} />
                <p className="text-lg font-semibold mb-2" style={{ color: 'hsl(var(--color-foreground))' }}>
                  No Policy Selected
                </p>
                <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Select a policy from the dropdown above to view details
                </p>
              </div>
            ) : isLoadingDetails ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: 'hsl(var(--color-primary))' }} />
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Loading policy details...
                </p>
              </div>
            ) : detailsError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-8 h-8 mb-4" style={{ color: '#ef4444' }} />
                <p className="text-sm font-medium mb-2" style={{ color: '#ef4444' }}>
                  {detailsError}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Trigger re-fetch by updating selectedPolicy
                    const current = selectedPolicy
                    setSelectedPolicy('')
                    setTimeout(() => setSelectedPolicy(current), 100)
                  }}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                {/* Policy Details Card */}
                <Card className="border shadow-md" style={{
                  background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.95) 0%, rgba(254, 243, 226, 0.8) 100%)',
                  borderColor: 'rgba(250, 129, 47, 0.2)'
                }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold" style={{
                      background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>Policy Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Vendor ID</p>
                        <p className="text-sm font-mono font-semibold" style={{ color: 'hsl(var(--color-primary))' }}>
                          {selectedBank.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Policy Type</p>
                        <p className="text-sm font-semibold capitalize">
                          {bankPolicies.find(p => p.id === selectedPolicy)?.type || selectedPolicy}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Rules Count</p>
                        <Badge className="font-semibold" style={{
                          background: 'linear-gradient(135deg, hsl(var(--color-secondary)) 0%, hsl(42, 96%, 50%) 100%)',
                          border: 'none'
                        }}>
                          {extractedRules.length || bankPolicies.find(p => p.id === selectedPolicy)?.rulesCount || 0} rules
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Status</p>
                        <Badge 
                          className="font-semibold"
                          style={{
                            background: policyDetails?.container?.status === 'running' 
                              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                              : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                            border: 'none'
                          }}
                        >
                          {policyDetails?.container?.status === 'running' ? 'Active' : policyDetails?.container?.status || 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Extracted Rules - Hidden */}
                {false && (
                <Card className="border shadow-md" style={{
                  background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.95) 0%, rgba(254, 243, 226, 0.8) 100%)',
                  borderColor: 'rgba(250, 129, 47, 0.2)'
                }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold" style={{
                          background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>Extracted Rules</CardTitle>
                        {extractedRules.length > 0 && (() => {
                          // Get the most common category
                          const categoryCounts = {}
                          extractedRules.forEach(rule => {
                            const cat = rule.category || 'General'
                            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
                          })
                          const categories = Object.keys(categoryCounts)
                          if (categories.length === 0) return null
                          
                          const mostCommonCategory = categories.reduce((a, b) => 
                            categoryCounts[a] > categoryCounts[b] ? a : b
                          )
                          
                          return mostCommonCategory ? (
                            <Badge 
                              variant="outline" 
                              className="text-xs font-semibold"
                              style={{
                                background: 'rgba(250, 129, 47, 0.1)',
                                borderColor: 'rgba(250, 129, 47, 0.3)',
                                color: 'hsl(var(--color-primary))'
                              }}
                            >
                              {mostCommonCategory}
                            </Badge>
                          ) : null
                        })()}
                      </div>
                      <Badge className="font-semibold" style={{
                        background: 'linear-gradient(135deg, hsl(var(--color-secondary)) 0%, hsl(42, 96%, 50%) 100%)',
                        border: 'none'
                      }}>
                        {extractedRules.length || 0} rules
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDetails ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" style={{ color: 'hsl(var(--color-primary))' }} />
                        <span className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Loading rules...</span>
                      </div>
                    ) : detailsError ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-2">
                        <AlertCircle className="w-6 h-6" style={{ color: '#ef4444' }} />
                        <span className="text-sm text-center" style={{ color: '#ef4444' }}>{detailsError}</span>
                      </div>
                    ) : extractedRules.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FileText className="w-12 h-12 mb-2" style={{ color: 'hsl(var(--color-muted-foreground))', opacity: 0.5 }} />
                        <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          No rules found for this policy
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {extractedRules.map((rule, index) => (
                        <div
                          key={rule.id}
                          className="p-3 rounded-lg border transition-all duration-300 hover:shadow-md"
                          style={{
                            background: 'rgba(255, 255, 255, 0.6)',
                            borderColor: 'rgba(250, 129, 47, 0.15)'
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold mb-1" style={{ color: 'hsl(var(--color-foreground))' }}>
                                {index + 1}. {rule.name}
                              </p>
                              {rule.category && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs font-medium"
                                  style={{
                                    background: 'rgba(250, 129, 47, 0.08)',
                                    borderColor: 'rgba(250, 129, 47, 0.25)',
                                    color: 'hsl(var(--color-primary))'
                                  }}
                                >
                                  {rule.category}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge 
                                variant="outline" 
                                className="text-xs font-semibold"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                                  borderColor: 'rgba(34, 197, 94, 0.3)',
                                  color: 'hsl(var(--color-success))'
                                }}
                              >
                                {rule.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-orange-100 transition-colors"
                                onClick={() => handleEditRule(rule)}
                                title="Edit rule"
                              >
                                <Edit className="w-3.5 h-3.5" style={{ color: 'hsl(var(--color-primary))' }} />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs mb-2" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                            {rule.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                              Confidence:
                            </span>
                            <div className="flex-1 max-w-[120px] h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(250, 129, 47, 0.2)' }}>
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${rule.confidence * 100}%`,
                                  background: 'linear-gradient(90deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)'
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold" style={{ color: 'hsl(var(--color-primary))' }}>
                              {(rule.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                )}

                {/* Hierarchical Rules */}
                {policyDetails && (
                  <>
                  {/* Add Rule Button - Above the card */}
                  <div className="flex justify-end mb-2">
                    <Button
                      size="sm"
                      onClick={handleOpenAddRuleModal}
                      className="h-8 px-3 text-xs font-semibold gap-1.5"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                        border: 'none'
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Rule
                    </Button>
                  </div>
                  
                  <Card className="border shadow-md" style={{
                    background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.95) 0%, rgba(254, 243, 226, 0.8) 100%)',
                    borderColor: 'rgba(250, 129, 47, 0.2)'
                  }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-bold" style={{
                            background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}>Hierarchical Rules</CardTitle>
                          <Badge 
                            variant="outline" 
                            className="text-xs font-semibold"
                            style={{
                              background: 'rgba(147, 51, 234, 0.1)',
                              borderColor: 'rgba(147, 51, 234, 0.3)',
                              color: '#9333ea'
                            }}
                          >
                            Multi-Level
                          </Badge>
                        </div>
                        <Badge className="font-semibold" style={{
                          background: 'linear-gradient(135deg, hsl(var(--color-secondary)) 0%, hsl(42, 96%, 50%) 100%)',
                          border: 'none'
                        }}>
                          {hierarchicalRules.length} rules
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {hierarchicalRules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                            style={{ background: 'rgba(250, 129, 47, 0.1)' }}
                          >
                            <FileText className="w-8 h-8" style={{ color: 'hsl(var(--color-primary))' }} />
                          </div>
                          <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--color-foreground))' }}>
                            No Rules Yet
                          </p>
                          <p className="text-xs mb-4" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                            Add your first rule to start building the policy logic
                          </p>
                          <Button
                            size="sm"
                            onClick={handleOpenAddRuleModal}
                            className="font-semibold gap-1.5"
                            style={{
                              background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                              border: 'none'
                            }}
                          >
                            <Plus className="w-4 h-4" />
                            Add First Rule
                          </Button>
                        </div>
                      ) : (
                      <div className="max-h-[500px] overflow-y-auto pr-2">
                        <Accordion type="multiple" className="w-full space-y-2">
                          {hierarchicalRules.map((rule, index) => (
                            <AccordionItem 
                              key={rule.id || index} 
                              value={`rule-${rule.id || index}`}
                              className="border rounded-lg transition-all duration-300 hover:shadow-md"
                              style={{
                                background: 'rgba(255, 255, 255, 0.6)',
                                borderColor: 'rgba(250, 129, 47, 0.15)'
                              }}
                            >
                              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-2 gap-4">
                                  {/* Left: Rule Number & Name */}
                                  <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                    <span className="text-sm font-bold text-left" style={{ color: 'hsl(var(--color-foreground))' }}>
                                      {index + 1}. {rule.name}
                                    </span>
                                  </div>
                                  
                                  {/* Right: Dependencies Badge, Icons */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    {rule.dependencies && rule.dependencies.length > 0 && (
                                      <div 
                                        className="flex items-center gap-1 px-2 py-1 rounded-md"
                                        style={{
                                          background: 'rgba(147, 51, 234, 0.08)',
                                          border: '1px solid rgba(147, 51, 234, 0.2)'
                                        }}
                                      >
                                        <GitBranch className="w-3.5 h-3.5" style={{ color: '#9333ea' }} />
                                        <span className="text-xs font-semibold" style={{ color: '#9333ea' }}>
                                          {rule.dependencies.length}
                                        </span>
                                      </div>
                                    )}
                                    <div
                                      className="h-7 w-7 p-0 hover:bg-blue-50 transition-colors rounded-md flex items-center justify-center cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleViewRuleDetails(rule)
                                      }}
                                      title="View rule details"
                                    >
                                      <Eye className="w-4 h-4" style={{ color: '#3b82f6' }} />
                                    </div>
                                    <div
                                      className="h-7 w-7 p-0 hover:bg-orange-50 transition-colors rounded-md flex items-center justify-center cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleEditRule(rule)
                                      }}
                                      title="Edit rule"
                                    >
                                      <Edit className="w-4 h-4" style={{ color: 'hsl(var(--color-primary))' }} />
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4 pt-3">
                                <div className="space-y-4 text-left">
                                  {/* Description */}
                                  <div className="text-left">
                                    <p className="text-xs font-semibold mb-1.5 text-left" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                                      Description
                                    </p>
                                    <p className="text-sm leading-relaxed text-left" style={{ color: 'hsl(var(--color-foreground))' }}>
                                      {rule.description}
                                    </p>
                                  </div>

                                  {/* Expected Condition */}
                                  {rule.expected && (
                                    <div className="p-3 rounded-lg text-left" style={{
                                      background: 'rgba(250, 129, 47, 0.05)',
                                      border: '1px solid rgba(250, 129, 47, 0.15)'
                                    }}>
                                      <p className="text-xs font-semibold mb-2 text-left" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                                        Expected Condition
                                      </p>
                                      <p className="text-sm font-mono leading-relaxed text-left" style={{ color: 'hsl(var(--color-foreground))' }}>
                                        {rule.expected}
                                      </p>
                                    </div>
                                  )}

                                  {/* Dependencies */}
                                  {rule.dependencies && rule.dependencies.length > 0 && (
                                    <div className="text-left">
                                      <div className="flex items-center gap-2 mb-3">
                                        <GitBranch className="w-4 h-4" style={{ color: '#9333ea' }} />
                                        <p className="text-xs font-bold text-left" style={{ color: 'hsl(var(--color-foreground))' }}>
                                          Sub-Rules ({rule.dependencies.length})
                                        </p>
                                      </div>
                                      <div className="space-y-2 pl-1 text-left">
                                        {rule.dependencies.map((dep, depIndex) => (
                                          <div key={dep.id || depIndex}>
                                            <RuleDependency 
                                              dep={dep} 
                                              depth={1} 
                                              isLast={depIndex === rule.dependencies.length - 1}
                                              onEdit={handleEditRule}
                                              onView={handleViewRuleDetails}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                      )}
                    </CardContent>
                  </Card>
                  </>
                )}

                {/* Download Files */}
                <Card className="border shadow-md" style={{
                  background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.95) 0%, rgba(254, 243, 226, 0.8) 100%)',
                  borderColor: 'rgba(250, 129, 47, 0.2)'
                }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold" style={{
                      background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>Download Generated Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant="outline"
                        className="h-auto flex flex-col items-center gap-1.5 py-2.5 transition-all duration-300 hover:shadow-md"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          borderColor: 'rgba(250, 129, 47, 0.3)'
                        }}
                        onClick={() => policyDetails?.container?.policy_presigned_url && window.open(policyDetails.container.policy_presigned_url, '_blank')}
                        disabled={!policyDetails?.container?.policy_presigned_url}
                      >
                        <Download className="w-4 h-4" style={{ color: 'hsl(var(--color-primary))' }} />
                        <span className="text-xs font-semibold">PDF File</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex flex-col items-center gap-1.5 py-2.5 transition-all duration-300 hover:shadow-md"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          borderColor: 'rgba(250, 129, 47, 0.3)'
                        }}
                        onClick={() => policyDetails?.container?.excel_presigned_url && window.open(policyDetails.container.excel_presigned_url, '_blank')}
                        disabled={!policyDetails?.container?.excel_presigned_url}
                      >
                        <Download className="w-4 h-4" style={{ color: 'hsl(var(--color-primary))' }} />
                        <span className="text-xs font-semibold">Excel File</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex flex-col items-center gap-1.5 py-2.5 transition-all duration-300 hover:shadow-md"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          borderColor: 'rgba(250, 129, 47, 0.3)'
                        }}
                        onClick={() => policyDetails?.container?.drl_presigned_url && window.open(policyDetails.container.drl_presigned_url, '_blank')}
                        disabled={!policyDetails?.container?.drl_presigned_url}
                      >
                        <Download className="w-4 h-4" style={{ color: 'hsl(var(--color-primary))' }} />
                        <span className="text-xs font-semibold">DRL File</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex flex-col items-center gap-1.5 py-2.5 transition-all duration-300 hover:shadow-md"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          borderColor: 'rgba(250, 129, 47, 0.3)'
                        }}
                        onClick={() => policyDetails?.container?.jar_presigned_url && window.open(policyDetails.container.jar_presigned_url, '_blank')}
                        disabled={!policyDetails?.container?.jar_presigned_url}
                      >
                        <Download className="w-4 h-4" style={{ color: 'hsl(var(--color-primary))' }} />
                        <span className="text-xs font-semibold">JAR File</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Right Column - Quick Test with Miro Board */}
          {selectedPolicy && (
            <div className="space-y-6">
            <Card className="border shadow-md" style={{
              background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.95) 0%, rgba(254, 243, 226, 0.8) 100%)',
              borderColor: 'rgba(250, 129, 47, 0.2)'
            }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold" style={{
                      background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>Quick Test</CardTitle>
                    <CardDescription>Test extracted rules with sample data</CardDescription>
                  </div>
                  <Button
                    onClick={() => policyDetails?.container?.test_harness_presigned_url && window.open(policyDetails.container.test_harness_presigned_url, '_blank')}
                    disabled={!policyDetails?.container?.test_harness_presigned_url}
                    variant="outline"
                    size="sm"
                    className="shadow-md hover:shadow-lg transition-all duration-300 font-semibold shrink-0"
                    style={{
                      borderColor: 'rgba(250, 129, 47, 0.3)',
                      color: 'hsl(var(--color-primary))'
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Test Harness
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Example Selector */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                    Examples:
                  </Label>
                  <Select value={testExample} onValueChange={setTestExample}>
                    <SelectTrigger 
                      className="h-11 text-base"
                      style={{
                        background: 'rgba(255, 250, 240, 0.95)',
                        borderColor: 'rgba(250, 129, 47, 0.3)',
                        color: 'hsl(var(--color-foreground))'
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        background: 'rgba(255, 250, 240, 0.98)',
                        borderColor: 'rgba(250, 129, 47, 0.2)'
                      }}
                    >
                      {Object.entries(testExamples).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Request Body */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                      Request body
                    </Label>
                    <span className="text-xs font-medium px-2 py-1 rounded" style={{
                      background: 'rgba(250, 129, 47, 0.1)',
                      color: 'hsl(var(--color-primary))'
                    }}>
                      required
                    </span>
                  </div>
                  <div 
                    className="rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-[200px]"
                    style={{
                      background: '#2d2d2d',
                      color: '#d4d4d4'
                    }}
                  >
                    <pre>{JSON.stringify(displayedRequestBody, null, 2)}</pre>
                  </div>
                </div>

                {/* Execute Button */}
                <Button
                  onClick={handleExecuteTest}
                  disabled={isExecuting}
                  className="w-full h-10 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)',
                    border: 'none'
                  }}
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Execute
                    </>
                  )}
                </Button>

                {/* Response Summary */}
                {testResponse && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Decision Header - Left Side */}
                    <div 
                      className="rounded-xl p-5 flex flex-col items-center justify-center"
                      style={{
                        background: testResponse.decision === "APPROVED" 
                          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.03) 100%)'
                          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.03) 100%)',
                        border: `1px solid ${testResponse.decision === "APPROVED" ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        minHeight: '140px'
                      }}
                    >
                      <div className="flex items-center justify-center mb-2">
                        {testResponse.decision === "APPROVED" ? (
                          <CheckCircle className="w-8 h-8" style={{ color: '#22c55e' }} />
                        ) : (
                          <XCircle className="w-8 h-8" style={{ color: '#ef4444' }} />
                        )}
                      </div>
                      <p 
                        className="text-xl font-bold mb-1" 
                        style={{
                          color: testResponse.decision === "APPROVED" ? '#22c55e' : '#ef4444'
                        }}
                      >
                        {testResponse.decision}
                      </p>
                      {testResponse.rejectionReason && (
                        <p className="text-xs font-medium text-center" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          {testResponse.rejectionReason}
                        </p>
                      )}
                    </div>

                    {/* Stats Grid - Right Side */}
                    <div className="grid grid-cols-3 gap-2">
                      <Card className="border shadow-sm p-3 text-center flex flex-col items-center justify-center" style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(250, 129, 47, 0.15)',
                        minHeight: '140px'
                      }}>
                        <Clock className="w-5 h-5 mb-1" style={{ color: 'hsl(var(--color-primary))' }} />
                        <p className="text-xs font-medium mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Time</p>
                        <p className="text-base font-bold" style={{ color: 'hsl(var(--color-primary))' }}>
                          {testResponse.timeTaken}ms
                        </p>
                      </Card>
                      <Card className="border shadow-sm p-3 text-center flex flex-col items-center justify-center" style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(34, 197, 94, 0.15)',
                        minHeight: '140px'
                      }}>
                        <CheckCircle className="w-5 h-5 mb-1" style={{ color: '#22c55e' }} />
                        <p className="text-xs font-medium mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Passed</p>
                        <p className="text-base font-bold" style={{ color: '#22c55e' }}>
                          {testResponse.rulesPassed}/{testResponse.rulesEvaluated}
                        </p>
                      </Card>
                      <Card className="border shadow-sm p-3 text-center flex flex-col items-center justify-center" style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(239, 68, 68, 0.15)',
                        minHeight: '140px'
                      }}>
                        <XCircle className="w-5 h-5 mb-1" style={{ color: '#ef4444' }} />
                        <p className="text-xs font-medium mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Failed</p>
                        <p className="text-base font-bold" style={{ color: '#ef4444' }}>
                          {testResponse.rulesFailed}
                        </p>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Miro Board - Rules Visualization */}
            {testResponse && (
              <Card className="border shadow-md" style={{
                background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.95) 0%, rgba(254, 243, 226, 0.8) 100%)',
                borderColor: 'rgba(250, 129, 47, 0.2)'
              }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold mb-1" style={{
                        background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>Rules Board</CardTitle>
                      <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        Interactive rule visualization - Drag nodes to rearrange, scroll to zoom
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, rgba(250, 129, 47, 0.12) 0%, rgba(250, 177, 47, 0.08) 100%)',
                          color: 'hsl(var(--color-primary))',
                          border: '1px solid rgba(250, 129, 47, 0.2)'
                        }}
                      >
                        {testResponse.rulesEvaluated} evaluated
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div style={{ width: '100%', height: '700px', background: '#FEFAF0' }}>
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnect}
                      nodeTypes={nodeTypes}
                      fitView
                      fitViewOptions={{ padding: 0.2 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.3) 0%, rgba(254, 243, 226, 0.3) 100%)'
                      }}
                    >
                      <Background 
                        variant={BackgroundVariant.Dots}
                        gap={16}
                        size={1}
                        color="rgba(250, 129, 47, 0.2)"
                      />
                      <Controls 
                        style={{
                          button: {
                            background: 'white',
                            borderColor: 'rgba(250, 129, 47, 0.3)'
                          }
                        }}
                      />
                      <MiniMap 
                        nodeColor={(node) => {
                          if (node.data.passed === true) return '#22c55e'
                          if (node.data.passed === false) return '#ef4444'
                          return '#FA812F'
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(250, 129, 47, 0.3)'
                        }}
                      />
                    </ReactFlow>
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Rule Modal */}
      <EditRuleModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        rule={selectedRuleForEdit}
        onSave={handleSaveRuleUpdate}
        isLoading={isUpdatingRule}
      />

      {/* Add Rule Modal */}
      <AddRuleModal
        isOpen={isAddRuleModalOpen}
        onClose={handleCloseAddRuleModal}
        onSave={handleSaveNewRule}
        isLoading={isAddingRule}
        parentRules={hierarchicalRules}
        error={addRuleError}
      />

      {/* Rule Details Modal */}
      <Dialog open={isRuleDetailsModalOpen} onOpenChange={setIsRuleDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{
          background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(254, 243, 226, 0.95) 100%)',
          borderColor: 'rgba(250, 129, 47, 0.3)'
        }}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3" style={{
              background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              <FileText className="w-6 h-6" style={{ color: 'hsl(var(--color-primary))' }} />
              Rule Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the extracted rule and its source
            </DialogDescription>
          </DialogHeader>

          {selectedRuleForDetails && (
            <div className="space-y-6 mt-4">
              {/* Rule Overview */}
              <Card style={{
                background: 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(250, 129, 47, 0.2)'
              }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold" style={{ color: 'hsl(var(--color-foreground))' }}>
                    Rule Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge style={{
                        background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                        color: 'white'
                      }}>
                        ID: {selectedRuleForDetails.id}
                      </Badge>
                      <Badge variant="outline" style={{
                        borderColor: 'rgba(250, 129, 47, 0.3)',
                        color: 'hsl(var(--color-foreground))'
                      }}>
                        {selectedRuleForDetails.dependencies?.length || 0} Dependencies
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--color-foreground))' }}>
                      {selectedRuleForDetails.name}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                      {selectedRuleForDetails.description}
                    </p>
                  </div>

                  {/* Confidence Score */}
                  <div className="p-4 rounded-lg" style={{
                    background: 'rgba(250, 129, 47, 0.05)',
                    border: '1px solid rgba(250, 129, 47, 0.2)'
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                        Confidence Score
                      </span>
                      <span className="text-2xl font-bold" style={{ color: 'hsl(var(--color-primary))' }}>
                        {(selectedRuleForDetails.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(250, 129, 47, 0.2)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${selectedRuleForDetails.confidence * 100}%`,
                          background: 'linear-gradient(90deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Expected Condition */}
                  {selectedRuleForDetails.expected && (
                    <div>
                      <Label className="text-sm font-semibold mb-2" style={{ color: 'hsl(var(--color-foreground))' }}>
                        Expected Condition
                      </Label>
                      <div className="p-3 rounded-lg font-mono text-sm" style={{
                        background: '#2d2d2d',
                        color: '#d4d4d4'
                      }}>
                        {selectedRuleForDetails.expected}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Extraction Metadata */}
              <Card style={{
                background: 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(250, 129, 47, 0.2)'
              }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center gap-2" style={{ color: 'hsl(var(--color-foreground))' }}>
                    <FileText className="w-5 h-5" style={{ color: 'hsl(var(--color-primary))' }} />
                    Extraction Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        Source Document
                      </Label>
                      <p className="text-sm font-mono truncate" style={{ color: 'hsl(var(--color-foreground))' }}>
                        {selectedRuleForDetails.extractionMetadata?.sourceDocument?.split('/').pop() || 'policy_document.pdf'}
                      </p>
                    </div>
                    {selectedRuleForDetails.extractionMetadata?.pageNumber && (
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          Page Number
                        </Label>
                        <p className="text-sm font-semibold" style={{ color: 'hsl(var(--color-primary))' }}>
                          Page {selectedRuleForDetails.extractionMetadata.pageNumber}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        Extraction Method
                      </Label>
                      <Badge variant="outline" style={{
                        borderColor: 'rgba(250, 129, 47, 0.3)',
                        color: 'hsl(var(--color-foreground))'
                      }}>
                        {selectedRuleForDetails.extractionMetadata?.extractionMethod?.toUpperCase() || 'TEXTRACT'}
                      </Badge>
                    </div>
                    {selectedRuleForDetails.extractionMetadata?.clauseReference && (
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          Clause Reference
                        </Label>
                        <p className="text-sm" style={{ color: 'hsl(var(--color-foreground))' }}>
                          {selectedRuleForDetails.extractionMetadata.clauseReference}
                        </p>
                      </div>
                    )}
                    {selectedRuleForDetails.extractionMetadata?.extractedAt && (
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          Extracted At
                        </Label>
                        <p className="text-sm" style={{ color: 'hsl(var(--color-foreground))' }}>
                          {new Date(selectedRuleForDetails.extractionMetadata.extractedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedRuleForDetails.extractionMetadata?.updatedAt && (
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          Last Updated
                        </Label>
                        <p className="text-sm" style={{ color: 'hsl(var(--color-foreground))' }}>
                          {new Date(selectedRuleForDetails.extractionMetadata.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedRuleForDetails.extractionMetadata?.confidence !== null && selectedRuleForDetails.extractionMetadata?.confidence !== undefined && (
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          Confidence Score
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(250, 129, 47, 0.2)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${selectedRuleForDetails.extractionMetadata.confidence}%`,
                                background: 'linear-gradient(90deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)'
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold" style={{ color: 'hsl(var(--color-primary))' }}>
                            {selectedRuleForDetails.extractionMetadata.confidence}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Dependencies */}
              {selectedRuleForDetails.dependencies && selectedRuleForDetails.dependencies.length > 0 && (
                <Card style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(250, 129, 47, 0.2)'
                }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold flex items-center gap-2" style={{ color: 'hsl(var(--color-foreground))' }}>
                      <GitBranch className="w-5 h-5" style={{ color: '#9333ea' }} />
                      Dependencies ({selectedRuleForDetails.dependencies.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedRuleForDetails.dependencies.map((dep, idx) => (
                        <div key={idx} className="p-3 rounded-lg border" style={{
                          background: 'rgba(147, 51, 234, 0.03)',
                          borderColor: 'rgba(147, 51, 234, 0.2)'
                        }}>
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-bold" style={{ color: '#9333ea' }}>
                              {dep.id}. {dep.name}
                            </span>
                            <Badge variant="outline" style={{
                              borderColor: 'rgba(147, 51, 234, 0.3)',
                              color: '#9333ea',
                              fontSize: '10px'
                            }}>
                              {(dep.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                            {dep.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={handleCloseRuleDetailsModal}
              style={{
                borderColor: 'rgba(250, 129, 47, 0.3)'
              }}
            >
              Close
            </Button>
            {policyDetails?.container?.policy_presigned_url && (
              <Button
                onClick={() => window.open(policyDetails.container.policy_presigned_url, '_blank')}
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                  border: 'none'
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                View Source Document
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Success/Error Notification */}
      {updateSuccess && (
        <div 
          className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(34, 197, 94, 0.85) 100%)',
            color: 'white'
          }}
        >
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">Rule saved successfully!</span>
        </div>
      )}
      
      {updateError && (
        <div 
          className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 z-50"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(239, 68, 68, 0.85) 100%)',
            color: 'white'
          }}
        >
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Failed to update rule</p>
            <p className="text-sm">{updateError}</p>
          </div>
        </div>
      )}
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen flex flex-col" style={{ 
        background: 'linear-gradient(135deg, #FEF3E2 0%, #FFF5E6 50%, #FEF3E2 100%)'
      }}>
        {/* Header */}
        <header 
          className="border-b shadow-sm" 
          style={{ 
            background: 'linear-gradient(135deg, #FEF3E2 0%, #FFF5E6 100%)',
            borderColor: 'rgba(250, 129, 47, 0.2)'
          }}
        >
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105" 
                style={{ 
                  background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)'
                }}
              >
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{
                  background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>UW Small Business Platform</h1>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Policy compliance and underwriting management system
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <aside 
            className="w-64 border-r flex-shrink-0 shadow-lg" 
            style={{ 
              background: 'linear-gradient(180deg, #FEF3E2 0%, #FFF5E6 100%)',
              borderColor: 'rgba(250, 129, 47, 0.2)'
            }}
          >
            <nav className="px-4 pt-8 space-y-3">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive 
                        ? 'text-white shadow-lg transform scale-105' 
                        : 'hover:bg-orange-50 hover:translate-x-1'
                    }`}
                    style={{
                      background: isActive 
                        ? 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)' 
                        : 'transparent',
                      color: isActive ? 'white' : 'hsl(var(--color-foreground))',
                      boxShadow: isActive ? '0 4px 12px rgba(250, 129, 47, 0.4)' : 'none'
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main 
            className="flex-1 overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(254, 243, 226, 0.3) 0%, rgba(255, 245, 230, 0.3) 100%)'
            }}
          >
            <div className="px-8 pt-8 pb-8">
              {activeSection === "overview" && <OverviewContent />}
              {activeSection === "bank-management" && <BankManagementContent />}
              {activeSection === "bank-details" && <BankDetailsContent />}
            </div>
          </main>
        </div>
      </div>

      {/* Add Vendor Modal */}
      <Dialog 
        open={isAddBankModalOpen} 
        onOpenChange={(open) => {
          // Prevent closing on backdrop click
          if (!open && !showCloseConfirmation) {
            handleCloseModal()
          }
        }}
      >
        <DialogContent 
          className="sm:max-w-[1200px] h-[95vh] max-h-[95vh] overflow-hidden flex flex-col p-0 [&>button]:hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(254, 243, 226, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(250, 129, 47, 0.2)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(250, 129, 47, 0.2)' }}>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle 
                  className="text-2xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Add New Vendor
                </DialogTitle>
                <DialogDescription className="text-base font-medium mt-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Upload policy document and configure vendor details
                </DialogDescription>
              </div>
              <button
                onClick={handleCloseModal}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-2"
                style={{ color: 'hsl(var(--color-foreground))' }}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Section - Form Inputs */}
            <div className="w-1/2 border-r p-6 overflow-y-auto" style={{ borderColor: 'rgba(250, 129, 47, 0.2)' }}>
              <div className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="bank-file" className="text-base font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                    Policy Document <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      id="bank-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={processingStatus === "processing"}
                    />
                    <label
                      htmlFor="bank-file"
                      className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:border-solid hover:shadow-lg ${
                        processingStatus === "processing" ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      style={{
                        background: 'rgba(255, 250, 240, 0.8)',
                        borderColor: selectedFile ? 'hsl(var(--color-primary))' : 'rgba(250, 129, 47, 0.3)',
                        color: 'hsl(var(--color-foreground))'
                      }}
                    >
                      <Upload className="w-6 h-6" style={{ color: 'hsl(var(--color-primary))' }} />
                      <div className="text-center">
                        {selectedFile ? (
                          <p className="font-semibold text-sm">{selectedFile.name}</p>
                        ) : (
                          <>
                            <p className="font-semibold text-sm">Click to upload or drag and drop</p>
                            <p className="text-xs mt-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                              PDF, DOC, DOCX, TXT (MAX. 10MB)
                            </p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Insurance Type */}
                <div className="space-y-2">
                  <Label htmlFor="insurance-type" className="text-base font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                    Insurance Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={insuranceType} onValueChange={setInsuranceType} disabled={processingStatus === "processing"}>
                    <SelectTrigger 
                      id="insurance-type"
                      className="h-11 text-base"
                      style={{
                        background: 'rgba(255, 250, 240, 0.95)',
                        borderColor: 'rgba(250, 129, 47, 0.3)',
                        color: 'hsl(var(--color-foreground))'
                      }}
                    >
                      <SelectValue placeholder="Select insurance type" />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        background: 'rgba(255, 250, 240, 0.98)',
                        borderColor: 'rgba(250, 129, 47, 0.2)'
                      }}
                    >
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="mortgage">Mortgage</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="underwriting">Underwriting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vendor Name */}
                <div className="space-y-2">
                  <Label htmlFor="bank-name" className="text-base font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                    Vendor Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bank-name"
                    type="text"
                    placeholder="e.g., Chase Vendor, Wells Fargo"
                    value={bankName}
                    onChange={handleBankNameChange}
                    className="h-11 text-base"
                    disabled={processingStatus === "processing"}
                    style={{
                      background: 'rgba(255, 250, 240, 0.95)',
                      borderColor: 'rgba(250, 129, 47, 0.3)',
                      color: 'hsl(var(--color-foreground))'
                    }}
                    autoComplete="off"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleAddBank}
                  disabled={!selectedFile || !insuranceType || !bankName || processingStatus === "processing"}
                  className="w-full h-12 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)',
                    border: 'none'
                  }}
                >
                  {processingStatus === "processing" ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Process Document
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Section - Processing State & Output */}
            <div className="w-1/2 p-6 overflow-y-auto">
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4" style={{
                  background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Processing Status
                </h3>

                {processingStatus === "idle" && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="w-16 h-16 mb-4" style={{ color: 'hsl(var(--color-muted-foreground))', opacity: 0.5 }} />
                    <p className="text-lg font-semibold mb-2" style={{ color: 'hsl(var(--color-foreground))' }}>
                      Ready to Process
                    </p>
                    <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                      Fill in the form and click "Process Document" to begin
                    </p>
                  </div>
                )}

                {processingStatus === "processing" && (
                  <div className="space-y-6">
                    {/* Processing Header */}
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="relative w-20 h-20 mb-4">
                        <div className="absolute inset-0 rounded-full" style={{
                          background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                          opacity: 0.2,
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }} />
                        <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{
                          background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)'
                        }}>
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                      </div>
                      <p className="text-xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        Processing Document
                      </p>
                      <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        Extracting rules and deploying policies...
                      </p>
                    </div>

                    {/* Processing Steps */}
                    <div className="space-y-3">
                      {/* Text Extraction */}
                      {visibleSteps >= 1 && (
                        <div 
                          className="relative overflow-hidden rounded-xl border transition-all duration-500 animate-fade-in-up"
                          style={{
                            background: currentProcessingStep === 1 
                              ? 'linear-gradient(135deg, rgba(250, 129, 47, 0.08) 0%, rgba(250, 129, 47, 0.04) 100%)'
                              : 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.02) 100%)',
                            borderColor: currentProcessingStep === 1 ? 'rgba(250, 129, 47, 0.4)' : 'rgba(34, 197, 94, 0.3)',
                            animation: 'fadeInUp 0.5s ease-out forwards'
                          }}
                        >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {currentProcessingStep === 1 ? (
                                <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" style={{ color: 'hsl(var(--color-primary))' }} />
                              ) : (
                                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(var(--color-success))' }} />
                              )}
                              <div>
                                <p className="font-semibold text-base mb-1">Text Extraction</p>
                                <p className="text-xs font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                                  {currentProcessingStep === 1 
                                    ? 'Extracting text from document...'
                                    : 'Status: success | Length: 2099 characters'}
                                </p>
                              </div>
                            </div>
                            <Badge className={`font-semibold ${currentProcessingStep === 1 ? 'animate-pulse' : ''}`} style={{
                              background: currentProcessingStep === 1 
                                ? 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)'
                                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                              border: 'none'
                            }}>
                              {currentProcessingStep === 1 ? 'Processing' : 'Completed'}
                            </Badge>
                          </div>
                        </div>
                        </div>
                      )}

                      {/* Query Generation */}
                      {visibleSteps >= 2 && (
                        <div 
                          className="relative overflow-hidden rounded-xl border transition-all duration-500"
                          style={{
                            background: currentProcessingStep === 2 
                              ? 'linear-gradient(135deg, rgba(250, 129, 47, 0.08) 0%, rgba(250, 129, 47, 0.04) 100%)'
                              : 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.02) 100%)',
                            borderColor: currentProcessingStep === 2 ? 'rgba(250, 129, 47, 0.4)' : 'rgba(34, 197, 94, 0.3)',
                            animation: 'fadeInUp 0.5s ease-out forwards'
                          }}
                        >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {currentProcessingStep === 2 ? (
                                <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" style={{ color: 'hsl(var(--color-primary))' }} />
                              ) : (
                                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(var(--color-success))' }} />
                              )}
                              <div>
                                <p className="font-semibold text-base mb-1">Query Generation</p>
                                <p className="text-xs font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                                  {currentProcessingStep === 2 
                                    ? 'Generating queries using LLM...'
                                    : 'Method: llm_generated | Count: 41 queries'}
                                </p>
                              </div>
                            </div>
                            <Badge className={`font-semibold ${currentProcessingStep === 2 ? 'animate-pulse' : ''}`} style={{
                              background: currentProcessingStep === 2 
                                ? 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)'
                                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                              border: 'none'
                            }}>
                              {currentProcessingStep === 2 ? 'Processing' : 'Completed'}
                            </Badge>
                          </div>
                        </div>
                        </div>
                      )}

                      {/* Data Extraction */}
                      {visibleSteps >= 3 && (
                        <div 
                          className="relative overflow-hidden rounded-xl border transition-all duration-500"
                          style={{
                            background: currentProcessingStep === 3 
                              ? 'linear-gradient(135deg, rgba(250, 129, 47, 0.08) 0%, rgba(250, 129, 47, 0.04) 100%)'
                              : 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.02) 100%)',
                            borderColor: currentProcessingStep === 3 ? 'rgba(250, 129, 47, 0.4)' : 'rgba(34, 197, 94, 0.3)',
                            animation: 'fadeInUp 0.5s ease-out forwards'
                          }}
                        >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {currentProcessingStep === 3 ? (
                                <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" style={{ color: 'hsl(var(--color-primary))' }} />
                              ) : (
                                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(var(--color-success))' }} />
                              )}
                              <div>
                                <p className="font-semibold text-base mb-1">Data Extraction</p>
                                <p className="text-xs font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                                  {currentProcessingStep === 3 
                                    ? 'Extracting structured data using Textract...'
                                    : 'Method: textract | Extracted structured data'}
                                </p>
                              </div>
                            </div>
                            <Badge className={`font-semibold ${currentProcessingStep === 3 ? 'animate-pulse' : ''}`} style={{
                              background: currentProcessingStep === 3 
                                ? 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)'
                                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                              border: 'none'
                            }}>
                              {currentProcessingStep === 3 ? 'Processing' : 'Completed'}
                            </Badge>
                          </div>
                        </div>
                        </div>
                      )}

                      {/* Rule Generation */}
                      {visibleSteps >= 4 && (
                        <div 
                          className="relative overflow-hidden rounded-xl border transition-all duration-500"
                          style={{
                            background: currentProcessingStep === 4 
                              ? 'linear-gradient(135deg, rgba(250, 129, 47, 0.08) 0%, rgba(250, 129, 47, 0.04) 100%)'
                              : 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.02) 100%)',
                            borderColor: currentProcessingStep === 4 ? 'rgba(250, 129, 47, 0.4)' : 'rgba(34, 197, 94, 0.3)',
                            animation: 'fadeInUp 0.5s ease-out forwards'
                          }}
                        >
                        {currentProcessingStep === 4 && (
                          <div 
                            className="absolute top-0 left-0 h-full transition-all duration-1000"
                            style={{
                              width: '65%',
                              background: 'linear-gradient(90deg, rgba(250, 129, 47, 0.1) 0%, transparent 100%)'
                            }}
                          />
                        )}
                        <div className="p-4 relative z-10">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {currentProcessingStep === 4 ? (
                                <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" style={{ color: 'hsl(var(--color-primary))' }} />
                              ) : (
                                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(var(--color-success))' }} />
                              )}
                              <div>
                                <p className="font-semibold text-base mb-1">Rule Generation</p>
                                <p className="text-xs font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                                  {currentProcessingStep === 4 
                                    ? 'Generating DRL rules | Estimated: 2620 characters'
                                    : 'Generated 12 rules | Size: 2620 characters'}
                                </p>
                              </div>
                            </div>
                            <Badge className={`font-semibold ${currentProcessingStep === 4 ? 'animate-pulse' : ''}`} style={{
                              background: currentProcessingStep === 4 
                                ? 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)'
                                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                              border: 'none'
                            }}>
                              {currentProcessingStep === 4 ? 'Processing' : 'Completed'}
                            </Badge>
                          </div>
                          {currentProcessingStep === 4 && (
                            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(250, 129, 47, 0.2)' }}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(250, 129, 47, 0.2)' }}>
                                  <div 
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{
                                      width: '65%',
                                      background: 'linear-gradient(90deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)'
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-semibold" style={{ color: 'hsl(var(--color-primary))' }}>65%</span>
                              </div>
                              <p className="text-xs font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                                Analyzing {insuranceType} policy rules...
                              </p>
                            </div>
                          )}
                        </div>
                        </div>
                      )}

                      {/* Deployment */}
                      {visibleSteps >= 5 && (
                        <div 
                          className={`relative overflow-hidden rounded-xl border transition-all duration-500 ${currentProcessingStep === 5 ? '' : 'opacity-100'}`}
                          style={{
                            background: currentProcessingStep === 5 
                              ? 'linear-gradient(135deg, rgba(250, 129, 47, 0.08) 0%, rgba(250, 129, 47, 0.04) 100%)'
                              : 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.02) 100%)',
                            borderColor: currentProcessingStep === 5 ? 'rgba(250, 129, 47, 0.4)' : 'rgba(34, 197, 94, 0.3)',
                            animation: 'fadeInUp 0.5s ease-out forwards'
                          }}
                        >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {currentProcessingStep === 5 ? (
                                <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" style={{ color: 'hsl(var(--color-primary))' }} />
                              ) : (
                                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(var(--color-success))' }} />
                              )}
                              <div>
                                <p className="font-semibold text-base mb-1">Deployment</p>
                                <p className="text-xs font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                                  {currentProcessingStep === 5 
                                    ? 'Deploying rules to container...'
                                    : 'Successfully deployed to production'}
                                </p>
                              </div>
                            </div>
                            <Badge className={`font-semibold ${currentProcessingStep === 5 ? 'animate-pulse' : ''}`} style={{
                              background: currentProcessingStep === 5 
                                ? 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)'
                                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                              border: 'none'
                            }}>
                              {currentProcessingStep === 5 ? 'Processing' : 'Completed'}
                            </Badge>
                          </div>
                        </div>
                        </div>
                      )}
                    </div>

                    {/* Processing Footer */}
                    <div className="pt-4 border-t" style={{ borderColor: 'rgba(250, 129, 47, 0.2)' }}>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(var(--color-primary))' }} />
                          <span className="font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                            Processing {bankName}...
                          </span>
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          Step {currentProcessingStep > 0 ? currentProcessingStep : visibleSteps} of 5
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {processingStatus === "completed" && processingOutput && (
                  <div className="space-y-6 h-full overflow-y-auto">
                    {/* Success Header */}
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg" style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                      }}>
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-xl font-bold mb-1" style={{ 
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        Processing Completed Successfully!
                      </p>
                      <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        Document processed and policies deployed
                      </p>
                    </div>

                    {/* Vendor Details */}
                    <Card className="border shadow-md" style={{
                      background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.95) 0%, rgba(254, 243, 226, 0.8) 100%)',
                      borderColor: 'rgba(250, 129, 47, 0.2)'
                    }}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold" style={{
                          background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>Vendor Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div>
                            <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Vendor ID</p>
                            <p className="text-sm font-mono font-semibold" style={{ color: 'hsl(var(--color-primary))' }}>
                              {processingOutput.bankId}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Vendor Name</p>
                            <p className="text-sm font-semibold">{processingOutput.bankName}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Insurance Type</p>
                            <p className="text-sm font-semibold capitalize">{processingOutput.insuranceType}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))' }}>File Size</p>
                            <p className="text-sm font-semibold">{processingOutput.fileSize}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Container ID</p>
                            <p className="text-sm font-mono font-semibold" style={{ color: 'hsl(var(--color-primary))' }}>
                              {processingOutput.containerId}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Processed At</p>
                            <p className="text-sm font-semibold">{processingOutput.processedAt}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Extracted Rules */}
                    <Card className="border shadow-md" style={{
                      background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.95) 0%, rgba(254, 243, 226, 0.8) 100%)',
                      borderColor: 'rgba(250, 129, 47, 0.2)'
                    }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-bold" style={{
                            background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}>Extracted Rules</CardTitle>
                          <Badge className="font-semibold" style={{
                            background: 'linear-gradient(135deg, hsl(var(--color-secondary)) 0%, hsl(42, 96%, 50%) 100%)',
                            border: 'none'
                          }}>
                            {processingOutput.rulesExtracted} rules
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {processingOutput.rules && processingOutput.rules.length > 0 ? (
                          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {processingOutput.rules.map((rule) => (
                              <div
                                key={rule.id}
                                className="p-3 rounded-lg border transition-all duration-300 hover:shadow-md"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.6)',
                                  borderColor: 'rgba(250, 129, 47, 0.15)'
                                }}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold mb-1" style={{ color: 'hsl(var(--color-foreground))' }}>
                                      {rule.id}. {rule.name}
                                    </p>
                                    {rule.category && (
                                      <Badge 
                                        variant="outline" 
                                        className="text-xs font-medium"
                                        style={{
                                          background: 'rgba(250, 129, 47, 0.08)',
                                          borderColor: 'rgba(250, 129, 47, 0.25)',
                                          color: 'hsl(var(--color-primary))'
                                        }}
                                      >
                                        {rule.category}
                                      </Badge>
                                    )}
                                  </div>
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs font-semibold shrink-0"
                                    style={{
                                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                                      borderColor: 'rgba(34, 197, 94, 0.3)',
                                      color: 'hsl(var(--color-success))'
                                    }}
                                  >
                                    {rule.status}
                                  </Badge>
                                </div>
                                <p className="text-xs mb-2" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                                  {rule.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                                    Confidence:
                                  </span>
                                  <div className="flex-1 max-w-[120px] h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(250, 129, 47, 0.2)' }}>
                                    <div
                                      className="h-full rounded-full transition-all duration-300"
                                      style={{
                                        width: `${rule.confidence * 100}%`,
                                        background: 'linear-gradient(90deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)'
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold" style={{ color: 'hsl(var(--color-primary))' }}>
                                    {(rule.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                              No rules extracted yet
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Download Generated Files */}
                    <Card className="border shadow-md" style={{
                      background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.95) 0%, rgba(254, 243, 226, 0.8) 100%)',
                      borderColor: 'rgba(250, 129, 47, 0.2)'
                    }}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold" style={{
                          background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>Download Generated Files</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-2">
                          <Button
                            variant="outline"
                            className="h-auto flex flex-col items-center gap-1.5 py-2.5 transition-all duration-300 hover:shadow-md"
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              borderColor: 'rgba(250, 129, 47, 0.3)'
                            }}
                            onClick={() => processingOutput?.container?.policy_presigned_url && window.open(processingOutput.container.policy_presigned_url, '_blank')}
                            disabled={!processingOutput?.container?.policy_presigned_url}
                          >
                            <Download className="w-4 h-4" style={{ color: 'hsl(var(--color-primary))' }} />
                            <span className="text-xs font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                              PDF File
                            </span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-auto flex flex-col items-center gap-1.5 py-2.5 transition-all duration-300 hover:shadow-md"
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              borderColor: 'rgba(250, 129, 47, 0.3)'
                            }}
                            onClick={() => processingOutput?.container?.excel_presigned_url && window.open(processingOutput.container.excel_presigned_url, '_blank')}
                            disabled={!processingOutput?.container?.excel_presigned_url}
                          >
                            <Download className="w-4 h-4" style={{ color: 'hsl(var(--color-primary))' }} />
                            <span className="text-xs font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                              Excel File
                            </span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-auto flex flex-col items-center gap-1.5 py-2.5 transition-all duration-300 hover:shadow-md"
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              borderColor: 'rgba(250, 129, 47, 0.3)'
                            }}
                            onClick={() => processingOutput?.container?.drl_presigned_url && window.open(processingOutput.container.drl_presigned_url, '_blank')}
                            disabled={!processingOutput?.container?.drl_presigned_url}
                          >
                            <Download className="w-4 h-4" style={{ color: 'hsl(var(--color-primary))' }} />
                            <span className="text-xs font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                              DRL File
                            </span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-auto flex flex-col items-center gap-1.5 py-2.5 transition-all duration-300 hover:shadow-md"
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              borderColor: 'rgba(250, 129, 47, 0.3)'
                            }}
                            onClick={() => processingOutput?.container?.jar_presigned_url && window.open(processingOutput.container.jar_presigned_url, '_blank')}
                            disabled={!processingOutput?.container?.jar_presigned_url}
                          >
                            <Download className="w-4 h-4" style={{ color: 'hsl(var(--color-primary))' }} />
                            <span className="text-xs font-semibold" style={{ color: 'hsl(var(--color-foreground))' }}>
                              JAR File
                            </span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {processingStatus === "error" && processingOutput && (
                  <div className="space-y-6">
                    {/* Error Header */}
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg" style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      }}>
                        <XCircle className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-xl font-bold mb-1" style={{ 
                        color: '#ef4444'
                      }}>
                        Processing Failed
                      </p>
                      <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        An error occurred while processing your document
                      </p>
                    </div>

                    {/* Error Details */}
                    <Card className="border shadow-md" style={{
                      background: 'linear-gradient(135deg, rgba(254, 226, 226, 0.5) 0%, rgba(254, 243, 226, 0.3) 100%)',
                      borderColor: 'rgba(239, 68, 68, 0.3)'
                    }}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold flex items-center gap-2" style={{
                          color: '#ef4444'
                        }}>
                          <AlertCircle className="w-5 h-5" />
                          Error Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Error Message</p>
                          <p className="text-sm font-medium p-3 rounded" style={{ 
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444'
                          }}>
                            {processingOutput.error}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                          <div>
                            <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Vendor Name</p>
                            <p className="text-sm font-semibold">{processingOutput.bankName}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))' }}>File Name</p>
                            <p className="text-sm font-semibold">{processingOutput.fileName}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Failed At</p>
                            <p className="text-sm font-semibold">{processingOutput.processedAt}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Retry Button */}
                    <Button
                      onClick={() => {
                        setProcessingStatus("idle")
                        setProcessingOutput(null)
                      }}
                      className="w-full h-12 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)',
                        border: 'none'
                      }}
                    >
                      <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <Dialog open={showCloseConfirmation} onOpenChange={setShowCloseConfirmation}>
        <DialogContent 
          className="sm:max-w-[400px]"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(254, 243, 226, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(250, 129, 47, 0.2)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" style={{ color: 'hsl(var(--color-warning))' }} />
              Confirm Close
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Processing is in progress. Are you sure you want to close? All progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCloseConfirmation(false)}
              className="shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                background: 'rgba(255, 250, 240, 0.95)',
                borderColor: 'hsl(var(--color-primary))',
                color: 'hsl(var(--color-primary))'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmClose}
              className="shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--color-destructive)) 0%, hsl(0, 84%, 50%) 100%)',
                border: 'none'
              }}
            >
              Close Anyway
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default HomeDashboard 
