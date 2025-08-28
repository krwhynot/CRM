import { z } from "zod";

// Field mapping schema for OpenAI structured outputs
export const FieldMapping = z.object({
  header: z.string(),
  suggestedField: z.enum([
    "name","website","phone","email","address_line_1","address_line_2",
    "city","state_province","postal_code","country","notes","type",
    "priority","segment","primary_manager_name","secondary_manager_name",
    "is_active","contact_name","contact_email","contact_phone","contact_title"
  ]).nullable(), // null => unknown/skip
  confidence: z.number().min(0).max(1),
  alternatives: z.array(z.string()).nullable(),
  reason: z.string().nullable() // Why this mapping was suggested
});

// Full response from OpenAI field mapping
export const FieldMappingResponse = z.object({
  entityType: z.enum(["organization","contact","distributor","product","unknown"]),
  mappings: z.array(FieldMapping),
  headerRowIndex: z.number().min(0).nullable(), // if headers start at row N
  confidence: z.number().min(0).max(1).nullable(), // overall confidence
  notes: z.string().nullable() // any additional context
});

// Validation issue for a specific row
export const ValidationIssue = z.object({
  field: z.string(),
  issue: z.string(),
  severity: z.enum(["error", "warning", "info"]),
  suggestion: z.string().nullable()
});

// Row validation response
export const RowValidation = z.object({
  rowIndex: z.number(),
  isValid: z.boolean(),
  issues: z.array(ValidationIssue),
  confidence: z.number().min(0).max(1).nullable()
});

// Batch validation response
export const BatchValidationResponse = z.object({
  validatedRows: z.array(RowValidation),
  summary: z.object({
    totalRows: z.number(),
    validRows: z.number(),
    errorRows: z.number(),
    warningRows: z.number()
  }),
  overallQuality: z.number().min(0).max(1).nullable()
});

// Duplicate detection response
export const DuplicateGroup = z.object({
  rows: z.array(z.number()), // row indices that are duplicates
  confidence: z.number().min(0).max(1),
  reason: z.string(),
  suggestedAction: z.enum(["merge", "keep_first", "keep_last", "manual_review"])
});

export const DuplicateDetectionResponse = z.object({
  duplicateGroups: z.array(DuplicateGroup),
  summary: z.object({
    totalRows: z.number(),
    uniqueRows: z.number(),
    duplicateGroups: z.number(),
    totalDuplicates: z.number()
  })
});

// Export types for TypeScript usage
export type FieldMappingType = z.infer<typeof FieldMapping>;
export type FieldMappingResponseType = z.infer<typeof FieldMappingResponse>;
export type ValidationIssueType = z.infer<typeof ValidationIssue>;
export type RowValidationType = z.infer<typeof RowValidation>;
export type BatchValidationResponseType = z.infer<typeof BatchValidationResponse>;
export type DuplicateGroupType = z.infer<typeof DuplicateGroup>;
export type DuplicateDetectionResponseType = z.infer<typeof DuplicateDetectionResponse>;