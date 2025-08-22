# KitchenPantry CRM - Component Usage Guide
*Your Complete Recipe Book for Consistent UI Development*

---

## 🍽️ Kitchen Inventory (Quick Reference Index)

### 🥄 **shadcn/ui Foundation** (8 Core Ingredients)
| Component | Purpose | Use When | Touch-Ready |
|-----------|---------|----------|-------------|
| `form` | Form wrapper | Every form needs validation | ✅ |
| `input` | Text/number entry | User needs to type info | ✅ |
| `select` | Choose from options | 3+ choices available | ✅ |
| `textarea` | Long text | Notes, descriptions | ✅ |
| `button` | Actions & submission | User needs to do something | ✅ |
| `card` | Container/grouping | Organize related content | ✅ |
| `label` | Field descriptions | Accessibility & clarity | ✅ |
| `checkbox` | Yes/no choices | Boolean selections | ✅ |

### 🍳 **CRM Specialty Dishes** (Custom Components)
| Component | Purpose | Workflow Stage | Recipe Card |
|-----------|---------|----------------|-------------|
| `ContactForm` | Add/edit contacts | Customer onboarding | [📋 Recipe](#recipe-contactform) |
| `OrganizationForm` | Add/edit companies | Account setup | [📋 Recipe](#recipe-organizationform) |
| `ProductCatalog` | Browse products | Order taking | [📋 Recipe](#recipe-productcatalog) |
| `OpportunityKanban` | Track sales pipeline | Deal management | [📋 Recipe](#recipe-opportunitykanban) |
| `InteractionLog` | Record touchpoints | Relationship building | [📋 Recipe](#recipe-interactionlog) |
| `ExcelImporter` | Bulk data entry | Migration & setup | [📋 Recipe](#recipe-excelimporter) |

### ⚠️ **Banned Ingredients** (Don't Use These)
`badge` • `avatar` • `separator` • `skeleton` • `tooltip` • `collapsible` • `accordion` • `popover` • `progress` • `alert` • `hover-card` • `sheet`

*Why banned? They add complexity without supporting our 80% code reduction goal.*

---

## 👨‍🍳 Restaurant Training Manual (Workflow Scenarios)

### 🥇 **Level 1: New Server Training** (Core Flows)
**Goal**: Can users complete the main task?

#### Scenario A: "New Customer Walks In"
```
Customer → Contact Form → Organization Form → Welcome!
```
**Components Used**: `ContactForm` + `OrganizationForm`
**Success Metric**: Can complete in under 3 minutes

#### Scenario B: "Take Their Order" 
```
Browse → ProductCatalog → Add to Opportunity → Track Pipeline
```
**Components Used**: `ProductCatalog` + `OpportunityKanban`
**Success Metric**: Find products in under 30 seconds

#### Scenario C: "Follow Up Later"
```
Open Customer → InteractionLog → Add Note → Schedule Next Contact
```
**Components Used**: `InteractionLog` + Contact workflows
**Success Metric**: Log interaction in under 1 minute

### 🥈 **Level 2: Experienced Server** (Advanced Flows)
**Goal**: Would a new server understand it intuitively?

#### Scenario D: "Busy Restaurant Rush"
```
Quick Contact Creation → Bulk Product Selection → Multiple Opportunities
```
**Components Used**: Optimized forms + batch operations
**Success Metric**: Handle 5+ customers per hour

#### Scenario E: "Manager Review"
```
Pipeline Overview → Interaction History → Performance Metrics
```
**Components Used**: Dashboard + analytics components
**Success Metric**: Generate report in under 2 minutes

### 🥇 **Level 3: Restaurant Manager** (Expert Flows)
**Goal**: Would you be proud to show the owner?

#### Scenario F: "Import Customer Database"
```
ExcelImporter → Validation → Mapping → Bulk Creation
```
**Components Used**: `ExcelImporter` + error handling
**Success Metric**: Import 1000+ records with 95% success rate

---

# 📋 Recipe Cards (Detailed Component Documentation)

## Recipe: ContactForm

### 🥘 **What It Does**
Creates or edits customer contact information - like taking down a customer's details for reservations.

### 🧂 **Ingredients (Props)**
```typescript
interface ContactFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<Contact>
  onSubmit: (data: ContactFormData) => Promise<void>
  loading?: boolean
  organizationId?: string // Auto-link to company
}
```

### 👨‍🍳 **Cooking Instructions**
```typescript
// 1. Import your ingredients
import { ContactForm } from '@/components/contacts/ContactForm'
import { useCreateContact } from '@/hooks/useContacts'

// 2. Prepare your data
const { mutate: createContact, isLoading } = useCreateContact()

// 3. Cook it up!
<ContactForm
  mode="create"
  onSubmit={createContact}
  loading={isLoading}
  organizationId={selectedOrganization?.id}
/>
```

### 🍽️ **When to Serve**
- New customer registration
- Editing existing contact info
- Quick contact creation during calls
- After organization is created

### ⏱️ **Timing**
- **Load time**: <200ms
- **Fill time**: 30-60 seconds for user
- **Submit time**: <500ms

### 📱 **Mobile Considerations**
- All fields use 44px touch targets
- Auto-focuses first field
- Keyboard optimization for phone/email
- Swipe gestures for navigation

---

## Recipe: OrganizationForm

### 🥘 **What It Does**
Creates or edits company information - like setting up a corporate account with special terms.

### 🧂 **Ingredients (Props)**
```typescript
interface OrganizationFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<Organization>
  onSubmit: (data: OrganizationFormData) => Promise<void>
  loading?: boolean
  autoCreateContact?: boolean // Create primary contact too
}
```

### 👨‍🍳 **Cooking Instructions**
```typescript
// 1. Import and prepare
import { OrganizationForm } from '@/components/organizations/OrganizationForm'
import { useCreateOrganization } from '@/hooks/useOrganizations'

// 2. Set up your workflow
const { mutate: createOrg, isLoading } = useCreateOrganization()

const handleSubmit = async (data: OrganizationFormData) => {
  const newOrg = await createOrg(data)
  if (data.autoCreateContact) {
    // Redirect to contact form with org pre-filled
    navigate(`/contacts/new?organizationId=${newOrg.id}`)
  }
}

// 3. Serve it hot!
<OrganizationForm
  mode="create"
  onSubmit={handleSubmit}
  loading={isLoading}
  autoCreateContact={true}
/>
```

### 🍽️ **When to Serve**
- New business registration
- Corporate account setup
- Company information updates
- Before creating contacts (recommended flow)

---

## Recipe: OpportunityKanban

### 🥘 **What It Does**
Visual sales pipeline - like a kitchen board showing order status from "ordered" to "served".

### 🧂 **Ingredients (Props)**
```typescript
interface OpportunityKanbanProps {
  opportunities: Opportunity[]
  stages: PipelineStage[]
  onStageChange: (opportunityId: string, newStage: string) => Promise<void>
  onOpportunityClick: (opportunity: Opportunity) => void
  loading?: boolean
  allowDragDrop?: boolean
}
```

### 👨‍🍳 **Cooking Instructions**
```typescript
// 1. Get your data ready
import { OpportunityKanban } from '@/components/opportunities/OpportunityKanban'
import { useOpportunities, usePipelineStages } from '@/hooks/useOpportunities'

// 2. Prepare the pipeline
const { data: opportunities, isLoading } = useOpportunities()
const { data: stages } = usePipelineStages()
const { mutate: updateStage } = useUpdateOpportunityStage()

// 3. Handle the workflow
const handleStageChange = async (oppId: string, newStage: string) => {
  await updateStage({ opportunityId: oppId, stage: newStage })
  // Auto-log interaction
  logInteraction({
    type: 'stage_change',
    details: `Moved to ${newStage}`,
    opportunityId: oppId
  })
}

// 4. Serve your pipeline!
<OpportunityKanban
  opportunities={opportunities}
  stages={stages}
  onStageChange={handleStageChange}
  onOpportunityClick={(opp) => navigate(`/opportunities/${opp.id}`)}
  allowDragDrop={true}
/>
```

### 🍽️ **When to Serve**
- Daily sales review
- Pipeline management
- Deal progression tracking
- Team standup meetings

### 📱 **Mobile Magic**
- Touch-friendly drag & drop
- Horizontal scroll for stages
- Quick-action buttons
- Swipe gestures for details

---

## 🎓 Progressive Learning Path

### Week 1: Master the Basics
1. **Start**: `form` + `input` + `button` (basic contact creation)
2. **Add**: `select` + `card` (better organization)
3. **Polish**: `label` + `checkbox` (accessibility)

### Week 2: Build Workflows  
1. **Combine**: `ContactForm` → `OrganizationForm` flow
2. **Practice**: Different scenarios (new customer, edit info)
3. **Optimize**: Speed up your development time

### Week 3: Advanced Features
1. **Pipeline**: `OpportunityKanban` for visual management
2. **Logging**: `InteractionLog` for relationship tracking
3. **Integration**: Connect workflows together

### Week 4: Master Chef Level
1. **Bulk Operations**: `ExcelImporter` for data migration
2. **Custom Flows**: Build your own workflow combinations
3. **Performance**: Optimize for real-world usage

---

## 🚨 Common Mistakes & Solutions

### ❌ **The "Too Many Ingredients" Problem**
```typescript
// BAD: Over-complicated
<Card>
  <Badge>Required</Badge>
  <Tooltip content="Help text">
    <FormField>...</FormField>
  </Tooltip>
  <Alert>Validation message</Alert>
</Card>

// GOOD: Simple and effective
<Card>
  <FormField>
    <FormLabel>Field Name *</FormLabel>
    <Input />
    <FormMessage /> {/* Built-in error display */}
  </FormField>
</Card>
```

### ❌ **The "Desktop-Only" Problem**
```typescript
// BAD: Tiny touch targets
<Button size="sm" className="w-8 h-8">Save</Button>

// GOOD: Touch-friendly sizes
<Button className="min-h-[44px] px-4">Save Contact</Button>
```

### ❌ **The "Kitchen Nightmare" Problem**
```typescript
// BAD: Unclear workflow
<ContactForm onSubmit={...} />
<OrganizationForm onSubmit={...} />
// User confused: which first?

// GOOD: Clear progression
<MultiStepForm>
  <Step1 title="Company Information">
    <OrganizationForm onSubmit={handleOrgSubmit} />
  </Step1>
  <Step2 title="Primary Contact">
    <ContactForm organizationId={newOrgId} onSubmit={handleContactSubmit} />
  </Step2>
</MultiStepForm>
```

---

## 🎯 Success Metrics

### Developer Experience
- **Component Discovery**: Find what you need in <30 seconds
- **Implementation Speed**: Build forms 80% faster
- **Code Consistency**: Same patterns everywhere
- **Bug Reduction**: Fewer UI-related issues

### User Experience  
- **Task Completion**: Core workflows in <3 minutes
- **Error Recovery**: Clear guidance when things go wrong
- **Mobile Performance**: Smooth on iPad devices
- **Learning Curve**: New users productive in 1 day

---

## 📞 Need Help?

### Quick Questions
- Check the **Kitchen Inventory** for component availability
- Use **Recipe Cards** for implementation details
- Follow **Training Manual** for workflow guidance

### Complex Scenarios
- Review existing **Recipe Cards** for similar patterns
- Combine multiple components thoughtfully
- Test on iPad devices before finalizing
- Document new patterns you create

---

*Last Updated: [Current Date]*  
*Version: 1.0*  
*Next Review: [Monthly]*