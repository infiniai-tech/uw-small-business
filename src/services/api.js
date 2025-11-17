/**
 * API service for document processing and rule extraction
 * 
 * Configuration:
 * Set the VITE_API_BASE_URL environment variable in your .env file:
 * VITE_API_BASE_URL=https://your-api-domain.com
 * 
 * For local development:
 * VITE_API_BASE_URL=http://localhost:9000
 * 
 * API Endpoint: POST /process_policy_from_s3
 * 
 * Request Body:
 * {
 *   "s3_url": "https://bucket.s3.us-east-1.amazonaws.com/policies/document.pdf",
 *   "policy_type": "insurance",
 *   "bank_id": "chase"
 * }
 * 
 * Response includes processing status, container ID, and generated file URLs (JAR, DRL, Excel)
 */

// Use the API base URL from environment variable or default to localhost:9000/rule-agent
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/rule-agent';

/**
 * Helper function to construct API URLs properly
 * Handles trailing slashes in base URL
 */
const buildApiUrl = (endpoint) => {
  const base = API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash if present
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

/**
 * Upload document to S3 and get the S3 URL
 * @param {File} file - The file to upload
 * @param {string} folder - Optional S3 folder name (defaults to "uploads")
 * @returns {Promise<Object>} - Upload response with S3 URL and metadata
 * 
 * Response includes:
 * - s3_url: Direct S3 URL for accessing the file
 * - s3_key: S3 key path
 * - filename: Sanitized filename with timestamp
 * - original_filename: Original file name
 * - folder: Folder where file was stored
 * - file_size: Size of the uploaded file
 * - content_type: MIME type of the file
 */
export const uploadDocumentToS3 = async (file, folder = 'uploads') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch(buildApiUrl('/upload_file'), {
    method: 'POST',
    body: formData,
    // Note: Don't set Content-Type header - browser will set it automatically with boundary
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data; // Returns the data object with s3_url, s3_key, etc.
};

/**
 * Process policy document from S3 URL through the underwriting workflow
 * @param {Object} params
 * @param {string} params.s3_url - S3 URL of the policy document
 * @param {string} params.policy_type - Type of policy (e.g., "insurance", "loan")
 * @param {string} params.bank_id - Bank identifier
 * @returns {Promise<Object>} - Processing result with extracted rules
 */
export const processPolicyFromS3 = async ({ s3_url, policy_type, bank_id }) => {
  const url = buildApiUrl('/process_policy_from_s3');
  console.log('Processing policy from S3 - URL:', url);
  console.log('Request params:', { s3_url, policy_type, bank_id });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        s3_url,
        policy_type,
        bank_id,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Policy processing failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }

    return response.json();
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Unable to connect to the API server. Please ensure the backend is running.`);
    }
    throw error;
  }
};

/**
 * Poll for processing status updates
 * @param {string} containerId - Container ID from the initial response
 * @returns {Promise<Object>} - Updated processing status
 */
export const getProcessingStatus = async (containerId) => {
  const response = await fetch(buildApiUrl(`/status/${containerId}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Download processed file from S3
 * @param {string} s3Url - S3 URL of the file
 * @param {string} fileName - Desired file name
 */
export const downloadFromS3 = async (s3Url, fileName) => {
  const response = await fetch(s3Url);
  const blob = await response.blob();
  
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Evaluate policy application using deployed rules
 * @param {Object} applicationData - Application data matching API schema
 * @returns {Promise<Object>} - Decision result with status, reasons, premium_rate, etc.
 * 
 * Request Body Examples:
 * 
 * Loan Application:
 * {
 *   "bank_id": "chase",
 *   "policy_type": "loan",
 *   "applicant": {
 *     "age": 35,
 *     "annualIncome": 85000,
 *     "creditScore": 720
 *   },
 *   "policy": {
 *     "loanAmount": 150000,
 *     "personalGuarantee": false
 *   }
 * }
 * 
 * Insurance Application:
 * {
 *   "bank_id": "chase",
 *   "policy_type": "insurance",
 *   "applicant": {
 *     "age": 35,
 *     "annualIncome": 75000,
 *     "creditScore": 720,
 *     "healthConditions": "good",
 *     "smoker": false
 *   },
 *   "policy": {
 *     "coverageAmount": 500000,
 *     "term": 20,
 *     "type": "term_life"
 *   }
 * }
 * 
 * Response:
 * {
 *   "status": "success",
 *   "bank_id": "string",
 *   "policy_type": "string",
 *   "container_id": "string",
 *   "decision": {
 *     "approved": true,
 *     "reasons": ["Good credit score", "Stable income"],
 *     "premium_rate": 0.85
 *   },
 *   "execution_time_ms": 45
 * }
 */
export const evaluatePolicy = async (applicationData) => {
  const url = buildApiUrl('/api/v1/evaluate-policy');
  console.log('API Request URL:', url);
  console.log('API Request Method: POST');
  console.log('API Request Body:', applicationData);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(applicationData),
  });

  if (!response.ok) {
    let errorMessage = `Policy evaluation failed: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      // Try to extract meaningful error messages from various possible response formats
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.map(e => e.message || e).join(', ');
      }
    } catch (parseError) {
      // If JSON parsing fails, use the default error message
      console.error('Failed to parse error response:', parseError);
    }
    
    const error = new Error(errorMessage);
    error.status = response.status;
    error.statusText = response.statusText;
    throw error;
  }

  return response.json();
};

/**
 * Get extracted rules for a specific bank and policy type
 * @param {string} bank_id - Bank identifier
 * @param {string} policy_type - Policy type identifier
 * @returns {Promise<Object>} - Extracted rules response
 * 
 * Response format:
 * {
 *   "status": "success",
 *   "bank_id": "chase",
 *   "policy_type": "insurance",
 *   "rules": [
 *     {
 *       "category": "Age Requirements",
 *       "field": "age",
 *       "operator": ">=",
 *       "value": "18",
 *       "description": "Applicant must be at least 18 years old",
 *       "source_document": "policy_doc.pdf",
 *       "is_active": true,
 *       "timestamp": "2025-11-11T10:30:00Z"
 *     }
 *   ],
 *   "total_rules": 5,
 *   "active_rules": 5,
 *   "last_updated": "2025-11-11T10:30:00Z"
 * }
 */
export const getExtractedRules = async (bank_id, policy_type) => {
  const params = new URLSearchParams({
    bank_id,
    policy_type
  });

  const url = buildApiUrl(`/api/v1/extracted-rules?${params}`);
  console.log('GET Extracted Rules - URL:', url);
  console.log('GET Extracted Rules - Params:', { bank_id, policy_type });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch extracted rules: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError);
    }
    
    const error = new Error(errorMessage);
    error.status = response.status;
    error.statusText = response.statusText;
    throw error;
  }

  return response.json();
};

/**
 * Get all available banks - GET /api/v1/banks
 */
export const getAllBanks = async () => {
  const url = buildApiUrl('/api/v1/banks');
  console.log('GET All Banks - URL:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch banks: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (parseError) {
        // If JSON parsing fails, use the default error message
        console.error('Failed to parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Handle network errors (connection refused, timeout, etc.)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Unable to connect to the API server. Please ensure the backend is running at ${url}`);
    }
    throw error;
  }
};

