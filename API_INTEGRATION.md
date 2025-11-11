# API Integration Documentation

## Overview

The Admin Dashboard now includes full API integration for processing policy documents and extracting underwriting rules.

## Features Implemented

### 1. Document Upload & Processing
- **File Upload**: Select PDF, DOC, DOCX, or TXT files
- **Policy Type Selection**: Dropdown with predefined options (insurance, loan, mortgage, credit, underwriting)
- **Bank ID Input**: Required field for bank identification
- **Extraction Prompt**: Optional field for custom extraction instructions

### 2. API Integration

#### Endpoint: `POST /process_policy_from_s3`

**Request Parameters:**
```json
{
  "s3_url": "https://bucket.s3.us-east-1.amazonaws.com/policies/document.pdf",
  "policy_type": "insurance",
  "bank_id": "chase"
}
```

**Response Schema:**
```json
{
  "s3_url": "string",
  "policy_type": "string",
  "bank_id": "string",
  "container_id": "string",
  "status": "in_progress|success|failed",
  "jar_s3_url": "string",
  "drl_s3_url": "string",
  "excel_s3_url": "string",
  "steps": {
    "text_extraction": { "status": "string", "length": 0, "preview": "string" },
    "query_generation": { "status": "string", "method": "template", "queries": [], "count": 0 },
    "data_extraction": { "status": "string", "method": "textract", "data": {} },
    "rule_generation": { "status": "string", "drl_length": 0, "has_decision_table": true },
    "deployment": {
      "status": "success",
      "message": "string",
      "container_id": "string",
      "release_id": {
        "group-id": "string",
        "artifact-id": "string",
        "version": "string"
      }
    },
    "s3_upload": {
      "jar": { "status": "string", "s3_url": "string" },
      "drl": { "status": "string", "s3_url": "string" },
      "excel": { "status": "string", "s3_url": "string" }
    }
  }
}
```

### 3. Features

#### Document Upload Workflow
1. User selects a policy document
2. User specifies policy type and bank ID
3. Document is uploaded to S3 (placeholder implementation)
4. API processes the document through the underwriting workflow
5. Real-time status updates via polling
6. Display processing steps and results

#### Processing Results Display
- **S3 URL**: Original document location
- **Container ID**: Unique identifier for the processing job
- **Policy Type & Bank ID**: Metadata about the document
- **Processing Steps**: Detailed status for each step:
  - Text Extraction
  - Query Generation
  - Data Extraction
  - Rule Generation
  - Deployment
  - S3 Upload

#### Download Options
- **JAR File**: Compiled Java Archive with rules
- **DRL File**: Drools Rule Language file
- **Excel File**: Spreadsheet with extracted rules

### 4. Document Library
- View all uploaded documents
- Real-time status updates (in_progress, success, processed)
- Container ID display for tracking
- Download buttons for JAR, DRL, and Excel files
- Delete functionality

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://your-api-domain.com
```

For local development:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## File Structure

```
src/
├── services/
│   └── api.js                 # API service layer with all endpoints
├── components/
│   ├── dashboards/
│   │   └── AdminDashboard.jsx # Main admin interface with API integration
│   └── ui/
│       ├── select.jsx         # Dropdown component for selections
│       └── ...                # Other UI components
```

## Placeholder Implementation

### Document Upload to S3

The `uploadDocumentToS3()` function in `src/services/api.js` is currently a placeholder:

```javascript
export const uploadDocumentToS3 = async (file) => {
  // TODO: Implement actual document upload to S3 once endpoint is available
  // This is a placeholder that simulates the upload
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockS3Url = `https://uw-data-extraction.s3.us-east-1.amazonaws.com/policies/${file.name.replace(/\s+/g, '_')}`;
      resolve(mockS3Url);
    }, 1000);
  });
};
```

**To integrate the real upload endpoint:**
1. Replace the mock implementation with actual API call
2. Update the endpoint URL
3. Handle authentication if required
4. Add proper error handling

## Error Handling

- Form validation for required fields
- API error display with user-friendly messages
- Failed upload notifications
- Network error handling

## Status Polling

The system automatically polls for status updates every 3 seconds when a document is in "in_progress" state until completion.

## Usage Example

1. Navigate to Admin Dashboard
2. Select a policy document file
3. Choose policy type from dropdown (default: "insurance")
4. Enter bank ID (required)
5. Optionally add extraction prompt
6. Click "Upload & Process"
7. Monitor processing status in real-time
8. View detailed processing steps
9. Download generated files (JAR, DRL, Excel)

## Next Steps

- [ ] Implement actual S3 document upload endpoint
- [ ] Add authentication/authorization
- [ ] Implement retry logic for failed uploads
- [ ] Add bulk upload functionality
- [ ] Implement rule editing interface
- [ ] Add search and filter for document library

