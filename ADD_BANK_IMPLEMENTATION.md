# Add Bank Feature - Implementation Summary

This document describes the fully functional "Add Bank" feature that integrates with the backend API.

## Overview

The Add Bank feature allows users to upload a policy document and automatically extract rules, then deploy them to a containerized environment. The process takes approximately 12 minutes and involves multiple steps with visual feedback.

## Implementation Details

### Flow

1. **User Input & Immediate API Call**
   - User uploads a policy document (PDF, DOC, DOCX, TXT)
   - Selects insurance type (loan, insurance, etc.)
   - Enters bank name
   - Clicks "Process Document"
   - **API call starts immediately in background:**
     - Upload file to S3 using `/upload_file` endpoint
     - Call `/process_policy_from_s3` endpoint (takes ~12 minutes)

2. **Mock UI Processing Steps** (While API runs in background)
   - **Step 1 - Text Extraction**: Shows for 2 minutes
   - **Step 2 - Query Generation**: Shows for 2 minutes  
   - **Step 3 - Rule Extraction**: Shows for 2 minutes
   - **Step 4 - DRL Generation**: Shows for 2 minutes
   - **Step 5 - Deploy & Test**: Shows processing state
   
   These steps provide visual feedback while the actual API processes the document.

3. **Results Display**
   - When API completes (~12 minutes), results are displayed
   - If API completes before Step 5, it waits for Step 5 to show
   - If Step 5 shows before API completes, Step 5 stays in processing until API finishes
   - Display success results or error message

### Code Location

**File**: `src/components/dashboards/HomeDashboard.jsx`

**Key Functions**:
- `handleAddBank()`: Main function that orchestrates the process
- `uploadDocumentToS3()`: Uploads file to S3 (from `src/services/api.js`)
- `processPolicyFromS3()`: Processes policy and deploys rules (from `src/services/api.js`)

### API Endpoints Used

#### 1. Upload File to S3
```
POST /upload_file
Content-Type: multipart/form-data

FormData:
  - file: [File object]
  - folder: "policies"

Response:
{
  "data": {
    "s3_url": "https://bucket.s3.region.amazonaws.com/policies/filename.pdf",
    "s3_key": "policies/filename.pdf",
    "filename": "filename.pdf",
    "file_size": 1234567,
    "content_type": "application/pdf"
  }
}
```

#### 2. Process Policy from S3
```
POST /process_policy_from_s3
Content-Type: application/json

{
  "s3_url": "https://bucket.s3.region.amazonaws.com/policies/filename.pdf",
  "policy_type": "insurance",
  "bank_id": "cibc"
}

Response:
{
  "status": "success",
  "bank_id": "cibc",
  "policy_type": "insurance",
  "container_id": "container_abc123",
  "extracted_rules": [
    {
      "id": 1,
      "rule_name": "Age Verification",
      "description": "Validates applicant age",
      "field": "age",
      "operator": ">=",
      "value": "18",
      "is_active": true,
      "confidence": 0.95
    }
    // ... more rules
  ],
  "jar_url": "https://s3.../rules.jar",
  "drl_url": "https://s3.../rules.drl",
  "excel_url": "https://s3.../rules.xlsx"
}
```

### Timing Breakdown

```
Total Time: ~12 minutes

User submits form:
  ├─ API call starts immediately (runs for ~12 minutes in background)
  │   ├─ Upload to S3 (~10 seconds)
  │   └─ Process policy from S3 (~11.5 minutes)
  │
  └─ Mock UI steps (visual feedback while API processes):
      ├─ Step 1: Text Extraction        0:00 - 2:00  (Mock UI)
      ├─ Step 2: Query Generation        2:00 - 4:00  (Mock UI)
      ├─ Step 3: Rule Extraction         4:00 - 6:00  (Mock UI)
      ├─ Step 4: DRL Generation          6:00 - 8:00  (Mock UI)
      └─ Step 5: Deploy & Test           8:00 - 12:00 (Mock UI, waits for API)

When API completes: Display results
```

**Note**: The API call happens immediately when user clicks "Process Document". The 5 processing steps are purely visual feedback to show progress while the API works in the background.

### Processing States

1. **idle**: Initial state, waiting for user input
2. **processing**: File is being processed (steps 1-5)
3. **completed**: Processing completed successfully
4. **error**: An error occurred during processing

### Error Handling

Errors are caught at multiple levels:

1. **File Upload Errors**:
   - Network errors (server unreachable)
   - Invalid file formats
   - Upload failures

2. **API Processing Errors**:
   - Policy processing failures
   - Rule extraction errors
   - Deployment failures

3. **UI Error Display**:
   - Red error icon
   - Error message displayed
   - Option to "Try Again" (resets to idle state)

### Success Display

When processing completes successfully:

1. **Bank Details Card**:
   - Bank ID
   - Bank Name
   - Insurance Type
   - File Size
   - Container ID
   - Processed At timestamp

2. **Extracted Rules Card**:
   - Total rule count badge
   - List of all extracted rules with:
     - Rule number and name
     - Description
     - Status (Active/Inactive)
     - Confidence score with progress bar

3. **Download Generated Files**:
   - JAR File button
   - DRL File button
   - Excel File button

### User Experience

1. **Visual Feedback**:
   - Animated spinner during processing
   - Step-by-step progress indicators
   - Completed checkmarks for finished steps
   - Processing indicator for current step

2. **Prevent Accidental Closure**:
   - Modal cannot be closed during processing (backdrop click disabled)
   - Confirmation dialog shown if user tries to close during processing
   - "Cancel" or "Keep Processing" options

3. **Form Validation**:
   - "Process Document" button disabled until all required fields filled
   - File type validation
   - Bank name required

## Testing

To test the Add Bank feature:

1. Open the application
2. Navigate to "Bank Management" tab
3. Click "+ Add New Bank"
4. Upload a policy document (PDF, DOC, DOCX, TXT)
5. Select insurance type from dropdown
6. Enter bank name
7. Click "Process Document"
8. Wait for processing (observe step-by-step progress)
9. After ~12 minutes, view the results
10. Download generated files if needed

## Configuration

The API base URL is configured via environment variable:

```env
VITE_API_BASE_URL=http://localhost:9000/rule-agent
```

Or set to your production API URL:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/rule-agent
```

## Future Enhancements

Potential improvements:

1. **Real-time Progress**: Implement WebSocket or polling to show actual API progress
2. **Resume Failed Processing**: Save state and allow resuming if error occurs
3. **Bulk Upload**: Process multiple banks at once
4. **Rule Editing**: Allow manual editing of extracted rules before deployment
5. **Validation Preview**: Show extracted rules before final deployment
6. **Cancel Processing**: Allow users to cancel mid-process
7. **Progress Percentage**: Show actual percentage complete from API

## Notes

- **API call starts immediately** when user clicks "Process Document"
- The 5 processing steps (1-5) are **purely visual/mock UI** to provide user feedback
- The actual API runs in the background for ~12 minutes (upload + processing)
- When the API completes, results are displayed immediately
- If Step 5 shows before API completes, it stays in "processing" state until API finishes
- All API responses are transformed to match the UI's expected data structure
- File uploads use `multipart/form-data` encoding
- Policy processing uses JSON for request/response
- The mock steps and real API processing happen **in parallel**, not sequentially