/**
 * Get all policies for a specific bank - GET /api/v1/banks/{bank_id}/policies
 */
export const getBankPolicies = async (bank_id) => {
  const url = buildApiUrl(`/api/v1/banks/${bank_id}/policies`);
  console.log('GET Bank Policies - URL:', url);
  console.log('GET Bank Policies - Bank ID:', bank_id);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch policies: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Unable to connect to the API server for bank policies. Please ensure the backend is running.`);
    }
    throw error;
  }
};

/**
 * Get specific policy details - GET /api/v1/policies?bank_id={}&policy_type={}&include_queries=true&include_hierarchical_rules=true&include_test_cases=true
 */
export const getPolicyDetails = async (bank_id, policy_type) => {
  const params = new URLSearchParams({ 
    bank_id, 
    policy_type,
    include_queries: 'true',
    include_hierarchical_rules: 'true',
    include_test_cases: 'true'
  });
  const url = buildApiUrl(`/api/v1/policies?${params}`);
  console.log('GET Policy Details - URL:', url);
  console.log('GET Policy Details - Params:', { bank_id, policy_type, include_queries: true, include_hierarchical_rules: true, include_test_cases: true });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch policy details: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Update hierarchical rules validation fields - POST /api/v1/policies/update-hierarchical-rules
 * @param {Object} params
 * @param {string} params.bank_id - Bank identifier
 * @param {string} params.policy_type - Policy type identifier
 * @param {Array} params.updates - Array of rule updates
 * @returns {Promise<Object>} - Update result
 * 
 * Request Body Example:
 * {
 *   "bank_id": "chase",
 *   "policy_type": "insurance",
 *   "updates": [
 *     {
 *       "rule_id": "1.1",
 *       "expected": "Age >= 18",
 *       "actual": "Age = 25",
 *       "confidence": 0.95,
 *       "passed": true,
 *       "description": "Updated rule description",
 *       "name": "Age Check Rule"
 *     }
 *   ]
 * }
 * 
 * Response:
 * {
 *   "status": "success",
 *   "message": "Successfully updated 2 rules",
 *   "updated_rules": [...],
 *   "bank_id": "chase",
 *   "policy_type": "insurance"
 * }
 */
export const updateHierarchicalRules = async ({ bank_id, policy_type, updates }) => {
  const url = buildApiUrl('/api/v1/policies/update-hierarchical-rules');
  console.log('POST Update Hierarchical Rules - URL:', url);
  console.log('POST Update Hierarchical Rules - Request:', { bank_id, policy_type, updates });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bank_id,
        policy_type,
        updates,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Failed to update hierarchical rules: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }

    return response.json();
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Unable to connect to the API server. Please ensure the backend is running.`);
    }
    throw error;
  }
};
