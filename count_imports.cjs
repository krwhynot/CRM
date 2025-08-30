const fs = require('fs');

const searchResults = `Found 244 results.

src/components/forms/entity-select/EntitySelectSearchBox.tsx
│----
│import React from 'react'
│import { Button } from "@/components/ui/button"
│import { Search, X } from 'lucide-react'
│----

src/components/forms/FormSubmitButton.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Loader2 } from 'lucide-react'
│----

src/components/forms/core-form/FormSubmitActions.tsx
│----
│import { Button } from '@/components/ui/button'
│
│import React, { useState } from 'react'
│----

src/components/forms/ProgressiveDetails.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Card, CardContent } from '@/components/ui/card'
│import { Moon, Sun } from "lucide-react"
│----

src/components/theme-toggle.tsx
│----
│import { FieldValues, UseFormReturn } from 'react-hook-form'
│import { Button } from "@/components/ui/button"
│import { useTheme } from "./theme-provider"
│----

src/components/forms/core-form/OptionalSectionsRenderer.tsx
│----
│import { Button } from '@/components/ui/button'
│import { FormSectionComponent } from '../FormSectionComponent'
│import { PageHeader } from '@/components/ui/new/PageHeader'
│----

src/components/templates/EntityManagementTemplate.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { Plus } from 'lucide-react'
│----

src/components/error-boundaries/QueryErrorBoundary.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
│} from "./sidebar.constants"
│----

src/components/ui/sidebar.tsx
│----
│import { Button } from "@/components/ui/button"
│import { Input } from "@/components/ui/input"
│----

src/pages/StyleGuideTest.tsx
│----
│import { Button } from '@/components/ui/button';
│// import { ButtonNew } from '@/components/ui/new/Button'; // Removed during component consolidation
│import { ArrowLeft, Users } from 'lucide-react'
│----

src/pages/MultiPrincipalOpportunity.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
│import { Card, CardContent } from '@/components/ui/card'
│----

src/features/monitoring/components/HealthDashboard.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { useHealthStatus } from '@/lib/monitoring'
│----

src/features/products/components/ProductActions.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { Pencil, Eye, Phone } from 'lucide-react'
│----

src/features/products/components/ProductsFilters.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Input } from '@/components/ui/input'
│import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
│----

src/features/products/components/ProductForm.tsx
│----
│import { TableCell, TableRow } from '@/components/ui/table'
│import { Button } from '@/components/ui/button'
│import { Textarea } from '@/components/ui/textarea'
│----

src/features/products/components/product-row/ProductRowMain.tsx
│----
│import React, { useRef, useCallback } from 'react'
│import { Button } from '@/components/ui/button'
│import { Checkbox } from '@/components/ui/checkbox'
│----

src/features/import-export/components/FileUploadArea.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Progress } from '@/components/ui/progress'
│----

src/features/import-export/components/ImportProgress.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Progress } from '@/components/ui/progress'
│import { Alert, AlertDescription } from '@/components/ui/alert'
│----

src/features/import-export/components/export/ExportResults.tsx
│----
│import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
│import { Button } from '@/components/ui/button'
│import type { ExportProgress } from '@/features/import-export/hooks/useExportExecution'
│----

src/features/import-export/wizard/components/SmartImportWizard.tsx
│----
│import React, { useEffect } from 'react'
│import { Button } from '@/components/ui/button'
│import { Progress } from '@/components/ui/progress'
│----

src/features/import-export/wizard/components/SmartImportOrchestrator.tsx
│----
│import React, { useState, useCallback, useRef } from 'react'
│import { Button } from '@/components/ui/button'
│import { Alert, AlertDescription } from '@/components/ui/alert'
│----

src/features/import-export/components/TemplateMatchingImport.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
│import { Card, CardContent } from '@/components/ui/card'
│----

src/features/import-export/components/export/ExportAction.tsx
│----
│import { Button } from '@/components/ui/button'
│import type { ExportOptions } from '@/features/import-export/hooks/useExportConfiguration'
│import { Alert, AlertDescription } from '@/components/ui/alert'
│----

src/features/import-export/components/export/ExportError.tsx
│----
│import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
│import { Button } from '@/components/ui/button'
│import type { ExportProgress } from '@/features/import-export/hooks/useExportExecution'
│----

src/features/import-export/wizard/components/SmartFieldMapping.tsx
│----
│import { Card, CardContent } from '@/components/ui/card'
│import { Button } from '@/components/ui/button'
│import { Badge } from '@/components/ui/badge'
│----

src/features/import-export/wizard/components/SmartUploadStep.tsx
│----
│import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
│import { Button } from '@/components/ui/button'
│import { Badge } from '@/components/ui/badge'
│----

src/features/import-export/wizard/components/SmartPreviewStep.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Badge } from '@/components/ui/badge'
│} from '@/components/ui/dropdown-menu'
│----

src/features/auth/components/UserMenu.tsx
│----
│import { useNavigate } from 'react-router-dom'
│import { Button } from '@/components/ui/button'
│import { Avatar, AvatarFallback } from '@/components/ui/avatar'
│----

src/features/auth/components/reset-password/ErrorState.tsx
│----
│import { useNavigate } from 'react-router-dom'
│import { Button } from '@/components/ui/button'
│import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
│----

src/features/auth/components/reset-password/ResetPasswordForm.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Input } from '@/components/ui/input'
│----

src/features/auth/components/form-components/PasswordInput.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Input } from '@/components/ui/input'
│import { useAuth } from '@/contexts/AuthContext'
│----

src/features/auth/components/LoginForm.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Input } from '@/components/ui/input'
│----

src/features/auth/components/SignUpForm.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Input } from '@/components/ui/input'
│import { useAuth } from '@/contexts/AuthContext'
│----

src/features/auth/components/ForgotPasswordForm.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Input } from '@/components/ui/input'
│} from '@/components/ui/dropdown-menu'
│----

src/features/interactions/components/table/InteractionActionsDropdown.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react'
│----

src/features/interactions/components/table/InteractionTableHeader.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Input } from '@/components/ui/input'
│import { cn } from '@/lib/utils'
│----

src/features/interactions/components/timeline-item/InteractionTimelineHeader.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Badge } from '@/components/ui/badge'
│import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
│----

src/features/interactions/components/InteractionForm.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { Textarea } from '@/components/ui/textarea'
│----

src/features/interactions/components/timeline/TimelineItems.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { ChevronDown, ChevronUp } from 'lucide-react'
│----

src/features/organizations/components/BulkActionsToolbar.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { Trash2, X, CheckSquare, Square } from 'lucide-react'
│----

src/features/organizations/components/OrganizationsFilters.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { Input } from '@/components/ui/input'
│----

src/features/organizations/components/OrganizationsDataDisplay.tsx
│----
│import { Button } from '@/components/ui/button'
│import { OrganizationsTable } from './OrganizationsTable'
│import { Card, CardContent, CardHeader, CardTitle }
│----

src/features/organizations/components/OrganizationForm.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { Textarea } from '@/components/ui/textarea'
│----

src/features/organizations/components/OrganizationActions.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { Pencil, Phone, Eye } from 'lucide-react'
│----

src/features/organizations/components/OrganizationsPageHeader.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { PageHeader } from '@/components/ui/new/PageHeader'
│----

src/features/interactions/components/timeline/TimelineEmptyState.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Activity, Plus } from 'lucide-react'
│import { CardHeader, CardTitle } from '@/components/ui/card'
│----

src/features/interactions/components/timeline/TimelineHeader.tsx
│----
│import { TableCell, TableRow } from '@/components/ui/table'
│import { Button } from '@/components/ui/button'
│import { Badge } from '@/components/ui/badge'
│----

src/features/organizations/components/organization-row/OrganizationRowMain.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { Checkbox } from '@/components/ui/checkbox'
│----

src/features/opportunities/components/OpportunitiesPageHeader.tsx
│----
│import { Button } from '@/components/ui/button'
│import { PageHeader } from '@/components/ui/new/PageHeader'
│} from '@/components/ui/dropdown-menu'
│----

src/features/opportunities/components/OpportunitiesTableActions.tsx
│----
│import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
│import { Button } from '@/components/ui/button'
│import {
│----

src/features/opportunities/components/OpportunityForm.tsx
│----
│import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
│import { Button } from '@/components/ui/button'
│import { Textarea } from '@/components/ui/textarea'
│----

src/features/opportunities/components/OpportunityDetailCard.tsx
│----
│import { TableRow, TableCell } from '@/components/ui/table'
│import { Button } from '@/components/ui/button'
│import { X } from 'lucide-react'
│----

src/features/opportunities/components/OpportunityRowDetails.tsx
│----
│import { Loader2 } from 'lucide-react'
│import { Button } from '@/components/ui/button'
│import { Badge } from '@/components/ui/badge'
│----

src/features/opportunities/components/multi-principal-form/OpportunityFormActions.tsx
│----
│
│import { Button } from '@/components/ui/button'
│import { Alert, AlertDescription } from '@/components/ui/alert'
│----

src/features/dashboard/components/QuickActions.tsx
│----
│import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
│import { Button } from "@/components/ui/button"
│
│----

src/features/dashboard/components/EmptyState.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { Building2, TrendingUp, Activity } from 'lucide-react'
│----

src/features/contacts/components/ContactActions.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Pencil, Phone, Eye } from 'lucide-react'
│import { TableRow, TableCell } from '@/components/ui/table'
│----

src/features/contacts/components/ContactRow.tsx
│----
│import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
│import { Button } from '@/components/ui/button'
│import { ChevronDown, ChevronRight } from 'lucide-react'
│----

src/features/contacts/components/EnhancedContactForm.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
│----

src/features/contacts/components/ContactsDataDisplay.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { ContactsTable } from './ContactsTable'
│----

src/features/contacts/components/ContactsPageHeader.tsx
│----
│import React from 'react'
│import { Button } from '@/components/ui/button'
│import { PageHeader } from '@/components/ui/new/PageHeader'
│----

src/features/opportunities/components/WizardNavigation.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Progress } from '@/components/ui/progress'
│import { X, Filter } from 'lucide-react'
│----

src/features/dashboard/components/activity/ActivityFilters.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
│import { Badge } from '@/components/ui/badge'
│----

src/features/dashboard/components/activity/ActivityGroup.tsx
│----
│import { TableCell } from '@/components/ui/table'
│import { Button } from '@/components/ui/button'
│import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
│----

src/features/contacts/components/contact-row/ContactActions.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Pencil, Eye, Phone } from 'lucide-react'
│import { Badge } from '@/components/ui/badge'
│----

src/features/contacts/components/PreferredPrincipalsSelect.tsx
│----
│import { StatusIndicator } from "@/components/ui/status-indicator"
│import { Button } from '@/components/ui/button'
│import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
│----

src/features/dashboard/components/PrincipalsDashboard.tsx
│----
│import { Button } from '@/components/ui/button'
│import { usePrincipals } from '@/features/organizations/hooks/useOrganizations'
│----

src/features/dashboard/components/DashboardFilters.tsx
│----
│import { Button } from "@/components/ui/button"
│import { Card, CardContent } from "@/components/ui/card"
│import React from 'react'
│----

src/features/dashboard/components/activity-enhanced/ActivityFilters.tsx
│----
│import React, { useState, useMemo } from 'react'
│import { Button } from '@/components/ui/button'
│
│----

src/features/dashboard/components/SimpleActivityFeed.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
│
│----

src/features/dashboard/components/dashboard-header.tsx
│----
│import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
│import { Button } from "@/components/ui/button"
│import {
│----

src/features/dashboard/components/EnhancedActivityFeed.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Activity, RefreshCw } from 'lucide-react'
│import { Badge } from '@/components/ui/badge'
│----

src/features/dashboard/components/ActivityFeed.tsx
│----
│import { Bell, Search } from "lucide-react"
│import { Button } from '@/components/ui/button'
│import { Separator } from '@/components/ui/separator'
│----

src/layout/components/Header.tsx
│----
│import { Button } from "@/components/ui/button"
│import {
│----

src/features/contacts/components/ContactsFilters.tsx
│----
│import { Button } from '@/components/ui/button'
│import { Input } from '@/components/ui/input'
│----
`;

