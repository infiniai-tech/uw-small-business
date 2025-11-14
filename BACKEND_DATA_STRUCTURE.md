# Backend Data Structure for Miro Board Visualization

This document describes the expected data structure from the backend API (`/api/v1/evaluate-policy`) to properly display the multi-level hierarchy visualization in the Rules Board.

## API Endpoint

**POST** `/api/v1/evaluate-policy`

## Request Body Format

```json
{
  "bank_id": "cibc",
  "policy_type": "loan",
  "applicant": {
    "age": 35,
    "annualIncome": 75000,
    "creditScore": 720,
    "healthConditions": "good",
    "smoker": false
  },
  "policy": {
    "coverageAmount": 500000,
    "term": 20,
    "type": "term_life"
  }
}
```

## Expected Response Format

The API should return a JSON response with the following structure:

```json
{
  "status": "success",
  "bank_id": "cibc",
  "policy_type": "loan",
  "container_id": "container-123",
  "decision": {
    "approved": true,
    "reasons": ["Good credit score", "Stable income"],
    "premium_rate": 0.85
  },
  "execution_time_ms": 142,
  "rules": [
    {
      "id": 1,
      "name": "Age Verification Rule",
      "description": "Applicant age within valid range",
      "expected": "18-65",
      "actual": "35",
      "confidence": 0.95,
      "passed": true,
      "dependencies": []
    },
    {
      "id": 2,
      "name": "Credit Score Assessment",
      "description": "Credit score meets minimum requirement",
      "expected": "≥ 650",
      "actual": "720",
      "confidence": 0.92,
      "passed": true,
      "dependencies": []
    },
    {
      "id": 5,
      "name": "Debt-to-Income Ratio",
      "description": "DTI ratio within acceptable range",
      "expected": "< 43%",
      "actual": "32%",
      "confidence": 0.93,
      "passed": true,
      "dependencies": [
        {
          "id": "5.1",
          "name": "Monthly Income Calculation",
          "description": "Monthly income calculated from annual",
          "expected": "Valid",
          "actual": "$6,250/mo",
          "confidence": 0.95,
          "passed": true,
          "dependencies": []
        },
        {
          "id": "5.2",
          "name": "Monthly Debt Calculation",
          "description": "Total monthly debt obligations calculated",
          "expected": "Valid",
          "actual": "$2,000/mo",
          "confidence": 0.92,
          "passed": true,
          "dependencies": []
        }
      ]
    },
    {
      "id": 11,
      "name": "Collateral Evaluation",
      "description": "Collateral value is sufficient",
      "expected": "Adequate",
      "actual": "Good",
      "confidence": 0.86,
      "passed": true,
      "dependencies": [
        {
          "id": "11.1",
          "name": "Appraisal Verification",
          "description": "Property appraisal is current",
          "expected": "Recent",
          "actual": "30 days old",
          "confidence": 0.93,
          "passed": true,
          "dependencies": [
            {
              "id": "11.1.1",
              "name": "Appraiser License Check",
              "description": "Appraiser has valid state license",
              "expected": "Valid",
              "actual": "Active",
              "confidence": 0.98,
              "passed": true,
              "dependencies": [
                {
                  "id": "11.1.1.1",
                  "name": "State Registry Lookup",
                  "description": "License verified in state registry",
                  "expected": "Found",
                  "actual": "Verified",
                  "confidence": 0.99,
                  "passed": true,
                  "dependencies": [
                    {
                      "id": "11.1.1.1.1",
                      "name": "API Connection",
                      "description": "Successfully connected to state registry API",
                      "expected": "200 OK",
                      "actual": "200 OK",
                      "confidence": 0.99,
                      "passed": true,
                      "dependencies": []
                    },
                    {
                      "id": "11.1.1.1.2",
                      "name": "Expiration Date Check",
                      "description": "License expiration date is in the future",
                      "expected": "Not expired",
                      "actual": "Valid until 2026",
                      "confidence": 0.99,
                      "passed": true,
                      "dependencies": []
                    }
                  ]
                },
                {
                  "id": "11.1.2",
                  "name": "Appraisal Date Validation",
                  "description": "Appraisal completed within acceptable timeframe",
                  "expected": "< 90 days",
                  "actual": "30 days",
                  "confidence": 0.97,
                  "passed": true,
                  "dependencies": []
                }
              ]
            },
            {
              "id": "11.2",
              "name": "Loan-to-Value Ratio",
              "description": "LTV ratio within acceptable range",
              "expected": "< 80%",
              "actual": "75%",
              "confidence": 0.89,
              "passed": true,
              "dependencies": []
            }
          ]
        }
      ]
    }
  ]
}
```

