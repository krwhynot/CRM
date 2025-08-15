/**
 * Field Specification Compliance Validation
 * 
 * Manual validation script to check form compliance without full E2E test setup
 */

import fs from 'fs'
import path from 'path'

console.log('🔍 Principal CRM Field Specification Compliance Validation')
console.log('=' .repeat(60))

// Analyze form implementations for field compliance
const FORMS_TO_ANALYZE = [
  { name: 'Contact Form', path: 'src/components/contacts/ContactForm.tsx' },
  { name: 'Organization Form', path: 'src/components/organizations/OrganizationForm.tsx' },
  { name: 'Opportunity Form', path: 'src/components/opportunities/OpportunityForm.tsx' },
  { name: 'Interaction Form', path: 'src/components/interactions/InteractionForm.tsx' }
]

// Field specifications
const SPECIFICATIONS = {
  contact: {
    required: ['first_name', 'last_name', 'organization_id', 'purchase_influence', 'decision_authority'],
    optional: ['email', 'title', 'department', 'phone', 'mobile_phone', 'linkedin_url', 'is_primary_contact', 'notes'],
    prohibited: ['position', 'address', 'city', 'state', 'zip', 'website', 'account_manager']
  },
  organization: {
    required: ['name', 'priority', 'segment', 'is_principal', 'is_distributor'],
    optional: ['address', 'city', 'state', 'zip', 'phone', 'website', 'account_manager', 'notes'],
    prohibited: []
  },
  opportunity: {
    required: ['organization_id', 'stage', 'principals'],
    optional: ['name', 'contact_id', 'product_id', 'opportunity_context', 'custom_context', 'probability', 'expected_close_date', 'deal_owner', 'notes'],
    stages: ['New Lead', 'Initial Outreach', 'Sample/Visit Offered', 'Awaiting Response', 'Feedback Logged', 'Demo Scheduled', 'Closed - Won']
  },
  interaction: {
    required: ['type', 'interaction_date', 'subject', 'opportunity_id'],
    optional: ['location', 'notes', 'follow_up_required', 'follow_up_date'],
    prohibited: []
  }
}

const complianceResults = []

function analyzeFormFields(formContent, formName, specification) {
  console.log(`\n📋 Analyzing ${formName}...`)
  
  const result = {
    formName,
    requiredFieldsFound: [],
    optionalFieldsFound: [],
    prohibitedFieldsFound: [],
    missingRequired: [],
    unexpectedProhibited: [],
    specialFeatures: [],
    compliance: true,
    score: 0
  }

  // Analyze required fields
  specification.required.forEach(field => {
    const fieldPatterns = [
      `name="${field}"`,
      `data-field="${field}"`,
      `"${field}"`,
      field.replace(/_/g, ' ')
    ]
    
    const fieldFound = fieldPatterns.some(pattern => 
      formContent.includes(pattern) || 
      formContent.toLowerCase().includes(pattern.toLowerCase())
    )
    
    if (fieldFound) {
      result.requiredFieldsFound.push(field)
    } else {
      result.missingRequired.push(field)
      result.compliance = false
    }
  })

  // Analyze optional fields
  specification.optional.forEach(field => {
    const fieldPatterns = [
      `name="${field}"`,
      `data-field="${field}"`,
      `"${field}"`,
      field.replace(/_/g, ' ')
    ]
    
    const fieldFound = fieldPatterns.some(pattern => 
      formContent.includes(pattern) || 
      formContent.toLowerCase().includes(pattern.toLowerCase())
    )
    
    if (fieldFound) {
      result.optionalFieldsFound.push(field)
    }
  })

  // Analyze prohibited fields
  if (specification.prohibited) {
    specification.prohibited.forEach(field => {
      const fieldPatterns = [
        `name="${field}"`,
        `data-field="${field}"`,
        `"${field}"`
      ]
      
      const fieldFound = fieldPatterns.some(pattern => 
        formContent.includes(pattern)
      )
      
      if (fieldFound) {
        result.prohibitedFieldsFound.push(field)
        result.unexpectedProhibited.push(field)
        result.compliance = false
      }
    })
  }

  // Check for special features
  if (formName === 'Contact Form') {
    if (formContent.includes('purchase_influence') || formContent.includes('Purchase Influence')) {
      result.specialFeatures.push('Purchase Influence field present')
    }
    if (formContent.includes('decision_authority') || formContent.includes('Decision Authority')) {
      result.specialFeatures.push('Decision Authority field present')
    }
    
    // Check for required purchase influence options
    const requiredInfluenceOptions = ['High', 'Medium', 'Low', 'Unknown']
    const influenceOptionsFound = requiredInfluenceOptions.filter(option => 
      formContent.includes(`"${option}"`) || formContent.includes(`'${option}'`)
    )
    
    if (influenceOptionsFound.length >= 3) {
      result.specialFeatures.push(`Purchase Influence options: ${influenceOptionsFound.join(', ')}`)
    }
  }

  if (formName === 'Organization Form') {
    if (formContent.includes('is_principal') && formContent.includes('is_distributor')) {
      result.specialFeatures.push('Principal/Distributor designation toggles present')
    }
    
    const priorityLevels = ['A', 'B', 'C', 'D']
    const priorityLevelsFound = priorityLevels.filter(level => 
      formContent.includes(`"${level}"`) || formContent.includes(`'${level}'`)
    )
    
    if (priorityLevelsFound.length >= 3) {
      result.specialFeatures.push(`Priority levels: ${priorityLevelsFound.join(', ')}`)
    }
  }

  if (formName === 'Opportunity Form') {
    // Check for 7-point funnel stages
    if (specification.stages) {
      const stagesFound = specification.stages.filter(stage => 
        formContent.includes(`"${stage}"`) || formContent.includes(`'${stage}'`)
      )
      
      if (stagesFound.length >= 6) {
        result.specialFeatures.push(`7-point funnel stages: ${stagesFound.length}/7 found`)
      }
    }
    
    if (formContent.includes('auto_generated_name') || formContent.includes('auto-naming')) {
      result.specialFeatures.push('Auto-naming functionality detected')
    }
    
    if (formContent.includes('principals') && (formContent.includes('checkbox') || formContent.includes('multiple'))) {
      result.specialFeatures.push('Multiple principal selection capability')
    }
  }

  if (formName === 'Interaction Form') {
    if (formContent.includes('opportunity_id') && formContent.includes('required')) {
      result.specialFeatures.push('Required opportunity linking enforced')
    }
  }

  // Calculate compliance score
  const totalRequired = specification.required.length
  const foundRequired = result.requiredFieldsFound.length
  const prohibitedViolations = result.prohibitedFieldsFound.length
  
  let score = Math.round((foundRequired / totalRequired) * 80) // 80 points for required fields
  score += (prohibitedViolations === 0) ? 20 : 0 // 20 points for no prohibited fields
  
  result.score = Math.min(score, 100)

  console.log(`  ✓ Required fields found: ${foundRequired}/${totalRequired}`)
  console.log(`  ✓ Optional fields found: ${result.optionalFieldsFound.length}`)
  console.log(`  ✗ Prohibited fields found: ${prohibitedViolations}`)
  console.log(`  🎯 Compliance Score: ${result.score}%`)
  console.log(`  🔧 Special features: ${result.specialFeatures.length}`)

  if (result.missingRequired.length > 0) {
    console.log(`  ⚠️  Missing required fields: ${result.missingRequired.join(', ')}`)
  }

  if (result.unexpectedProhibited.length > 0) {
    console.log(`  ❌ Unexpected prohibited fields: ${result.unexpectedProhibited.join(', ')}`)
  }

  return result
}

