import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  semanticSpacing,
  semanticColors,
  semanticShadows,
  semanticRadius,
  semanticTypography
} from '@/styles/tokens'
import { useTemplates, useCreateTemplate, useForkTemplate } from '../hooks/useTemplates'
import type { LayoutConfiguration, LayoutEntityType } from '@/types/layout/schema.types'
import type { TemplateWithMetadata } from '../types/template.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Save,
  Template,
  Download,
  Upload,
  Star,
  Users,
  Globe,
  Lock,
  ChevronDown,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export interface TemplateIntegrationProps {
  /** Current layout configuration */
  currentLayout?: LayoutConfiguration
  /** Entity type for filtering templates */
  entityType: LayoutEntityType
  /** Callback when a template is applied */
  onApplyTemplate?: (template: TemplateWithMetadata) => void
  /** Callback when layout is saved as template */
  onTemplateSaved?: (template: any) => void
  /** Custom CSS classes */
  className?: string
}

/**
 * TemplateIntegration - Adds template functionality to Layout Builder
 *
 * Provides integration between the Layout Builder and template system:
 * - Save current layout as template
 * - Load templates from gallery
 * - Quick apply popular templates
 * - Template actions (fork, rate, share)
 *
 * @example
 * <TemplateIntegration
 *   currentLayout={layout}
 *   entityType="organizations"
 *   onApplyTemplate={handleApplyTemplate}
 * />
 */
export function TemplateIntegration({
  currentLayout,
  entityType,
  onApplyTemplate,
  onTemplateSaved,
  className,
}: TemplateIntegrationProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [saveFormData, setSaveFormData] = useState({
    name: '',
    description: '',
    category: 'custom' as const,
    visibility: 'private' as const,
  })

  // Hooks
  const { data: templatesData } = useTemplates({
    entityType,
    sortBy: 'rating_average',
    sortOrder: 'desc',
  })
  const createTemplate = useCreateTemplate()
  const forkTemplate = useForkTemplate()

  const templates = templatesData?.templates || []
  const popularTemplates = templates.slice(0, 3) // Top 3 templates

  // Handlers
  const handleSaveAsTemplate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentLayout) {
      toast({
        title: 'No layout to save',
        description: 'Please create a layout before saving as template',
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await createTemplate.mutateAsync({
        template: {
          name: saveFormData.name,
          description: saveFormData.description,
          category: saveFormData.category,
          entity_type: entityType,
          visibility: saveFormData.visibility,
        },
        layoutConfig: currentLayout,
      })

      toast({
        title: 'Template saved successfully',
        description: `"${saveFormData.name}" is now available in your templates`,
      })

      setShowSaveDialog(false)
      setSaveFormData({ name: '', description: '', category: 'custom', visibility: 'private' })
      onTemplateSaved?.(result)
    } catch (error) {
      toast({
        title: 'Failed to save template',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleApplyTemplate = (template: TemplateWithMetadata) => {
    onApplyTemplate?.(template)
    setShowLoadDialog(false)
    toast({
      title: 'Template applied',
      description: `Applied "${template.name}" to your layout`,
    })
  }

  const handleForkTemplate = async (template: TemplateWithMetadata) => {
    try {
      const result = await forkTemplate.mutateAsync({
        sourceTemplateId: template.id,
        name: `${template.name} (Copy)`,
        description: `Forked from ${template.name}`,
        visibility: 'private',
      })

      if (result.success && result.template) {
        toast({
          title: 'Template forked successfully',
          description: `Created your copy: ${template.name} (Copy)`,
        })
        // Could apply the forked template immediately if desired
      }
    } catch (error) {
      toast({
        title: 'Failed to fork template',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Quick Apply Popular Templates */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Template className="mr-2 size-4" />
            Templates
            <ChevronDown className="ml-2 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <div className="px-2 py-1.5">
            <div className="text-sm font-medium">Popular Templates</div>
            <div className="text-xs text-muted-foreground">Quick apply highly-rated templates</div>
          </div>
          <DropdownMenuSeparator />
          {popularTemplates.length > 0 ? (
            popularTemplates.map((template) => (
              <DropdownMenuItem
                key={template.id}
                onClick={() => handleApplyTemplate(template)}
                className="flex flex-col items-start space-y-1 px-3 py-2"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="truncate text-sm font-medium">{template.name}</span>
                  <div className="ml-2 flex items-center space-x-1">
                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{template.rating_average.toFixed(1)}</span>
                  </div>
                </div>
                {template.description && (
                  <span className="line-clamp-2 text-xs text-muted-foreground">
                    {template.description}
                  </span>
                )}
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="h-4 text-xs">
                    {template.category}
                  </Badge>
                  {template.visibility === 'public' ? (
                    <Globe className="size-3 text-green-600" />
                  ) : template.visibility === 'organization' ? (
                    <Users className="size-3 text-blue-600" />
                  ) : (
                    <Lock className="size-3 text-gray-600" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No templates available yet
            </div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowLoadDialog(true)}>
            <Download className="mr-2 size-4" />
            Browse All Templates
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save as Template */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={!currentLayout}>
            <Save className="mr-2 size-4" />
            Save Template
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save your current layout as a reusable template for future use
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAsTemplate} className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={saveFormData.name}
                onChange={(e) => setSaveFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name..."
                required
              />
            </div>

            <div>
              <Label htmlFor="template-description">Description (Optional)</Label>
              <Textarea
                id="template-description"
                value={saveFormData.description}
                onChange={(e) => setSaveFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this template is for..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select
                  value={saveFormData.category}
                  onValueChange={(value: any) => setSaveFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template-visibility">Visibility</Label>
                <Select
                  value={saveFormData.visibility}
                  onValueChange={(value: any) => setSaveFormData(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <div className="flex items-center">
                        <Lock className="mr-2 size-4" />
                        Private
                      </div>
                    </SelectItem>
                    <SelectItem value="organization">
                      <div className="flex items-center">
                        <Users className="mr-2 size-4" />
                        Organization
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center">
                        <Globe className="mr-2 size-4" />
                        Public
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!saveFormData.name.trim() || createTemplate.isPending}>
                {createTemplate.isPending ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Load Template Dialog - Simple version */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Template</DialogTitle>
            <DialogDescription>
              Choose a template to apply to your current layout
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-accent"
                onClick={() => handleApplyTemplate(template)}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <span className="truncate font-medium">{template.name}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{template.rating_average.toFixed(1)}</span>
                    </div>
                  </div>
                  {template.description && (
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  )}
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {template.usage_count} uses
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleForkTemplate(template)
                    }}
                  >
                    Fork
                  </Button>
                </div>
              </div>
            ))}
            {templates.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <Template className="mx-auto mb-2 size-12 opacity-50" />
                <p>No templates available for {entityType}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}