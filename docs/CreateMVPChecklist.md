# CreateMVPChecklist

Generates an MVP checklist from a migration plan, organized by the Vertical Scaling Workflow.

**📋 Tech Stack Note**: This checklist template is designed for React + TypeScript projects using shadcn/ui, React Hook Form, TanStack React Query, and Supabase. Code examples should follow React patterns, not Vue.js patterns.

## Usage

```bash
/CreateMVPChecklist @docs/UI/Contacts_UI_Migration_Plan.md
```

## Description

This command automates the generation of a structured, MVP-focused markdown checklist from a given migration plan document. It enforces confidence thresholds, reorganizes tasks by workflow stages, and separates future tasks.

## Command Logic

You are a project manager and technical writer tasked with creating a structured MVP checklist from a migration plan.

### Step 1: Accept Input File
- Accept the file path argument from `$ARGUMENTS`
- Parse the path to extract the plan document location

### Step 2: Parse and Analyze the Plan
- Read the content of the migration plan specified in the argument
- Extract all tasks, identifying their descriptions and confidence levels
- Look for patterns like "Confidence: X%" or similar confidence indicators

### Step 3: Enforce Confidence Threshold (>=85%)
For any task with confidence level **below 85%**:
- Use the `mcp__sequential-thinking__sequentialthinking` tool to break it down
- Query structure: "break down the task '[task description]' into smaller, actionable steps to increase implementation confidence."
- Replace the single low-confidence task with the more granular, higher-confidence sub-tasks returned

### Step 4: Reorganize by Workflow
Take the complete list of high-confidence tasks and organize them under the stages from the Vertical Scaling Workflow:

1. **Pre-Development Planning**
   - Feature Requirements Definition
   - Technical Planning

2. **Stage 1: Database Implementation**
   - Database Schema Design
   - Apply Database Migration
   - Generate TypeScript Types
   - Validation Checklist

3. **Stage 2: Type Definitions & Interfaces**
   - Create Feature-Specific Types
   - Create Custom React Hooks (if needed)

4. **Stage 3: React Query Implementation**
   - Create TanStack React Query hooks
   - Implement optimistic updates

5. **Stage 4: Component Implementation**
   - Create Form Component (React Hook Form + Yup)
   - Create List Component (shadcn/ui + TanStack Table)

6. **Stage 5: Route Integration**
   - Add New Routes (React Router DOM)
   - Create Page Component
   - Update Navigation (App Sidebar)

7. **Stage 6: Testing & Validation**
   - Manual Testing Checklist
   - User Acceptance Testing
   - Performance Testing

8. **Stage 7: Deployment & Documentation**
   - Production Deployment
   - User Documentation
   - Technical Documentation

### Step 5: Isolate Future Tasks
- Create a distinct section titled `## Future Tasks (Post-MVP)`
- Move any tasks explicitly marked as "OUT-OF-SCOPE" or "Future" into this section

### Step 6: Generate the Checklist File
- Create a new markdown file in the `/docs/checklists/` directory
- Derive filename from input plan (e.g., `Contacts_UI_Migration_Plan_Checklist.md`)
- Format content as markdown task list: `- [ ] [Task Description] (Confidence: X%)`

### Step 7: Include MVP Safety Protocol
- Add comprehensive safety framework based on Contact Management MVP Safety Protocol
- Include git checkpoint strategy with multi-layer branching
- Add stage-by-stage safety procedures and quality gates
- Include risk mitigation strategies and rollback procedures
- Add validation framework and architectural compliance checks

## Implementation

```javascript
// Extract the input file path from arguments
const inputPath = $ARGUMENTS.trim();
if (!inputPath.startsWith('@')) {
  throw new Error('Please provide a file path starting with @');
}

const filePath = inputPath.substring(1); // Remove @ prefix

// Read the migration plan
const planContent = await readFile(filePath);

// Parse tasks and confidence levels
const tasks = extractTasksWithConfidence(planContent);

// Process low-confidence tasks
const processedTasks = [];
for (const task of tasks) {
  if (task.confidence < 85) {
    const breakdown = await sequentialThinking(
      `break down the task '${task.description}' into smaller, actionable steps to increase implementation confidence.`
    );
    processedTasks.push(...breakdown.subtasks);
  } else {
    processedTasks.push(task);
  }
}

// Organize by workflow stages
const organizedTasks = organizeByWorkflow(processedTasks);

// Separate future tasks
const { mvpTasks, futureTasks } = separateFutureTasks(organizedTasks);

// Generate output filename
const baseName = path.basename(filePath, '.md');
const outputPath = `docs/checklists/${baseName}_Checklist.md`;

// Create checklist content
const checklistContent = generateChecklistMarkdown(mvpTasks, futureTasks);

// Write the checklist file
await writeFile(outputPath, checklistContent);
```

## Constraints & Guardrails

✅ **Workflow Adherence**: Final checklist structure **must** follow the Vertical Scaling Workflow order
✅ **Confidence Check is Mandatory**: No task with less than 85% confidence in main MVP list without breakdown attempt
✅ **Dynamic Filenaming**: Output filename automatically generated from input filename
🚫 **No Low-Confidence Tasks**: Final MVP section should not contain tasks with confidence < 85%

## Expected Output Format

```markdown
# [Plan Name] MVP Checklist

## Pre-Development Planning

### Feature Requirements Definition
- [ ] Define user story and business value (Confidence: 90%)
- [ ] Establish success criteria (Confidence: 85%)

### Technical Planning
- [ ] Assess database changes needed (Confidence: 95%)
- [ ] Plan API modifications (Confidence: 88%)

## Stage 1: Database Implementation

### Database Schema Design
- [ ] Create migration script (Confidence: 92%)
- [ ] Define RLS policies (Confidence: 87%)

[... continues through all workflow stages ...]

## Future Tasks (Post-MVP)
- [ ] Advanced analytics integration (OUT-OF-SCOPE)
- [ ] Third-party API integration (Future enhancement)
```

## Error Handling

- Validate input file exists and is readable
- Handle missing confidence levels (default to requiring breakdown)
- Ensure all workflow stages are represented in output
- Validate output directory exists before writing