// Analyze each form
for (const form of FORMS_TO_ANALYZE) {
  try {
    if (fs.existsSync(form.path)) {
      const formContent = fs.readFileSync(form.path, 'utf8')
      const specKey = form.name.toLowerCase().split(' ')[0] // 'contact', 'organization', etc.
      const specification = SPECIFICATIONS[specKey]
      
      if (specification) {
        const result = analyzeFormFields(formContent, form.name, specification)
        complianceResults.push(result)
      } else {
        console.log(`\n⚠️  No specification found for ${form.name}`)
      }
    } else {
      console.log(`\n❌ Form file not found: ${form.path}`)
    }
  } catch (error) {
    console.log(`\n❌ Error analyzing ${form.name}: ${error.message}`)
  }
}

// Generate comprehensive report
console.log('\n' + '='.repeat(60))
console.log('FIELD SPECIFICATION COMPLIANCE REPORT')
console.log('='.repeat(60))

const totalForms = complianceResults.length
const compliantForms = complianceResults.filter(r => r.compliance && r.score >= 90).length
const averageScore = totalForms > 0 ? 
  Math.round(complianceResults.reduce((sum, r) => sum + r.score, 0) / totalForms) : 0

console.log(`📊 Summary:`)
console.log(`   - Forms Analyzed: ${totalForms}`)
console.log(`   - Compliant Forms: ${compliantForms}`)
console.log(`   - Average Score: ${averageScore}%`)
console.log(`   - Overall Compliance: ${compliantForms === totalForms && averageScore >= 90 ? '✅ PASS' : '❌ FAIL'}`)

console.log(`\n📋 Detailed Results:`)
complianceResults.forEach(result => {
  const status = result.compliance && result.score >= 90 ? '✅' : '❌'
  console.log(`   ${status} ${result.formName}: ${result.score}% (${result.requiredFieldsFound.length} required, ${result.specialFeatures.length} features)`)
})

// Save report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalForms,
    compliantForms,
    averageScore,
    overallCompliance: compliantForms === totalForms && averageScore >= 90
  },
  forms: complianceResults,
  testingMethod: 'Static Code Analysis',
  version: '1.0'
}

const reportDir = 'quality-gates-logs/field-compliance'
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true })
}

const reportFile = path.join(reportDir, 'static-analysis-compliance-report.json')
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))

console.log(`\n📄 Report saved: ${reportFile}`)

// Generate recommendations
const recommendations = []

complianceResults.forEach(result => {
  if (result.missingRequired.length > 0) {
    recommendations.push(`${result.formName}: Add missing required fields - ${result.missingRequired.join(', ')}`)
  }
  
  if (result.unexpectedProhibited.length > 0) {
    recommendations.push(`${result.formName}: Remove prohibited fields - ${result.unexpectedProhibited.join(', ')}`)
  }
  
  if (result.score < 90) {
    recommendations.push(`${result.formName}: Improve compliance score from ${result.score}% to 90%+`)
  }
})

if (recommendations.length > 0) {
  console.log(`\n💡 Recommendations:`)
  recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`)
  })
} else {
  console.log(`\n🎉 No recommendations - all forms meet compliance requirements!`)
}

console.log('\n' + '='.repeat(60))

// Exit with appropriate code
const overallCompliance = report.summary.overallCompliance
process.exit(overallCompliance ? 0 : 1)