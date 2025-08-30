import { ActivityFeed } from "./ActivityFeed"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Target, Building2, User, Package } from "lucide-react"
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations"
import { useContacts } from "@/features/contacts/hooks/useContacts"
import { useOpportunities } from "@/features/opportunities/hooks/useOpportunities"
import { useProducts } from "@/features/products/hooks/useProducts"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

function RecentlyAddedCard() {
  const { data: organizations = [], isLoading: orgLoading } = useOrganizations()
  const { data: contacts = [], isLoading: contactLoading } = useContacts()
  const { data: opportunities = [], isLoading: oppLoading } = useOpportunities()
  const { data: products = [], isLoading: prodLoading } = useProducts()

  const isLoading = orgLoading || contactLoading || oppLoading || prodLoading

  if (isLoading) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Target className="size-4" />
            Recently Added
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-start gap-3 p-2">
                <Skeleton className="mt-0.5 size-4" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="mb-1 h-4 w-32" />
                  <Skeleton className="mb-1 h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get recently added items (last 7 days) and sort by creation date
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const recentItems = [
    ...organizations
      .filter(org => org.created_at && new Date(org.created_at) >= oneWeekAgo)
      .map(org => ({
        type: "organization",
        name: org.name,
        category: org.type === 'principal' ? "Principal" : org.type === 'distributor' ? "Distributor" : "Organization",
        created_at: org.created_at!,
        status: org.is_active ? "active" : "inactive",
        icon: Building2,
      })),
    ...contacts
      .filter(contact => contact.created_at && new Date(contact.created_at) >= oneWeekAgo)
      .map(contact => ({
        type: "contact",
        name: `${contact.first_name} ${contact.last_name}`,
        category: "Contact",
        created_at: contact.created_at!,
        status: contact.is_primary_contact ? "primary" : "active",
        icon: User,
      })),
    ...opportunities
      .filter(opp => opp.created_at && new Date(opp.created_at) >= oneWeekAgo)
      .map(opp => ({
        type: "opportunity",
        name: opp.name,
        category: "Opportunity",
        created_at: opp.created_at!,
        status: opp.stage?.toLowerCase().replace(' ', '_') || "new_lead",
        icon: Target,
      })),
    ...products
      .filter(product => product.created_at && new Date(product.created_at) >= oneWeekAgo)
      .map(product => ({
        type: "product",
        name: product.name,
        category: "Product",
        created_at: product.created_at!,
        status: "active",
        icon: Package,
      })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8) // Show only the 8 most recent items

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case "active":
      case "primary":
        return "default"
      case "new_lead":
      case "qualified":
        return "secondary"
      case "prospect":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Target className="size-4" />
          Recently Added
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentItems.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Target className="mx-auto mb-2 size-8 opacity-50" />
            <p>No recent additions</p>
          </div>
        ) : (
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {recentItems.map((item, index) => (
              <div key={index} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                <item.icon className="mt-0.5 size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs">
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function RecentActivity() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 laptop:grid-cols-2">
      <ActivityFeed 
        limit={10} 
        showFilters={true} 
        enableRealTime={true}
        className="h-full"
      />
      <RecentlyAddedCard />
    </div>
  )
}