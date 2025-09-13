import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Play,
  Square,
  Copy,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  ChevronsUpDown,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  X,
  Settings,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  MoreHorizontal,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Heart,
  Share,
  Bell,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function ComponentShowcase() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(45)
  const [switchChecked, setSwitchChecked] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [radioValue, setRadioValue] = useState('option1')
  const [date, setDate] = React.useState<Date>()
  const [comboboxOpen, setComboboxOpen] = React.useState(false)
  const [comboboxValue, setComboboxValue] = React.useState('')

  const simulateLoading = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  const copyCode = (code: string, component: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied ${component} code to clipboard`)
  }

  const frameworks = [
    { value: 'next.js', label: 'Next.js' },
    { value: 'sveltekit', label: 'SvelteKit' },
    { value: 'nuxt.js', label: 'Nuxt.js' },
    { value: 'remix', label: 'Remix' },
    { value: 'astro', label: 'Astro' },
  ]

  const ButtonShowcase = () => (
    <Card>
      <CardHeader>
        <CardTitle>Buttons</CardTitle>
        <CardDescription>
          Interactive button components with various states and variants
        </CardDescription>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.lg}`}>
        {/* Button Variants */}
        <div>
          <h4 className={cn(semanticTypography.h4, 'mb-3')}>Variants</h4>
          <div className={cn(semanticSpacing.gap.sm, 'flex flex-wrap')}>
            <Button variant="default">Primary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        {/* Button Sizes */}
        <div>
          <h4 className={cn(semanticTypography.h4, 'mb-3')}>Sizes</h4>
          <div className={cn(semanticSpacing.gap.sm, 'flex flex-wrap items-center')}>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Button States */}
        <div>
          <h4 className={cn(semanticTypography.h4, 'mb-3')}>States</h4>
          <div className={cn(semanticSpacing.gap.sm, 'flex flex-wrap')}>
            <Button>Normal</Button>
            <Button disabled>Disabled</Button>
            <Button disabled={isLoading} onClick={simulateLoading}>
              {isLoading ? (
                <>
                  <div
                    className={cn(
                      semanticRadius.full,
                      semanticSpacing.rightGap.xs,
                      'animate-spin h-4 w-4 border-b-2 border-white'
                    )}
                  ></div>
                  Loading...
                </>
              ) : (
                'Click to Load'
              )}
            </Button>
          </div>
        </div>

        {/* With Icons */}
        <div>
          <h4 className={cn(semanticTypography.h4, 'mb-3')}>With Icons</h4>
          <div className={cn(semanticSpacing.gap.sm, 'flex flex-wrap')}>
            <Button>
              <Download className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
              Download
            </Button>
            <Button variant="outline">
              <Upload className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
              Upload
            </Button>
            <Button variant="destructive">
              <Trash2 className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
              Delete
            </Button>
            <Button variant="ghost">
              <Eye className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
              Preview
            </Button>
          </div>
        </div>

        <div className={`${semanticSpacing.topGap.sm}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyCode('<Button variant="default">Primary</Button>', 'Button')}
          >
            <Copy className={cn(semanticSpacing.rightGap.xs, 'h-3 w-3')} />
            Copy Button Code
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const BadgeShowcase = () => (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
        <CardDescription>Status indicators and labels for CRM entities</CardDescription>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.lg}`}>
        {/* Standard Variants */}
        <div>
          <h4 className={cn(semanticTypography.h4, 'mb-3')}>Standard Variants</h4>
          <div className={cn(semanticSpacing.gap.xs, 'flex flex-wrap')}>
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>

        {/* Priority Ratings */}
        <div>
          <h4 className={cn(semanticTypography.h4, 'mb-3')}>Priority Ratings</h4>
          <div className={cn(semanticSpacing.gap.xs, 'flex flex-wrap')}>
            <Badge priority="a-plus">A+ Priority</Badge>
            <Badge priority="a">A Priority</Badge>
            <Badge priority="b">B Priority</Badge>
            <Badge priority="c">C Priority</Badge>
            <Badge priority="d">D Priority</Badge>
          </div>
        </div>

        {/* Organization Types */}
        <div>
          <h4 className={cn(semanticTypography.h4, 'mb-3')}>Organization Types</h4>
          <div className={cn(semanticSpacing.gap.xs, 'flex flex-wrap')}>
            <Badge orgType="customer">Customer</Badge>
            <Badge orgType="distributor">Distributor</Badge>
            <Badge orgType="principal">Principal</Badge>
            <Badge orgType="supplier">Supplier</Badge>
          </div>
        </div>

        {/* Status Indicators */}
        <div>
          <h4 className={cn(semanticTypography.h4, 'mb-3')}>Status Indicators</h4>
          <div className={cn(semanticSpacing.gap.xs, 'flex flex-wrap')}>
            <Badge status="active">Active</Badge>
            <Badge status="pending">Pending</Badge>
            <Badge status="inactive">Inactive</Badge>
          </div>
        </div>

        <div className={`${semanticSpacing.topGap.sm}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyCode('<Badge priority="a-plus">A+ Priority</Badge>', 'Badge')}
          >
            <Copy className={cn(semanticSpacing.rightGap.xs, 'h-3 w-3')} />
            Copy Badge Code
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const FormShowcase = () => (
    <Card>
      <CardHeader>
        <CardTitle>Form Components</CardTitle>
        <CardDescription>Interactive form elements with validation states</CardDescription>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.lg}`}>
        {/* Input Fields */}
        <div className={`${semanticSpacing.stack.md}`}>
          <div className={`${semanticSpacing.stack.xs}`}>
            <Label htmlFor="text-input">Text Input</Label>
            <Input id="text-input" placeholder="Enter text here..." />
          </div>

          <div className={`${semanticSpacing.stack.xs}`}>
            <Label htmlFor="email-input">Email Input</Label>
            <Input id="email-input" type="email" placeholder="john@example.com" />
          </div>

          <div className={`${semanticSpacing.stack.xs}`}>
            <Label htmlFor="password-input">Password Input</Label>
            <Input id="password-input" type="password" placeholder="••••••••" />
          </div>

          <div className={`${semanticSpacing.stack.xs}`}>
            <Label htmlFor="disabled-input">Disabled Input</Label>
            <Input id="disabled-input" disabled value="This field is disabled" />
          </div>
        </div>

        <Separator />

        {/* Textarea */}
        <div className={`${semanticSpacing.stack.xs}`}>
          <Label htmlFor="textarea">Textarea</Label>
          <Textarea
            id="textarea"
            placeholder="Enter a detailed description..."
            className="min-h-[100px]"
          />
        </div>

        <Separator />

        {/* Select */}
        <div className={`${semanticSpacing.stack.xs}`}>
          <Label>Select Dropdown</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Checkbox and Switch */}
        <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 md:grid-cols-2')}>
          <div className={`${semanticSpacing.stack.sm}`}>
            <Label>Checkboxes</Label>
            <div className={`${semanticSpacing.stack.xs}`}>
              <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Checkbox
                  id="checkbox1"
                  checked={checkboxChecked}
                  onCheckedChange={(checked) => setCheckboxChecked(checked as boolean)}
                />
                <Label htmlFor="checkbox1">Accept terms and conditions</Label>
              </div>
              <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Checkbox id="checkbox2" />
                <Label htmlFor="checkbox2">Subscribe to newsletter</Label>
              </div>
              <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Checkbox id="checkbox3" disabled />
                <Label htmlFor="checkbox3">Disabled option</Label>
              </div>
            </div>
          </div>

          <div className={`${semanticSpacing.stack.sm}`}>
            <Label>Switch</Label>
            <div className={`${semanticSpacing.stack.xs}`}>
              <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Switch id="switch1" checked={switchChecked} onCheckedChange={setSwitchChecked} />
                <Label htmlFor="switch1">Enable notifications</Label>
              </div>
              <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Switch id="switch2" />
                <Label htmlFor="switch2">Dark mode</Label>
              </div>
              <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Switch id="switch3" disabled />
                <Label htmlFor="switch3">Disabled option</Label>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Radio Group */}
        <div className={`${semanticSpacing.stack.sm}`}>
          <Label>Radio Group</Label>
          <RadioGroup value={radioValue} onValueChange={setRadioValue}>
            <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
              <RadioGroupItem value="option1" id="r1" />
              <Label htmlFor="r1">Option 1</Label>
            </div>
            <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
              <RadioGroupItem value="option2" id="r2" />
              <Label htmlFor="r2">Option 2</Label>
            </div>
            <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
              <RadioGroupItem value="option3" id="r3" />
              <Label htmlFor="r3">Option 3</Label>
            </div>
          </RadioGroup>
        </div>

        <div className={`${semanticSpacing.topGap.sm}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyCode('<Input placeholder="Enter text..." />', 'Form Components')}
          >
            <Copy className={cn(semanticSpacing.rightGap.xs, 'h-3 w-3')} />
            Copy Form Code
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const DialogShowcase = () => (
    <Card>
      <CardHeader>
        <CardTitle>Dialogs & Modals</CardTitle>
        <CardDescription>Modal dialogs, alerts, and slide-out panels</CardDescription>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.md}`}>
        <div className={cn(semanticSpacing.gap.sm, 'flex flex-wrap')}>
          {/* Standard Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Organization</DialogTitle>
                <DialogDescription>
                  Enter the details for the new organization. This will create a new customer
                  record.
                </DialogDescription>
              </DialogHeader>
              <div className={cn(semanticSpacing.stack.md, semanticSpacing.cardY)}>
                <div className={`${semanticSpacing.stack.xs}`}>
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input id="org-name" placeholder="Premier Restaurant Group" />
                </div>
                <div className={`${semanticSpacing.stack.xs}`}>
                  <Label htmlFor="org-type">Organization Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                      <SelectItem value="principal">Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Organization</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Alert Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Item</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the organization and
                  remove all associated data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Organization Details</SheetTitle>
                <SheetDescription>View and edit organization information</SheetDescription>
              </SheetHeader>
              <div className={cn(semanticSpacing.stack.md, semanticSpacing.cardY)}>
                <div className={`${semanticSpacing.stack.xs}`}>
                  <Label>Organization Name</Label>
                  <Input value="Premier Restaurant Group" />
                </div>
                <div className={`${semanticSpacing.stack.xs}`}>
                  <Label>Contact Person</Label>
                  <Input value="John Smith" />
                </div>
                <div className={`${semanticSpacing.stack.xs}`}>
                  <Label>Priority Rating</Label>
                  <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                    <Badge priority="a-plus">A+</Badge>
                    <span className={cn(semanticTypography.body, 'text-muted-foreground')}>
                      Highest Priority
                    </span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className={`${semanticSpacing.topGap.sm}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              copyCode('<Dialog><DialogTrigger><Button>Open</Button></DialogTrigger>...', 'Dialog')
            }
          >
            <Copy className={cn(semanticSpacing.rightGap.xs, 'h-3 w-3')} />
            Copy Dialog Code
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const AlertShowcase = () => (
    <Card>
      <CardHeader>
        <CardTitle>Alerts & Notifications</CardTitle>
        <CardDescription>Status alerts and notification messages</CardDescription>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.md}`}>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            This is an informational alert with helpful context for the user.
          </AlertDescription>
        </Alert>

        <Alert className="border-warning/50 text-warning dark:border-warning [&>svg]:text-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            This is a warning alert indicating something needs attention.
          </AlertDescription>
        </Alert>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            This is an error alert indicating something went wrong.
          </AlertDescription>
        </Alert>

        <Alert className="border-success/50 text-success dark:border-success [&>svg]:text-success">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            This is a success alert confirming an action was completed.
          </AlertDescription>
        </Alert>

        <div className={`${semanticSpacing.stack.xs}`}>
          <h4 className={`${semanticTypography.h4}`}>Toast Notifications</h4>
          <div className={cn(semanticSpacing.gap.xs, 'flex flex-wrap')}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Success! Action completed.')}
            >
              Success Toast
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.error('Error! Something went wrong.')}
            >
              Error Toast
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Info: Here's some information.")}
            >
              Info Toast
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.warning('Warning: Please check this.')}
            >
              Warning Toast
            </Button>
          </div>
        </div>

        <div className={`${semanticSpacing.topGap.sm}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              copyCode(
                '<Alert><AlertTitle>Title</AlertTitle><AlertDescription>Description</AlertDescription></Alert>',
                'Alert'
              )
            }
          >
            <Copy className={cn(semanticSpacing.rightGap.xs, 'h-3 w-3')} />
            Copy Alert Code
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const DataShowcase = () => (
    <Card>
      <CardHeader>
        <CardTitle>Data Display</CardTitle>
        <CardDescription>Tables, progress indicators, and data components</CardDescription>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.lg}`}>
        {/* Progress */}
        <div className={`${semanticSpacing.stack.sm}`}>
          <div className="flex items-center justify-between">
            <Label>Progress Indicator</Label>
            <span className={cn(semanticTypography.body, 'text-muted-foreground')}>
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className={cn(semanticSpacing.gap.xs, 'flex')}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setProgress(Math.max(0, progress - 10))}
            >
              -10%
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setProgress(Math.min(100, progress + 10))}
            >
              +10%
            </Button>
          </div>
        </div>

        <Separator />

        {/* Table */}
        <div className={`${semanticSpacing.stack.sm}`}>
          <Label>Data Table</Label>
          <div className={cn(semanticRadius.large, 'border')}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className={`${semanticTypography.label}`}>
                    Premier Restaurant Group
                  </TableCell>
                  <TableCell>
                    <Badge orgType="customer">Customer</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge priority="a-plus">A+</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge status="active">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={`${semanticTypography.label}`}>
                    Healthy Foods Inc.
                  </TableCell>
                  <TableCell>
                    <Badge orgType="distributor">Distributor</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge priority="b">B</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge status="active">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={`${semanticTypography.label}`}>
                    Organic Suppliers Co.
                  </TableCell>
                  <TableCell>
                    <Badge orgType="supplier">Supplier</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge priority="c">C</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge status="pending">Pending</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <Separator />

        {/* Avatar */}
        <div className={`${semanticSpacing.stack.sm}`}>
          <Label>Avatars</Label>
          <div className={cn(semanticSpacing.inline.sm, 'flex items-center')}>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar className="h-10 w-10">
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <Avatar className="h-12 w-12">
              <AvatarFallback>MF</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <Separator />

        {/* Skeleton Loading */}
        <div className={`${semanticSpacing.stack.sm}`}>
          <Label>Loading Skeletons</Label>
          <div className={`${semanticSpacing.stack.xs}`}>
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>

        <div className={`${semanticSpacing.topGap.sm}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              copyCode(
                '<Table><TableHeader>...</TableHeader><TableBody>...</TableBody></Table>',
                'Table'
              )
            }
          >
            <Copy className={cn(semanticSpacing.rightGap.xs, 'h-3 w-3')} />
            Copy Table Code
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const AdvancedShowcase = () => (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Components</CardTitle>
        <CardDescription>Complex interactive components with rich functionality</CardDescription>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.lg}`}>
        {/* Calendar */}
        <div className={`${semanticSpacing.stack.sm}`}>
          <Label>Calendar</Label>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className={cn(semanticRadius.default, 'border')}
            />
          </div>
          {date && (
            <p className={cn(semanticTypography.body, 'text-muted-foreground text-center')}>
              Selected: {format(date, 'PPP')}
            </p>
          )}
        </div>

        <Separator />

        {/* Combobox */}
        <div className={`${semanticSpacing.stack.sm}`}>
          <Label>Combobox (Searchable Select)</Label>
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={comboboxOpen}
                className="w-[200px] justify-between"
              >
                {comboboxValue
                  ? frameworks.find((framework) => framework.value === comboboxValue)?.label
                  : 'Select framework...'}
                <ChevronsUpDown
                  className={cn(semanticSpacing.leftGap.xs, 'h-4 w-4 shrink-0 opacity-50')}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search framework..." />
                <CommandList>
                  <CommandEmpty>No framework found.</CommandEmpty>
                  <CommandGroup>
                    {frameworks.map((framework) => (
                      <CommandItem
                        key={framework.value}
                        value={framework.value}
                        onSelect={(currentValue) => {
                          setComboboxValue(currentValue === comboboxValue ? '' : currentValue)
                          setComboboxOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            semanticSpacing.rightGap.xs,
                            'h-4 w-4',
                            comboboxValue === framework.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {framework.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Separator />

        {/* Tooltip */}
        <div className={`${semanticSpacing.stack.sm}`}>
          <Label>Tooltips</Label>
          <div className={cn(semanticSpacing.inline.sm, 'flex')}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a helpful tooltip</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Additional information</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Separator />

        {/* Tabs */}
        <div className={`${semanticSpacing.stack.sm}`}>
          <Label>Tabs</Label>
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className={`${semanticSpacing.stack.xs}`}>
              <p className={cn(semanticTypography.body, 'text-muted-foreground')}>
                Manage your account information and preferences.
              </p>
              <div className={`${semanticSpacing.stack.xs}`}>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value="John Smith" />
              </div>
            </TabsContent>
            <TabsContent value="password" className={`${semanticSpacing.stack.xs}`}>
              <p className={cn(semanticTypography.body, 'text-muted-foreground')}>
                Change your password here.
              </p>
              <div className={`${semanticSpacing.stack.xs}`}>
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" />
              </div>
            </TabsContent>
            <TabsContent value="settings" className={`${semanticSpacing.stack.xs}`}>
              <p className={cn(semanticTypography.body, 'text-muted-foreground')}>
                Configure your application settings.
              </p>
              <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Switch id="notifications" />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className={`${semanticSpacing.topGap.sm}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              copyCode(
                '<Calendar mode="single" selected={date} onSelect={setDate} />',
                'Advanced Components'
              )
            }
          >
            <Copy className={cn(semanticSpacing.rightGap.xs, 'h-3 w-3')} />
            Copy Advanced Code
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`${semanticSpacing.stack.xl}`}>
      <Tabs defaultValue="buttons" className={`${semanticSpacing.stack.lg}`}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="dialogs">Dialogs</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons">
          <ButtonShowcase />
        </TabsContent>

        <TabsContent value="badges">
          <BadgeShowcase />
        </TabsContent>

        <TabsContent value="forms">
          <FormShowcase />
        </TabsContent>

        <TabsContent value="dialogs">
          <DialogShowcase />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertShowcase />
        </TabsContent>

        <TabsContent value="data">
          <DataShowcase />
        </TabsContent>
      </Tabs>

      {/* Advanced Components Tab */}
      <AdvancedShowcase />
    </div>
  )
}
