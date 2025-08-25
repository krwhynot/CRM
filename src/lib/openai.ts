import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { 
  FieldMappingResponse, 
  BatchValidationResponse, 
  DuplicateDetectionResponse,
  type FieldMappingResponseType,
  type BatchValidationResponseType,
  type DuplicateDetectionResponseType
} from "./aiSchemas";

// Initialize OpenAI client
const client = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Enable browser usage for client-side React app
});

// Configuration constants
const CONF_HIGH = 0.85; // Auto-apply threshold
const CONF_MEDIUM = 0.7; // User confirmation threshold  
const CONF_MIN = 0.5;   // Minimum threshold for suggestions

// Available CRM fields with descriptions for context
const CRM_FIELD_CONTEXT = {
  organization: {
    name: "Organization/company name",
    website: "Company website or LinkedIn URL", 
    phone: "Main organization phone number",
    email: "Organization contact email",
    address_line_1: "Street address line 1",
    address_line_2: "Street address line 2 (optional)",
    city: "City name",
    state_province: "State or province",
    postal_code: "ZIP/postal code",
    country: "Country (usually US)",
    notes: "General notes about the organization",
    type: "Organization type (customer, distributor, etc.)",
    priority: "Priority level (A, B, C, D)",
    segment: "Business segment (e.g., Casual Dining)",
    primary_manager_name: "Primary account manager name",
    secondary_manager_name: "Secondary account manager name",
    is_active: "Whether organization is active (true/false)"
  },
  contact: {
    contact_name: "Full name or first/last name combined",
    contact_email: "Contact's email address",
    contact_phone: "Contact's phone number",
    contact_title: "Job title or role"
  }
};

/**
 * Smart field mapping using OpenAI GPT-3.5-turbo
 */
export async function suggestFieldMappings(
  headers: string[], 
  sampleRows: Record<string, any>[],
  entityType: 'organization' | 'contact' = 'organization'
): Promise<FieldMappingResponseType> {
  
  const prompt = [
    {
      role: "system" as const,
      content: `You are a CSV field mapping expert for CRM systems. Map CSV headers to standardized CRM fields.
      
Available CRM fields:
${JSON.stringify(CRM_FIELD_CONTEXT, null, 2)}

Rules:
- Return null for suggestedField if no good match exists
- Confidence should reflect certainty (0.0 to 1.0)
- Consider semantic similarity, not just exact matches
- Look at sample data to understand field content
- Be conservative with confidence scores
- Provide clear reasons for mappings`
    },
    {
      role: "user" as const,
      content: `Map these CSV headers to CRM fields:
      
Headers: ${JSON.stringify(headers)}
Sample data (first 3 rows): ${JSON.stringify(sampleRows.slice(0, 3))}
Target entity type: ${entityType}

Analyze the headers and sample data to suggest the best field mappings.`
    }
  ];

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: prompt,
      response_format: zodResponseFormat(FieldMappingResponse, "FieldMappingResponse"),
      temperature: 0, // Deterministic responses
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result as FieldMappingResponseType;

  } catch (error) {
    console.error('OpenAI field mapping failed:', error);
    throw new Error('AI field mapping unavailable - falling back to manual mapping');
  }
}

/**
 * Validate data quality using AI
 */
export async function validateRowsWithAI(
  rows: Record<string, any>[],
  fieldMappings: Record<string, string>,
  maxRows: number = 50
): Promise<BatchValidationResponseType> {

  const sampleRows = rows.slice(0, maxRows);
  
  const prompt = [
    {
      role: "system" as const,
      content: `You validate CRM organization data for quality issues. Check for:
      
- Missing required fields (name is required)
- Invalid data formats (malformed emails, phones, URLs)
- Inconsistent address components (city/state/zip mismatches)
- Suspicious or invalid values
- Data type mismatches

Classify issues as: error (blocks import), warning (should review), info (minor issue)
Be specific about what's wrong and suggest fixes when possible.`
    },
    {
      role: "user" as const,
      content: `Validate these organization records:

Field mappings: ${JSON.stringify(fieldMappings)}
Data to validate: ${JSON.stringify(sampleRows)}

Check each row for data quality issues and provide specific feedback.`
    }
  ];

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: prompt,
      response_format: zodResponseFormat(BatchValidationResponse, "BatchValidationResponse"),
      temperature: 0,
      max_tokens: 3000
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result as BatchValidationResponseType;

  } catch (error) {
    console.error('OpenAI validation failed:', error);
    throw new Error('AI validation unavailable - using basic validation only');
  }
}

/**
 * Detect potential duplicates using AI
 */
export async function detectDuplicatesWithAI(
  rows: Record<string, any>[],
  maxRows: number = 100
): Promise<DuplicateDetectionResponseType> {

  const sampleRows = rows.slice(0, maxRows);
  
  const prompt = [
    {
      role: "system" as const,
      content: `You detect duplicate organizations in CRM data. Look for:
      
- Similar company names (Acme Corp vs Acme Corporation)  
- Same phone numbers or emails
- Similar addresses
- Variations in spelling or formatting

Group potential duplicates and suggest the best action:
- merge: combine the records
- keep_first: use the first occurrence  
- keep_last: use the last occurrence
- manual_review: requires human decision`
    },
    {
      role: "user" as const,
      content: `Find potential duplicates in this organization data:

${JSON.stringify(sampleRows)}

Group similar organizations and suggest how to handle each duplicate group.`
    }
  ];

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: prompt, 
      response_format: zodResponseFormat(DuplicateDetectionResponse, "DuplicateDetectionResponse"),
      temperature: 0,
      max_tokens: 2500
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result as DuplicateDetectionResponseType;

  } catch (error) {
    console.error('OpenAI duplicate detection failed:', error);
    throw new Error('AI duplicate detection unavailable');
  }
}

/**
 * Check if OpenAI API is available and configured
 */
export function isOpenAIAvailable(): boolean {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
}

/**
 * Get confidence thresholds for UI
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: CONF_HIGH,
  MEDIUM: CONF_MEDIUM, 
  MIN: CONF_MIN
} as const;