const componentCounts = {};
const componentContexts = {};

const componentNames = [
    'Alert', 'AlertDialog', 'Avatar', 'Badge', 'Breadcrumb', 'Button', 'Card', 'ChartContainer',
    'Checkbox', 'Collapsible', 'Command', 'Dialog', 'DropdownMenu', 'Form', 'Input', 'Label',
    'LoadingSpinner', 'PageHeader', 'Popover', 'PriorityBadge', 'PriorityIndicator', 'Progress',
    'RadioGroup', 'RequiredMarker', 'ScrollArea', 'Select', 'Separator', 'Sheet', 'Sidebar',
    'SimpleTable', 'Skeleton', 'Toaster', 'StandardDialog', 'StatusIndicator', 'Table', 'Tabs',
    'Textarea', 'Tooltip'
];

const lines = searchResults.split('\n');
let currentFile = '';

for (const line of lines) {
    if (line.startsWith('src/')) {
        currentFile = line.split(' ')[0];
    } else if (line.includes('import') && line.includes('@/components/ui/')) {
        for (const component of componentNames) {
            const regex = new RegExp(`\\{\\s*.*?${component}.*?\\s*\\}`);
            if (regex.test(line)) {
                componentCounts[component] = (componentCounts[component] || 0) + 1;
                if (!componentContexts[component]) {
                    componentContexts[component] = new Set();
                }
                // Extract feature/page context
                const match = currentFile.match(/src\/(pages|features)\/([^\/]+)/);
                if (match) {
                    componentContexts[component].add(`${match[1]}/${match[2]}`);
                } else if (currentFile.startsWith('src/components/')) {
                    componentContexts[component].add('components');
                }
            }
        }
    }
}

// Sort components by count in descending order
const sortedComponents = Object.entries(componentCounts).sort(([, countA], [, countB]) => countB - countA);

console.log("### 7) Usage Heatmap (top components)\n");
console.log("| Component | Import count | Common contexts (pages/features) |");
console.log("|---|---|---|");

for (const [component, count] of sortedComponents) {
    const contexts = Array.from(componentContexts[component] || []).join(', ');
    console.log(`| \`${component}\` | ${count} | ${contexts || 'N/A'} |`);
}
