/**
 * Badge Migration Examples
 * 
 * This file demonstrates the complete migration from Badge components
 * to the new touch-optimized, accessible components.
 */

import React from 'react'
import { StatusIndicator } from '@/components/ui/status-indicator'
import { RequiredMarker } from '@/components/ui/required-marker'
import { PriorityIndicator } from '@/components/ui/priority-indicator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormLabel } from '@/components/ui/form'
import { Users, AlertTriangle, CheckCircle, X } from 'lucide-react'

export function BadgeMigrationExamples() {
  return (
    <div className="p-8 space-y-12">
      <h1 className="text-3xl font-bold">Badge Migration Examples</h1>

      {/* StatusIndicator Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">StatusIndicator Component</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Basic Variants</h3>
            <div className="flex flex-wrap gap-4">
              <StatusIndicator variant="default">Default</StatusIndicator>
              <StatusIndicator variant="secondary">Secondary</StatusIndicator>
              <StatusIndicator variant="success">Success</StatusIndicator>
              <StatusIndicator variant="warning">Warning</StatusIndicator>
              <StatusIndicator variant="destructive">Error</StatusIndicator>
              <StatusIndicator variant="outline">Outline</StatusIndicator>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Size Variants</h3>
            <div className="flex flex-wrap items-center gap-4">
              <StatusIndicator variant="success" size="sm">Small</StatusIndicator>
              <StatusIndicator variant="success" size="default">Default</StatusIndicator>
              <StatusIndicator variant="success" size="lg">Large</StatusIndicator>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Sidebar Navigation Examples</h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span>Contacts</span>
                <StatusIndicator variant="success" size="sm" ariaLabel="Primary workflow entry">
                  Primary Entry
                </StatusIndicator>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Principals</span>
                <StatusIndicator variant="secondary" size="sm">12</StatusIndicator>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Organizations</span>
                <StatusIndicator variant="warning" size="sm" className="flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  3
                </StatusIndicator>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Multi-Principal Opportunities</h3>
            <div className="space-y-2">
              <StatusIndicator variant="secondary" size="sm" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Multi-Principal
              </StatusIndicator>
            </div>
          </div>
        </div>
      </section>

      {/* RequiredMarker Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">RequiredMarker Component</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-3">Form Field Labels</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <FormLabel>
                  Email Address
                  <RequiredMarker />
                </FormLabel>
                <Input placeholder="Enter your email" />
              </div>
              
              <div>
                <FormLabel>
                  Password
                  <RequiredMarker ariaLabel="password field is required" />
                </FormLabel>
                <Input type="password" placeholder="Enter password" />
              </div>
              
              <div>
                <FormLabel>Phone Number</FormLabel>
                <Input placeholder="Optional field" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PriorityIndicator Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">PriorityIndicator Component</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Priority Levels</h3>
            <div className="flex flex-wrap gap-4">
              <PriorityIndicator priority="low" />
              <PriorityIndicator priority="medium" />
              <PriorityIndicator priority="high" />
              <PriorityIndicator priority="critical" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">With Labels</h3>
            <div className="space-y-3">
              <PriorityIndicator priority="low" showLabel={true} />
              <PriorityIndicator priority="medium" showLabel={true} />
              <PriorityIndicator priority="high" showLabel={true} />
              <PriorityIndicator priority="critical" showLabel={true} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Data Table Example</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2">Task</th>
                    <th className="pb-2">Priority</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr>
                    <td className="py-2">Update CRM database</td>
                    <td className="py-2">
                      <PriorityIndicator priority="critical" showLabel={true} />
                    </td>
                    <td className="py-2">
                      <StatusIndicator variant="warning">In Progress</StatusIndicator>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Review documentation</td>
                    <td className="py-2">
                      <PriorityIndicator priority="medium" showLabel={true} />
                    </td>
                    <td className="py-2">
                      <StatusIndicator variant="outline">Pending</StatusIndicator>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Update contact list</td>
                    <td className="py-2">
                      <PriorityIndicator priority="low" showLabel={true} />
                    </td>
                    <td className="py-2">
                      <StatusIndicator variant="success">Complete</StatusIndicator>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Touch-Optimized Controls */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Touch-Optimized Controls</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Button Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small (44px)</Button>
              <Button size="default">Default (48px)</Button>
              <Button size="lg">Large (56px)</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Input Sizes</h3>
            <div className="space-y-3 max-w-md">
              <Input size="sm" placeholder="Small input (44px)" />
              <Input size="default" placeholder="Default input (48px)" />
              <Input size="lg" placeholder="Large input (56px)" />
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Before/After Migration</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-3 text-red-600">❌ Before (Badge)</h3>
            <div className="space-y-3 p-4 bg-red-50 rounded-lg">
              <div className="text-sm opacity-75">
                {`<Badge variant="outline" className="text-xs">Primary Entry</Badge>`}
              </div>
              <div className="text-sm opacity-75">
                {`<Badge className="bg-blue-100 text-blue-700">12</Badge>`}
              </div>
              <div className="text-sm opacity-75">
                {`<Badge variant="destructive">Critical</Badge>`}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 text-green-600">✅ After (Specialized Components)</h3>
            <div className="space-y-3 p-4 bg-green-50 rounded-lg">
              <StatusIndicator variant="success" size="sm">Primary Entry</StatusIndicator>
              <StatusIndicator variant="secondary" size="sm">12</StatusIndicator>
              <PriorityIndicator priority="critical" showLabel={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Accessibility Features</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-3">WCAG 2.1 AA Compliance</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                44px minimum touch targets
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                4.5:1 contrast ratios
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Proper ARIA labels
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Keyboard navigation support
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Screen Reader Support</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <StatusIndicator 
                  variant="success" 
                  size="sm"
                  ariaLabel="Active system status"
                >
                  Active
                </StatusIndicator>
                <span className="text-sm text-gray-600">Announces: "Active system status"</span>
              </div>
              
              <div className="flex items-center gap-2">
                <RequiredMarker />
                <span className="text-sm text-gray-600">Announces: "required field"</span>
              </div>
              
              <div className="flex items-center gap-2">
                <PriorityIndicator priority="high" />
                <span className="text-sm text-gray-600">Announces: "High Priority"</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}