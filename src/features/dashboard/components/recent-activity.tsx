import { ActivityFeed } from "./ActivityFeed"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  CardCompact,
  CardCompactContent,
  CardCompactHeader,
  CardCompactTitle,
} from "@/components/ui/new/CardCompact"
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

  // Feature flag for new MFB compact styling (default: enabled, opt-out with 'false')
  const USE_NEW_STYLE = localStorage.getItem('useNewStyle') !== 'false';

  const isLoading = orgLoading || contactLoading || oppLoading || prodLoading

  const CardWrapper = USE_NEW_STYLE ? CardCompact : Card;
  const HeaderWrapper = USE_NEW_STYLE ? CardCompactHeader : CardHeader;
  const TitleWrapper = USE_NEW_STYLE ? CardCompactTitle : CardTitle;
  const ContentWrapper = USE_NEW_STYLE ? CardCompactContent : CardContent;

  if (isLoading) {
    return (
      <CardWrapper className="hover:shadow-md transition-shadow">
        <HeaderWrapper className="pb-3">
          <TitleWrapper className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recently Added
          </TitleWrapper>
        </HeaderWrapper>
        <ContentWrapper>
          <div className={USE_NEW_STYLE ? "space-y-compact" : "space-y-3"}>
            {[...Array(4)].map((_, index) => (
              <div key={index} className={USE_NEW_STYLE ? "flex items-start gap-2 p-1" : "flex items-start gap-3 p-2"}>
                <Skeleton className="h-4 w-4 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </ContentWrapper>
      </CardWrapper>
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
    <CardWrapper className="hover:shadow-md transition-shadow">
      <HeaderWrapper className="pb-3">
        <TitleWrapper className="text-sm font-semibold flex items-center gap-2">
          <Target className="h-4 w-4" />
          Recently Added
        </TitleWrapper>
      </HeaderWrapper>
      <ContentWrapper>
        {recentItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent additions</p>
          </div>
        ) : (
          <div className={`${USE_NEW_STYLE ? "space-y-compact max-h-60" : "space-y-3 max-h-64"} overflow-y-auto`}>
            {recentItems.map((item, index) => (
              <div key={index} className={`flex items-start ${USE_NEW_STYLE ? "gap-2 p-1.5" : "gap-3 p-2"} rounded-lg hover:bg-muted/50 cursor-pointer transition-colors`}>
                <item.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm truncate ${USE_NEW_STYLE ? "font-semibold text-[hsl(var(--foreground))]" : "font-medium"}`}>{item.name}</p>
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
      </ContentWrapper>
    </CardWrapper>
  )
}

export function RecentActivity() {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 laptop:grid-cols-2">
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