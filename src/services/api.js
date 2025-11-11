/**
 * API service for document processing and rule extraction
 * 
 * Configuration:
 * Set the VITE_API_BASE_URL environment variable in your .env file:
 * VITE_API_BASE_URL=https://your-api-domain.com
 * 
 * For local development:
 * VITE_API_BASE_URL=http://localhost:8000
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';

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
  const response = await fetch(buildApiUrl('/process_policy_from_s3'), {
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
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
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

