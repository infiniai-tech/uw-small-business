import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Upload, FileText, X, ArrowLeft, Download, Trash2, Loader2, CheckCircle, AlertCircle, Inbox, FileQuestion, Zap, XCircle, Server, Shield, Database, Clock, ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { uploadDocumentToS3, processPolicyFromS3, getProcessingStatus, downloadFromS3, getExtractedRules, evaluatePolicy, getAllBanks, getBankPolicies, getPolicyDetails } from "@/services/api"

// Comprehensive Quick Test Results View Component
const QuickTestResultsView = ({ result, policyType, bankId }) => {
  // Generate mock detailed rule evaluation data
  const mockRuleEvaluations = React.useMemo(() => {
    const isApproved = result?.decision?.approved || false;
    
    // Base rules for insurance
    const insuranceRules = [
      {
        id: "ins-001",
        ruleName: "Age Eligibility Check",
        category: "Applicant Eligibility",
        description: "Applicant age must be between 18 and 65 years",
        operator: "BETWEEN",
        expectedValue: "18-65 years",
        actualValue: "35 years",
        status: "passed",
        confidence: 100,
        reason: "Applicant age (35) is within the acceptable range of 18-65 years",
        priority: "critical",
        impact: "high"
      },
      {
        id: "ins-002",
        ruleName: "Credit Score Requirement",
        category: "Financial Assessment",
        description: "Credit score must be at least 680 for preferred rates",
        operator: ">=",
        expectedValue: "680",
        actualValue: "720",
        status: "passed",
        confidence: 100,
        reason: "Credit score (720) exceeds the minimum requirement of 680",
        priority: "high",
        impact: "medium"
      },
      {
        id: "ins-003",
        ruleName: "Income Verification",
        category: "Financial Assessment",
        description: "Annual income must be at least 10x the coverage amount",
        operator: ">=",
        expectedValue: "$5,000,000",
        actualValue: "$75,000",
        status: isApproved ? "warning" : "failed",
        confidence: 85,
        reason: isApproved 
          ? "Income ($75,000) is below the recommended threshold but within acceptable limits with additional conditions"
          : "Annual income ($75,000) does not meet the requirement of 10x coverage amount ($500,000)",
        priority: "high",
        impact: "high"
      },
      {
        id: "ins-004",
        ruleName: "Coverage Amount Limit",
        category: "Policy Terms",
        description: "Coverage amount cannot exceed $1,000,000 for term life policies",
        operator: "<=",
        expectedValue: "$1,000,000",
        actualValue: "$500,000",
        status: "passed",
        confidence: 100,
        reason: "Requested coverage ($500,000) is within the maximum allowed limit",
        priority: "medium",
        impact: "medium"
      },
      {
        id: "ins-005",
        ruleName: "Smoking Status Risk Assessment",
        category: "Health Risk",
        description: "Non-smokers qualify for preferred premium rates",
        operator: "EQUALS",
        expectedValue: "false",
        actualValue: "false",
        status: "passed",
        confidence: 100,
        reason: "Applicant is a non-smoker and qualifies for preferred premium rates",
        priority: "medium",
        impact: "medium"
      },
      {
        id: "ins-006",
        ruleName: "Health Conditions Assessment",
        category: "Health Risk",
        description: "Applicants with 'good' or better health conditions are eligible",
        operator: "IN",
        expectedValue: "['excellent', 'good']",
        actualValue: "good",
        status: "passed",
        confidence: 95,
        reason: "Health condition (good) meets the eligibility criteria",
        priority: "high",
        impact: "high"
      },
      {
        id: "ins-007",
        ruleName: "Policy Term Duration",
        category: "Policy Terms",
        description: "Term duration must be between 10 and 30 years",
        operator: "BETWEEN",
        expectedValue: "10-30 years",
        actualValue: "20 years",
        status: "passed",
        confidence: 100,
        reason: "Selected term (20 years) is within acceptable range",
        priority: "medium",
        impact: "low"
      },
      {
        id: "ins-008",
        ruleName: "Premium Rate Calculation",
        category: "Pricing",
        description: "Premium rate must be calculated based on risk factors",
        operator: "CALCULATED",
        expectedValue: "Dynamic",
        actualValue: "0.85%",
        status: "passed",
        confidence: 92,
        reason: "Premium rate calculated at 0.85% based on applicant's risk profile",
        priority: "high",
        impact: "medium"
      }
    ];

    // Base rules for loan
    const loanRules = [
      {
        id: "loan-001",
        ruleName: "Age Eligibility",
        category: "Applicant Eligibility",
        description: "Applicant must be between 21 and 65 years old",
        operator: "BETWEEN",
        expectedValue: "21-65 years",
        actualValue: "35 years",
        status: "passed",
        confidence: 100,
        reason: "Applicant age (35) falls within the required range",
        priority: "critical",
        impact: "high"
      },
      {
        id: "loan-002",
        ruleName: "Minimum Credit Score",
        category: "Credit Assessment",
        description: "Credit score must be at least 650 for approval",
        operator: ">=",
        expectedValue: "650",
        actualValue: "720",
        status: "passed",
        confidence: 100,
        reason: "Credit score (720) exceeds the minimum requirement significantly",
        priority: "critical",
        impact: "high"
      },
      {
        id: "loan-003",
        ruleName: "Debt-to-Income Ratio",
        category: "Financial Assessment",
        description: "Annual income must be at least 3x the loan amount",
        operator: ">=",
        expectedValue: "$450,000",
        actualValue: "$85,000",
        status: isApproved ? "warning" : "failed",
        confidence: 75,
        reason: isApproved
          ? "Income ($85,000) is below optimal but acceptable with personal guarantee"
          : "Annual income ($85,000) does not meet 3x loan amount requirement ($150,000)",
        priority: "high",
        impact: "high"
      },
      {
        id: "loan-004",
        ruleName: "Maximum Loan Amount",
        category: "Loan Terms",
        description: "Loan amount cannot exceed $500,000 without additional collateral",
        operator: "<=",
        expectedValue: "$500,000",
        actualValue: "$150,000",
        status: "passed",
        confidence: 100,
        reason: "Requested loan amount is well within the maximum limit",
        priority: "high",
        impact: "medium"
      },
      {
        id: "loan-005",
        ruleName: "Personal Guarantee Requirement",
        category: "Risk Mitigation",
        description: "Loans over $100,000 should have personal guarantee",
        operator: "REQUIRED",
        expectedValue: "true",
        actualValue: "false",
        status: isApproved ? "warning" : "failed",
        confidence: 80,
        reason: isApproved
          ? "Personal guarantee not provided but credit profile is strong enough to proceed"
          : "Personal guarantee is recommended for loans above $100,000",
        priority: "medium",
        impact: "medium"
      },
      {
        id: "loan-006",
        ruleName: "Employment Status",
        category: "Applicant Eligibility",
        description: "Applicant must have stable income source",
        operator: "VERIFIED",
        expectedValue: "Verified",
        actualValue: "Verified",
        status: "passed",
        confidence: 95,
        reason: "Employment and income have been verified successfully",
        priority: "high",
        impact: "high"
      },
      {
        id: "loan-007",
        ruleName: "Credit History Length",
        category: "Credit Assessment",
        description: "Credit history must be at least 2 years",
        operator: ">=",
        expectedValue: "2 years",
        actualValue: "8 years",
        status: "passed",
        confidence: 100,
        reason: "Credit history (8 years) exceeds minimum requirement",
        priority: "medium",
        impact: "medium"
      },
      {
        id: "loan-008",
        ruleName: "Outstanding Defaults",
        category: "Credit Assessment",
        description: "No outstanding defaults or bankruptcies",
        operator: "EQUALS",
        expectedValue: "0",
        actualValue: "0",
        status: "passed",
        confidence: 100,
        reason: "No defaults or bankruptcies found in credit report",
        priority: "critical",
        impact: "high"
      }
    ];

    return policyType === "insurance" ? insuranceRules : loanRules;
  }, [result, policyType]);

  const passedRules = mockRuleEvaluations.filter(r => r.status === "passed");
  const failedRules = mockRuleEvaluations.filter(r => r.status === "failed");
  const warningRules = mockRuleEvaluations.filter(r => r.status === "warning");

  const getStatusColor = (status) => {
    switch (status) {
      case "passed": return "rgb(34, 197, 94)";
      case "failed": return "rgb(239, 68, 68)";
      case "warning": return "rgb(251, 191, 36)";
      default: return "rgb(156, 163, 175)";
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "passed": return "rgba(34, 197, 94, 0.1)";
      case "failed": return "rgba(239, 68, 68, 0.1)";
      case "warning": return "rgba(251, 191, 36, 0.1)";
      default: return "rgba(156, 163, 175, 0.1)";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "passed": return <CheckCircle className="w-5 h-5" />;
      case "failed": return <XCircle className="w-5 h-5" />;
      case "warning": return <AlertCircle className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical": return "rgb(220, 38, 38)";
      case "high": return "rgb(249, 115, 22)";
      case "medium": return "rgb(234, 179, 8)";
      case "low": return "rgb(34, 197, 94)";
      default: return "rgb(156, 163, 175)";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Total Rules</p>
                <p className="text-3xl font-bold mt-1">{mockRuleEvaluations.length}</p>
              </div>
              <Shield className="w-8 h-8" style={{ color: 'hsl(var(--color-primary))' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Passed</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'rgb(34, 197, 94)' }}>{passedRules.length}</p>
              </div>
              <CheckCircle className="w-8 h-8" style={{ color: 'rgb(34, 197, 94)' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Warnings</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'rgb(251, 191, 36)' }}>{warningRules.length}</p>
              </div>
              <AlertCircle className="w-8 h-8" style={{ color: 'rgb(251, 191, 36)' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Failed</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'rgb(239, 68, 68)' }}>{failedRules.length}</p>
              </div>
              <XCircle className="w-8 h-8" style={{ color: 'rgb(239, 68, 68)' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Decision */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {result?.decision?.approved ? (
              <CheckCircle className="w-6 h-6" style={{ color: 'rgb(34, 197, 94)' }} />
            ) : (
              <XCircle className="w-6 h-6" style={{ color: 'rgb(239, 68, 68)' }} />
            )}
            Final Decision: {result?.decision?.approved ? "APPROVED" : "REJECTED"}
          </CardTitle>
          <CardDescription>
            Vendor: <strong>{bankId}</strong> | Policy Type: <strong>{policyType}</strong> | 
            Execution Time: <strong>{result?.execution_time_ms || 0}ms</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result?.decision?.reasons && result.decision.reasons.length > 0 && (
            <div className="space-y-2">
              <p className="font-semibold text-sm">Decision Reasons:</p>
              <ul className="space-y-1">
                {result.decision.reasons.map((reason, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result?.decision?.premium_rate && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'hsl(var(--color-border))' }}>
              <p className="text-sm font-semibold">
                Premium Rate: <span className="text-lg" style={{ color: 'hsl(var(--color-primary))' }}>
                  {(result.decision.premium_rate * 100).toFixed(2)}%
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabbed Rule Views */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="all">
            All Rules ({mockRuleEvaluations.length})
          </TabsTrigger>
          <TabsTrigger value="passed">
            Passed ({passedRules.length})
          </TabsTrigger>
          <TabsTrigger value="warnings">
            Warnings ({warningRules.length})
          </TabsTrigger>
          <TabsTrigger value="failed">
            Failed ({failedRules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <RulesList rules={mockRuleEvaluations} getStatusColor={getStatusColor} getStatusBg={getStatusBg} getStatusIcon={getStatusIcon} getPriorityColor={getPriorityColor} />
        </TabsContent>

        <TabsContent value="passed" className="space-y-4 mt-6">
          {passedRules.length > 0 ? (
            <RulesList rules={passedRules} getStatusColor={getStatusColor} getStatusBg={getStatusBg} getStatusIcon={getStatusIcon} getPriorityColor={getPriorityColor} />
          ) : (
            <div className="text-center py-12">
              <p style={{ color: 'hsl(var(--color-muted-foreground))' }}>No rules passed</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="warnings" className="space-y-4 mt-6">
          {warningRules.length > 0 ? (
            <RulesList rules={warningRules} getStatusColor={getStatusColor} getStatusBg={getStatusBg} getStatusIcon={getStatusIcon} getPriorityColor={getPriorityColor} />
          ) : (
            <div className="text-center py-12">
              <p style={{ color: 'hsl(var(--color-muted-foreground))' }}>No warnings</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="failed" className="space-y-4 mt-6">
          {failedRules.length > 0 ? (
            <RulesList rules={failedRules} getStatusColor={getStatusColor} getStatusBg={getStatusBg} getStatusIcon={getStatusIcon} getPriorityColor={getPriorityColor} />
          ) : (
            <div className="text-center py-12">
              <p style={{ color: 'hsl(var(--color-muted-foreground))' }}>No rules failed</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Rules List Component
const RulesList = ({ rules, getStatusColor, getStatusBg, getStatusIcon, getPriorityColor }) => {
  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <Card key={rule.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Rule Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="flex items-center justify-center p-2 rounded-lg"
                      style={{ 
                        backgroundColor: getStatusBg(rule.status),
                        color: getStatusColor(rule.status)
                      }}
                    >
                      {getStatusIcon(rule.status)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{rule.ruleName}</h4>
                      <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        Rule ID: {rule.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {rule.category}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        borderColor: getPriorityColor(rule.priority),
                        color: getPriorityColor(rule.priority)
                      }}
                    >
                      {rule.priority.toUpperCase()} Priority
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Impact: {rule.impact}
                    </Badge>
                  </div>
                </div>
                
                {/* Confidence Score */}
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold mb-1"
                    style={{
                      backgroundColor: rule.confidence >= 90 ? 'rgba(34, 197, 94, 0.2)' : 
                                      rule.confidence >= 70 ? 'rgba(251, 191, 36, 0.2)' : 
                                      'rgba(239, 68, 68, 0.2)',
                      color: rule.confidence >= 90 ? 'rgb(34, 197, 94)' : 
                            rule.confidence >= 70 ? 'rgb(251, 191, 36)' : 
                            'rgb(239, 68, 68)'
                    }}
                  >
                    {rule.confidence}%
                  </div>
                  <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                    Confidence
                  </p>
                </div>
              </div>

              {/* Rule Description */}
              <div 
                className="p-3 rounded-lg" 
                style={{ backgroundColor: 'hsl(var(--color-muted))' }}
              >
                <p className="text-sm font-medium mb-1">Rule Description:</p>
                <p className="text-sm">{rule.description}</p>
              </div>

              {/* Evaluation Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div 
                  className="p-3 rounded-lg border"
                  style={{ borderColor: 'hsl(var(--color-border))' }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                    Operator
                  </p>
                  <p className="text-sm font-mono font-bold">{rule.operator}</p>
                </div>
                <div 
                  className="p-3 rounded-lg border"
                  style={{ borderColor: 'hsl(var(--color-border))' }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                    Expected Value
                  </p>
                  <p className="text-sm font-semibold">{rule.expectedValue}</p>
                </div>
                <div 
                  className="p-3 rounded-lg border"
                  style={{ 
                    borderColor: getStatusColor(rule.status),
                    backgroundColor: getStatusBg(rule.status)
                  }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                    Actual Value
                  </p>
                  <p className="text-sm font-bold" style={{ color: getStatusColor(rule.status) }}>
                    {rule.actualValue}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div 
                className="p-3 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: getStatusBg(rule.status),
                  borderColor: getStatusColor(rule.status)
                }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: getStatusColor(rule.status) }}>
                  {rule.status === "passed" ? "✓ Pass Reason" : rule.status === "failed" ? "✗ Failure Reason" : "⚠ Warning Reason"}
                </p>
                <p className="text-sm">{rule.reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [uploadedDocs, setUploadedDocs] = React.useState([])
  const [selectedFile, setSelectedFile] = React.useState(null)
  const [policyType, setPolicyType] = React.useState("insurance")
  const [bankId, setBankId] = React.useState("")
  const [extractionPrompt, setExtractionPrompt] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)
  const [processingResults, setProcessingResults] = React.useState(null)
  const [uploadError, setUploadError] = React.useState(null)
  const fileInputRef = React.useRef(null)

  const [extractedRules, setExtractedRules] = React.useState([])

  // Quick Test state
  const [testPolicyType, setTestPolicyType] = React.useState("loan")
  const [testBankId, setTestBankId] = React.useState("chase")
  const [testFormData, setTestFormData] = React.useState({
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
  const [isTesting, setIsTesting] = React.useState(false)
  const [testResult, setTestResult] = React.useState(null)
  const [testError, setTestError] = React.useState(null)
  const [isResultsModalOpen, setIsResultsModalOpen] = React.useState(false)

  // View Policies state
  const [banks, setBanks] = React.useState([])
  const [selectedBank, setSelectedBank] = React.useState("")
  const [bankPolicies, setBankPolicies] = React.useState([])
  const [selectedPolicy, setSelectedPolicy] = React.useState("")
  const [policyDetails, setPolicyDetails] = React.useState(null)
  const [isLoadingBanks, setIsLoadingBanks] = React.useState(false)
  const [isLoadingPolicies, setIsLoadingPolicies] = React.useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false)
  const [viewPoliciesError, setViewPoliciesError] = React.useState(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setUploadError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    if (!bankId.trim()) {
      setUploadError("Bank ID is required");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setProcessingResults(null);

    try {
      // Step 1: Upload document to S3 and get the S3 URL
      const uploadResult = await uploadDocumentToS3(selectedFile);
      const s3Url = uploadResult.s3_url;

      // Step 2: Process the policy document from S3
      const result = await processPolicyFromS3({
        s3_url: s3Url,
        policy_type: policyType,
        bank_id: bankId,
      });

      console.log('Processing result:', result);
      console.log('Processing status:', result.status);
      setProcessingResults(result);

      // Add to uploaded docs list
      const newDoc = {
        id: uploadedDocs.length + 1,
        name: selectedFile.name,
        uploadedDate: new Date().toISOString().split('T')[0],
        status: result.status || "processing",
        rulesCount: 0,
        containerId: result.container_id,
        s3Url: result.s3_url,
        jarUrl: result.jar_s3_url,
        drlUrl: result.drl_s3_url,
        excelUrl: result.excel_s3_url,
      };

      setUploadedDocs([newDoc, ...uploadedDocs]);

      // Save these values before resetting form
      const currentBankId = bankId;
      const currentPolicyType = policyType;

      // Fetch extracted rules after successful processing
      console.log('Checking if should fetch rules. Status:', result.status);
      if (result.status === "success" || result.status === "processed" || result.status === "completed") {
        console.log('Status matches! Fetching rules...');
        await fetchExtractedRules(currentBankId, currentPolicyType);
      } else {
        console.log('Status does not match success or processed or completed');
      }

      // Reset form
      setSelectedFile(null);
      setBankId("");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Poll for status updates if still in progress
      if (result.status === "in_progress") {
        pollProcessingStatus(result.container_id, newDoc.id, currentBankId, currentPolicyType);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Failed to process document");
    } finally {
      setIsUploading(false);
    }
  };

  const fetchExtractedRules = async (bank_id, policy_type) => {
    console.log('Fetching extracted rules for:', { bank_id, policy_type });
    try {
      const rulesData = await getExtractedRules(bank_id, policy_type);
      console.log('Extracted rules response:', rulesData);
      if (rulesData.rules && Array.isArray(rulesData.rules)) {
        // Transform the API response to match the component's expected format
        const transformedRules = rulesData.rules.map((rule, index) => ({
          id: `${bank_id}_${policy_type}_${index}`,
          rule: `${rule.field} ${rule.operator} ${rule.value}`,
          requirement: rule.description || `${rule.field} must be ${rule.operator} ${rule.value}`,
          category: rule.category || "General",
          source: rule.source_document || "Unknown",
          isActive: rule.is_active !== false,
          timestamp: rule.timestamp
        }));
        console.log('Transformed rules:', transformedRules);
        setExtractedRules(transformedRules);
      } else {
        console.log('No rules found in response');
      }
    } catch (error) {
      console.error("Failed to fetch extracted rules:", error);
      // Don't show error to user, just log it
    }
  };

  const pollProcessingStatus = async (containerId, docId, bankId, policyType) => {
    try {
      const result = await getProcessingStatus(containerId);
      
      // Update document status
      setUploadedDocs(prevDocs =>
        prevDocs.map(doc =>
          doc.id === docId
            ? { ...doc, status: result.status, jarUrl: result.jar_s3_url, drlUrl: result.drl_s3_url, excelUrl: result.excel_s3_url }
            : doc
        )
      );

      // Continue polling if still in progress
      if (result.status === "in_progress") {
        setTimeout(() => pollProcessingStatus(containerId, docId, bankId, policyType), 3000);
      } else if (result.status === "success" || result.status === "processed" || result.status === "completed") {
        // Fetch extracted rules when processing completes
        await fetchExtractedRules(bankId, policyType);
      }
    } catch (error) {
      console.error("Status polling error:", error);
    }
  };

  const handleDeleteDoc = (id) => {
    setUploadedDocs(uploadedDocs.filter(doc => doc.id !== id))
  }

  const handleDownload = async (url, fileName) => {
    try {
      await downloadFromS3(url, fileName);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file");
    }
  }

  const handleQuickTest = async () => {
    setIsTesting(true);
    setTestError(null);
    setTestResult(null);

    try {
      // Build request body based on policy type
      const requestBody = {
        bank_id: testBankId,
        policy_type: testPolicyType,
        applicant: {
          age: parseInt(testFormData.age),
          annualIncome: parseFloat(testFormData.annualIncome),
          creditScore: parseInt(testFormData.creditScore)
        },
        policy: {}
      };

      if (testPolicyType === "loan") {
        requestBody.policy = {
          loanAmount: parseFloat(testFormData.loanAmount),
          personalGuarantee: testFormData.personalGuarantee
        };
      } else {
        // Insurance
        requestBody.applicant = {
          ...requestBody.applicant,
          healthConditions: testFormData.healthConditions,
          smoker: testFormData.smoker
        };
        requestBody.policy = {
          coverageAmount: parseFloat(testFormData.coverageAmount),
          term: parseInt(testFormData.term),
          type: testFormData.insuranceType
        };
      }

      const result = await evaluatePolicy(requestBody);
      console.log('Quick Test API Response:', result);
      setTestResult(result);
      setTestError(null);
    } catch (error) {
      console.error("Quick test error:", error);
      setTestError(error.message || "Failed to evaluate policy. Please try again.");
    } finally {
      setIsTesting(false);
    }
  };

  const fillQuickTestSampleData = () => {
    if (testPolicyType === "loan") {
      setTestFormData({
        ...testFormData,
        age: "35",
        annualIncome: "85000",
        creditScore: "720",
        loanAmount: "150000",
        personalGuarantee: false
      });
    } else {
      setTestFormData({
        ...testFormData,
        age: "35",
        annualIncome: "75000",
        creditScore: "720",
        coverageAmount: "500000",
        term: "20",
        insuranceType: "term_life",
        healthConditions: "good",
        smoker: false
      });
    }
  };

  const canRunQuickTest = testBankId && testFormData.age && testFormData.annualIncome && testFormData.creditScore && 
    (testPolicyType === "loan" ? testFormData.loanAmount : (testFormData.coverageAmount && testFormData.term));

  // Load all banks on component mount
  React.useEffect(() => {
    loadAllBanks();
  }, []);

  const loadAllBanks = async () => {
    setIsLoadingBanks(true);
    setViewPoliciesError(null);
    try {
      const result = await getAllBanks();
      console.log('All Banks Response:', result);
      if (result.banks && Array.isArray(result.banks)) {
        setBanks(result.banks);
      }
    } catch (error) {
      console.error('Failed to load banks:', error);
      setViewPoliciesError(error.message);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const handleBankChange = async (bank_id) => {
    setSelectedBank(bank_id);
    setSelectedPolicy("");
    setPolicyDetails(null);
    setBankPolicies([]);
    
    if (!bank_id) return;

    setIsLoadingPolicies(true);
    setViewPoliciesError(null);
    try {
      const result = await getBankPolicies(bank_id);
      console.log('Bank Policies Response:', result);
      if (result.policies && Array.isArray(result.policies)) {
        setBankPolicies(result.policies);
      }
    } catch (error) {
      console.error('Failed to load policies:', error);
      setViewPoliciesError(error.message);
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  const handlePolicyChange = async (policy_type) => {
    setSelectedPolicy(policy_type);
    setPolicyDetails(null);
    
    if (!policy_type || !selectedBank) return;

    setIsLoadingDetails(true);
    setViewPoliciesError(null);
    try {
      const result = await getPolicyDetails(selectedBank, policy_type);
      console.log('Policy Details Response:', result);
      setPolicyDetails(result);
    } catch (error) {
      console.error('Failed to load policy details:', error);
      setViewPoliciesError(error.message);
    } finally {
      setIsLoadingDetails(false);
    }
  };

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
                }}>Admin Dashboard</h1>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Manage policy documents and extraction rules
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
              Administrator
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="manage">Manage Documents</TabsTrigger>
            <TabsTrigger value="view">View Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-6">
            {/* Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              }}>Upload Policy Document</CardTitle>
              <CardDescription className="font-medium">Upload documents to extract compliance rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Document</Label>
                <Input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy-type">Policy Type</Label>
                  <Select value={policyType} onValueChange={setPolicyType}>
                    <SelectTrigger id="policy-type">
                      <SelectValue placeholder="Select policy type" />
                    </SelectTrigger>
                    <SelectContent sideOffset={5} position="popper">
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="mortgage">Mortgage</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="underwriting">Underwriting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bank-id">Vendor ID <span className="text-red-500">*</span></Label>
                  <Input
                    id="bank-id"
                    type="text"
                    placeholder="e.g., chase, wells_fargo"
                    value={bankId}
                    onChange={(e) => setBankId(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prompt">Extraction Prompt (Optional)</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what rules to extract from the document..."
                  value={extractionPrompt}
                  onChange={(e) => setExtractionPrompt(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {uploadError && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-600">{uploadError}</p>
                </div>
              )}

              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || isUploading}
                className="w-full h-11 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)'
                }}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Process
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Test Card */}
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
                  }}>Quick Test</CardTitle>
                  <CardDescription className="font-medium">Test extracted rules with sample data</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fillQuickTestSampleData}
                  className="shadow-md hover:shadow-lg transition-all duration-300"
                  style={{
                    borderColor: 'hsl(var(--color-primary))',
                    color: 'hsl(var(--color-primary))'
                  }}
                >
                  Fill Sample
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-policy-type">Policy Type</Label>
                <Select value={testPolicyType} onValueChange={(value) => {
                  setTestPolicyType(value);
                  setTestResult(null);
                  setTestError(null);
                }}>
                  <SelectTrigger id="test-policy-type">
                    <SelectValue placeholder="Select policy type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-bank-id">Vendor ID</Label>
                <Input
                  id="test-bank-id"
                  type="text"
                  placeholder="e.g., chase"
                  value={testBankId}
                  onChange={(e) => setTestBankId(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="test-age">Age</Label>
                  <Input
                    id="test-age"
                    type="number"
                    placeholder="35"
                    value={testFormData.age}
                    onChange={(e) => setTestFormData({ ...testFormData, age: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-credit">Credit Score</Label>
                  <Input
                    id="test-credit"
                    type="number"
                    placeholder="720"
                    value={testFormData.creditScore}
                    onChange={(e) => setTestFormData({ ...testFormData, creditScore: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-income">Annual Income ($)</Label>
                <Input
                  id="test-income"
                  type="number"
                  placeholder="85000"
                  value={testFormData.annualIncome}
                  onChange={(e) => setTestFormData({ ...testFormData, annualIncome: e.target.value })}
                />
              </div>

              {testPolicyType === "loan" ? (
                <div className="space-y-2">
                  <Label htmlFor="test-loan-amount">Loan Amount ($)</Label>
                  <Input
                    id="test-loan-amount"
                    type="number"
                    placeholder="150000"
                    value={testFormData.loanAmount}
                    onChange={(e) => setTestFormData({ ...testFormData, loanAmount: e.target.value })}
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="test-personal-guarantee"
                      checked={testFormData.personalGuarantee}
                      onChange={(e) => setTestFormData({ ...testFormData, personalGuarantee: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="test-personal-guarantee" className="cursor-pointer text-sm">
                      Personal Guarantee
                    </Label>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="test-coverage">Coverage ($)</Label>
                      <Input
                        id="test-coverage"
                        type="number"
                        placeholder="500000"
                        value={testFormData.coverageAmount}
                        onChange={(e) => setTestFormData({ ...testFormData, coverageAmount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-term">Term (years)</Label>
                      <Input
                        id="test-term"
                        type="number"
                        placeholder="20"
                        value={testFormData.term}
                        onChange={(e) => setTestFormData({ ...testFormData, term: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="test-smoker"
                      checked={testFormData.smoker}
                      onChange={(e) => setTestFormData({ ...testFormData, smoker: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="test-smoker" className="cursor-pointer text-sm">
                      Smoker
                    </Label>
                  </div>
                </>
              )}

              {testError && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-600">{testError}</p>
                </div>
              )}

              <Button 
                onClick={handleQuickTest} 
                disabled={!canRunQuickTest || isTesting}
                className="w-full h-11 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(20, 96%, 50%) 100%)'
                }}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Run Quick Test
                  </>
                )}
              </Button>

              {testResult && (
                <div className="mt-4 p-4 rounded-lg border" style={{ 
                  backgroundColor: 'hsl(var(--color-card))',
                  borderColor: 'hsl(var(--color-border))'
                }}>
                  <div className="flex items-center justify-center mb-3">
                    {testResult.decision?.approved ? (
                      <CheckCircle className="w-8 h-8" style={{ color: 'hsl(var(--color-success))' }} />
                    ) : (
                      <XCircle className="w-8 h-8" style={{ color: 'hsl(var(--color-destructive))' }} />
                    )}
                  </div>
                  <div className="text-center mb-2">
                    <p className="font-bold text-lg">
                      {testResult.decision?.approved ? "Approved" : "Rejected"}
                    </p>
                    {testResult.decision?.premium_rate && (
                      <p className="text-sm mt-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        Premium Rate: {(testResult.decision.premium_rate * 100).toFixed(2)}%
                      </p>
                    )}
                    <p className="text-xs mt-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                      Executed in {testResult.execution_time_ms}ms
                    </p>
                  </div>
                  {testResult.decision?.reasons && testResult.decision.reasons.length > 0 && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'hsl(var(--color-border))' }}>
                      <p className="text-xs font-semibold mb-1">Reasons:</p>
                      <ul className="text-xs space-y-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        {testResult.decision.reasons.map((reason, idx) => (
                          <li key={idx}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Dialog open={isResultsModalOpen} onOpenChange={setIsResultsModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full mt-3">
                        View Full Results
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Comprehensive Evaluation Results</DialogTitle>
                        <DialogDescription>
                          Detailed rule-by-rule analysis of the policy evaluation
                        </DialogDescription>
                      </DialogHeader>
                      <QuickTestResultsView result={testResult} policyType={testPolicyType} bankId={testBankId} />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Document Library */}
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
                }}>Document Library</CardTitle>
                <CardDescription className="font-medium">All uploaded policy documents</CardDescription>
              </div>
              <Badge 
                variant="secondary"
                className="shadow-md"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--color-secondary)) 0%, hsl(42, 96%, 50%) 100%)'
                }}
              >
                {uploadedDocs.length} Documents
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {uploadedDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="w-12 h-12 mb-4" style={{ color: 'hsl(var(--color-muted-foreground))' }} />
                <p className="text-lg font-medium mb-2">No documents uploaded</p>
                <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Upload your first policy document to get started
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Container ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadedDocs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" style={{ color: 'hsl(var(--color-primary))' }} />
                          {doc.name}
                        </div>
                      </TableCell>
                      <TableCell>{doc.uploadedDate}</TableCell>
                      <TableCell>
                        {doc.status === 'in_progress' ? (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {doc.status}
                          </Badge>
                        ) : doc.status === 'success' || doc.status === 'processed' || doc.status === 'completed' ? (
                          <Badge variant="default" className="flex items-center gap-1 w-fit bg-green-600">
                            <CheckCircle className="w-3 h-3" />
                            {doc.status}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{doc.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-mono" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        {doc.containerId || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {doc.jarUrl && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownload(doc.jarUrl, `${doc.name.split('.')[0]}.jar`)}
                              title="Download JAR"
                            >
                              <Download className="w-4 h-4" />
                              <span className="ml-1 text-xs">JAR</span>
                            </Button>
                          )}
                          {doc.drlUrl && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownload(doc.drlUrl, `${doc.name.split('.')[0]}.drl`)}
                              title="Download DRL"
                            >
                              <Download className="w-4 h-4" />
                              <span className="ml-1 text-xs">DRL</span>
                            </Button>
                          )}
                          {doc.excelUrl && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownload(doc.excelUrl, `${doc.name.split('.')[0]}.xlsx`)}
                              title="Download Excel"
                            >
                              <Download className="w-4 h-4" />
                              <span className="ml-1 text-xs">Excel</span>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteDoc(doc.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Processing Results */}
        {processingResults && (
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
              }}>Processing Results</CardTitle>
              <CardDescription className="font-medium">Detailed extraction and deployment status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">S3 URL</p>
                  <p className="text-sm text-blue-600 truncate">{processingResults.s3_url}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Container ID</p>
                  <p className="text-sm font-mono">{processingResults.container_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Policy Type</p>
                  <p className="text-sm">{processingResults.policy_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Vendor ID</p>
                  <p className="text-sm">{processingResults.bank_id}</p>
                </div>
              </div>

              {processingResults.steps && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">Processing Steps</h4>
                  
                  {processingResults.steps.text_extraction && (
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))', borderWidth: '1px' }}>
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: 'hsl(var(--color-foreground))' }}>Text Extraction</p>
                        <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          Status: {processingResults.steps.text_extraction.status} | 
                          Length: {processingResults.steps.text_extraction.length}
                        </p>
                      </div>
                      <Badge variant={processingResults.steps.text_extraction.status === 'success' ? 'success' : 'secondary'} className={processingResults.steps.text_extraction.status === 'success' ? 'bg-green-600 text-white' : ''}>
                        {processingResults.steps.text_extraction.status}
                      </Badge>
                    </div>
                  )}

                  {processingResults.steps.query_generation && (
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))', borderWidth: '1px' }}>
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: 'hsl(var(--color-foreground))' }}>Query Generation</p>
                        <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          Method: {processingResults.steps.query_generation.method} | 
                          Count: {processingResults.steps.query_generation.count}
                        </p>
                      </div>
                      <Badge variant={processingResults.steps.query_generation.status === 'success' ? 'success' : 'secondary'} className={processingResults.steps.query_generation.status === 'success' ? 'bg-green-600 text-white' : ''}>
                        {processingResults.steps.query_generation.status}
                      </Badge>
                    </div>
                  )}

                  {processingResults.steps.data_extraction && (
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))', borderWidth: '1px' }}>
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: 'hsl(var(--color-foreground))' }}>Data Extraction</p>
                        <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          Method: {processingResults.steps.data_extraction.method}
                        </p>
                      </div>
                      <Badge variant={processingResults.steps.data_extraction.status === 'success' ? 'success' : 'secondary'} className={processingResults.steps.data_extraction.status === 'success' ? 'bg-green-600 text-white' : ''}>
                        {processingResults.steps.data_extraction.status}
                      </Badge>
                    </div>
                  )}

                  {processingResults.steps.rule_generation && (
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))', borderWidth: '1px' }}>
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: 'hsl(var(--color-foreground))' }}>Rule Generation</p>
                        <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          DRL Length: {processingResults.steps.rule_generation.drl_length} | 
                          Decision Table: {processingResults.steps.rule_generation.has_decision_table ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <Badge variant={processingResults.steps.rule_generation.status === 'success' ? 'success' : 'secondary'} className={processingResults.steps.rule_generation.status === 'success' ? 'bg-green-600 text-white' : ''}>
                        {processingResults.steps.rule_generation.status}
                      </Badge>
                    </div>
                  )}

                  {processingResults.steps.deployment && (
                    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))', borderWidth: '1px' }}>
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: 'hsl(var(--color-foreground))' }}>Deployment</p>
                        <p className="text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          {processingResults.steps.deployment.message}
                        </p>
                        {processingResults.steps.deployment.release_id && (
                          <p className="text-xs mt-1 font-mono" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                            {processingResults.steps.deployment.release_id['group-id']}:
                            {processingResults.steps.deployment.release_id['artifact-id']}:
                            {processingResults.steps.deployment.release_id.version}
                          </p>
                        )}
                      </div>
                      <Badge variant={processingResults.steps.deployment.status === 'success' ? 'success' : 'secondary'} className={processingResults.steps.deployment.status === 'success' ? 'bg-green-600 text-white' : ''}>
                        {processingResults.steps.deployment.status}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {(processingResults.jar_s3_url || processingResults.drl_s3_url || processingResults.excel_s3_url) && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Download Generated Files</h4>
                  <div className="flex gap-2">
                    {processingResults.jar_s3_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(processingResults.jar_s3_url, 'rules.jar')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        JAR File
                      </Button>
                    )}
                    {processingResults.drl_s3_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(processingResults.drl_s3_url, 'rules.drl')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        DRL File
                      </Button>
                    )}
                    {processingResults.excel_s3_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(processingResults.excel_s3_url, 'rules.xlsx')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Excel File
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Extracted Rules */}
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
                }}>Extracted Rules</CardTitle>
                <CardDescription className="font-medium">All compliance rules from uploaded documents</CardDescription>
              </div>
              <Badge variant="secondary">{extractedRules.length} Rules</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {extractedRules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileQuestion className="w-12 h-12 mb-4" style={{ color: 'hsl(var(--color-muted-foreground))' }} />
                <p className="text-lg font-medium mb-2">No rules extracted yet</p>
                <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                  Rules will appear here after processing policy documents
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Source Document</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractedRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.rule}</TableCell>
                      <TableCell>{rule.requirement}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                        {rule.source}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="view" className="space-y-6">
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
                }}>View Deployed Policies</CardTitle>
                <CardDescription className="font-medium">Browse policies by bank and view details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="view-bank">Select Vendor</Label>
                    <Select value={selectedBank} onValueChange={handleBankChange} disabled={isLoadingBanks}>
                      <SelectTrigger id="view-bank">
                        <SelectValue placeholder={isLoadingBanks ? "Loading vendors..." : "Choose a vendor"} />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.map((bank) => (
                          <SelectItem key={bank.bank_id} value={bank.bank_id}>
                            {bank.bank_name || bank.bank_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="view-policy">Select Policy Type</Label>
                    <Select 
                      value={selectedPolicy} 
                      onValueChange={handlePolicyChange} 
                      disabled={!selectedBank || isLoadingPolicies || bankPolicies.length === 0}
                    >
                      <SelectTrigger id="view-policy">
                        <SelectValue placeholder={
                          !selectedBank ? "Select a bank first" :
                          isLoadingPolicies ? "Loading policies..." :
                          bankPolicies.length === 0 ? "No policies available" :
                          "Choose a policy type"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {bankPolicies.map((policy) => (
                          <SelectItem key={policy.policy_type_id || policy.policy_type} value={policy.policy_type_id || policy.policy_type}>
                            {policy.policy_name || policy.policy_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {viewPoliciesError && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{viewPoliciesError}</p>
                  </div>
                )}

                {isLoadingDetails && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'hsl(var(--color-primary))' }} />
                  </div>
                )}

                {policyDetails && !isLoadingDetails && (
                  <div className="mt-6 space-y-6">
                    {/* Container Details */}
                    {policyDetails.container && (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <Server className="w-5 h-5" style={{ color: 'hsl(var(--color-primary))' }} />
                            <CardTitle>Container Details</CardTitle>
                          </div>
                          <CardDescription>
                            Deployment information for {selectedBank} - {bankPolicies.find(p => (p.policy_type_id || p.policy_type) === selectedPolicy)?.policy_name || selectedPolicy}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Container ID</p>
                              <p className="text-sm font-mono">{policyDetails.container.container_id}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-semibold" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Status</p>
                              <Badge variant={policyDetails.container.status === 'running' ? 'default' : 'secondary'} className={policyDetails.container.status === 'running' ? 'bg-green-600' : ''}>
                                {policyDetails.container.status}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-semibold" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Health Status</p>
                              <Badge variant={policyDetails.container.health_status === 'healthy' ? 'default' : 'secondary'} className={policyDetails.container.health_status === 'healthy' ? 'bg-green-600' : ''}>
                                {policyDetails.container.health_status}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-semibold" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Deployed At</p>
                              <p className="text-sm flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(policyDetails.container.deployed_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <p className="text-xs font-semibold" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Endpoint</p>
                              <a 
                                href={policyDetails.container.endpoint} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                              >
                                {policyDetails.container.endpoint}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Extracted Rules */}
                    {policyDetails.extracted_rules && policyDetails.extracted_rules.length > 0 && (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield className="w-5 h-5" style={{ color: 'hsl(var(--color-primary))' }} />
                              <CardTitle>Extracted Rules</CardTitle>
                            </div>
                            <Badge variant="secondary">{policyDetails.extracted_rules_count || policyDetails.extracted_rules.length} Rules</Badge>
                          </div>
                          <CardDescription>
                            Underwriting rules extracted from policy documents
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {policyDetails.extracted_rules.map((rule, index) => (
                              <div 
                                key={rule.id || index}
                                className="p-4 rounded-lg border"
                                style={{
                                  backgroundColor: 'hsl(var(--color-card))',
                                  borderColor: 'hsl(var(--color-border))'
                                }}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-semibold">{rule.rule_name || `Rule ${index + 1}`}</p>
                                      {rule.is_active !== false && (
                                        <Badge variant="default" className="bg-green-600 text-xs">Active</Badge>
                                      )}
                                    </div>
                                    {rule.category && (
                                      <Badge variant="outline" className="text-xs mb-2">{rule.category}</Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm mb-3" style={{ color: 'hsl(var(--color-foreground))' }}>
                                  {rule.requirement}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                                  {rule.source_document && (
                                    <div className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      <span className="truncate">{rule.source_document.split('/').pop()}</span>
                                    </div>
                                  )}
                                  {rule.created_at && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{new Date(rule.created_at).toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Extraction Queries - Accordion Style */}
                    {policyDetails.extraction_queries && policyDetails.extraction_queries.length > 0 && (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <Database className="w-5 h-5" style={{ color: 'hsl(var(--color-primary))' }} />
                            <CardTitle>Extraction Queries</CardTitle>
                          </div>
                          <CardDescription>
                            LLM-generated queries with Textract responses and confidence scores
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Accordion type="single" collapsible className="w-full">
                            {policyDetails.extraction_queries.map((query, index) => (
                              <AccordionItem key={query.id || index} value={`query-${query.id || index}`}>
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold" style={{
                                      backgroundColor: query.confidence_score >= 90 ? 'rgba(34, 197, 94, 0.2)' : query.confidence_score >= 70 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                      color: query.confidence_score >= 90 ? 'rgb(34, 197, 94)' : query.confidence_score >= 70 ? 'rgb(251, 191, 36)' : 'rgb(239, 68, 68)'
                                    }}>
                                      {query.confidence_score}%
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium">{query.query_text}</p>
                                      <p className="text-xs mt-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                                        Query #{query.query_order || index + 1} • {query.extraction_method || 'textract'}
                                      </p>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="pt-2 space-y-3">
                                    <div className="p-3 rounded-lg" style={{
                                      backgroundColor: 'hsl(var(--color-muted))'
                                    }}>
                                      <p className="text-xs font-semibold mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Response</p>
                                      <p className="text-sm">{query.response_text || 'No response'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                      <div>
                                        <p className="font-semibold mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Confidence Score</p>
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{
                                            backgroundColor: 'hsl(var(--color-muted))'
                                          }}>
                                            <div 
                                              className="h-full rounded-full transition-all"
                                              style={{
                                                width: `${query.confidence_score}%`,
                                                backgroundColor: query.confidence_score >= 90 ? 'rgb(34, 197, 94)' : query.confidence_score >= 70 ? 'rgb(251, 191, 36)' : 'rgb(239, 68, 68)'
                                              }}
                                            />
                                          </div>
                                          <span className="font-medium">{query.confidence_score}%</span>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="font-semibold mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Extraction Method</p>
                                        <Badge variant="outline" className="text-xs">{query.extraction_method || 'textract'}</Badge>
                                      </div>
                                      {query.source_document && (
                                        <div className="col-span-2">
                                          <p className="font-semibold mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Source Document</p>
                                          <p className="text-xs truncate flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            {query.source_document.split('/').pop()}
                                          </p>
                                        </div>
                                      )}
                                      {query.created_at && (
                                        <div className="col-span-2">
                                          <p className="font-semibold mb-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>Created At</p>
                                          <p className="text-xs flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(query.created_at).toLocaleString()}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {!policyDetails && !isLoadingDetails && selectedBank && selectedPolicy && !viewPoliciesError && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileQuestion className="w-12 h-12 mb-4" style={{ color: 'hsl(var(--color-muted-foreground))' }} />
                    <p className="text-lg font-medium mb-2">No policy details available</p>
                    <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                      Select a bank and policy type to view details
                    </p>
                  </div>
                )}

                {!selectedBank && !isLoadingBanks && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Inbox className="w-12 h-12 mb-4" style={{ color: 'hsl(var(--color-muted-foreground))' }} />
                    <p className="text-lg font-medium mb-2">No bank selected</p>
                    <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                      Select a bank to view available policies
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default AdminDashboard