## Field Descriptions

### Top-Level Response Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | Response status (e.g., "success") |
| `bank_id` | string | Yes | Bank identifier |
| `policy_type` | string | Yes | Policy type (e.g., "loan", "insurance") |
| `container_id` | string | No | Container ID for tracking |
| `decision` | object | Yes | Decision object (see below) |
| `execution_time_ms` | number | Yes | Execution time in milliseconds |
| `rules` | array | Yes | Array of rule objects (see below) |

### Decision Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `approved` | boolean | Yes | Whether the application was approved |
| `reasons` | array[string] | No | Array of reason strings |
| `premium_rate` | number | No | Premium rate (0-1) |

### Rule Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string/number | Yes | Unique identifier for the rule (used for node IDs) |
| `name` | string | Yes | Display name of the rule |
| `description` | string | Yes | Description of what the rule checks |
| `expected` | string | Yes | Expected value or condition |
| `actual` | string | Yes | Actual value from evaluation |
| `confidence` | number | Yes | Confidence score (0-1, where 1 is 100%) |
| `passed` | boolean | Yes | Whether the rule passed (`true`) or failed (`false`) |
| `dependencies` | array[Rule] | No | Array of nested/sub-rules (same structure, supports unlimited nesting) |

## Visualization Behavior

### Node Positioning

- **Root rules** (top-level rules in the `rules` array) are positioned at `x: 0`
- **Dependencies** are positioned `400px` to the right of their parent (`levelSpacing`)
- **Vertical spacing** between nodes is `250px` (`nodeSpacing`)
- The visualization supports **unlimited nesting levels**

### Edge Connections

- Edges connect parent rules to their dependencies
- Edge color:
  - **Green** (`#22c55e`) if the rule `passed: true`
  - **Red** (`#ef4444`) if the rule `passed: false`
- Edges are animated and use smoothstep curves

### Node Display

Each node displays:
- Rule name (from `name` field)
- Description (from `description` field)
- Expected vs Actual values
- Confidence percentage
- Pass/Fail badge
- Dependency count badge (if `dependencies.length > 0`)

## Example: Multi-Level Hierarchy

```
Root Rule (id: 11)
  └─ Dependency Level 1 (id: 11.1)
      ├─ Dependency Level 2 (id: 11.1.1)
      │   ├─ Dependency Level 3 (id: 11.1.1.1)
      │   │   ├─ Dependency Level 4 (id: 11.1.1.1.1)
      │   │   └─ Dependency Level 4 (id: 11.1.1.1.2)
      │   └─ Dependency Level 3 (id: 11.1.2)
      └─ Dependency Level 2 (id: 11.2)
```

## Important Notes

1. **Unique IDs**: Each rule must have a unique `id` (string or number). The frontend uses `rule-${id}` as the node ID.

2. **Dependencies Array**: 
   - Can be empty `[]` for rules with no dependencies
   - Can contain nested rules with the same structure
   - Supports unlimited nesting depth

3. **Passed Field**:
   - `true` = Rule passed (green styling)
   - `false` = Rule failed (red styling)
   - Used for both node styling and edge colors

4. **Confidence**: Should be a decimal between 0 and 1 (e.g., 0.95 = 95%)

5. **Empty Dependencies**: If a rule has no dependencies, include `"dependencies": []` or omit the field entirely.

## Error Handling

If the API returns an error or the `rules` array is missing/empty:
- The visualization will show an empty board
- Error messages will be displayed to the user
- The UI gracefully handles missing or malformed data

## Testing

To test the visualization:
1. Send a POST request to `/api/v1/evaluate-policy` with valid request data
2. Ensure the response includes a `rules` array with at least one rule
3. Include nested `dependencies` to test multi-level hierarchy
4. Verify that `passed` values correctly reflect rule evaluation results

