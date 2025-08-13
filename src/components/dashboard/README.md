# Principal-Centric Dashboard Components

This directory contains the principal-centric dashboard implementation that focuses on relationship health and business intelligence rather than just deal values. The dashboard emphasizes relationship strength, engagement metrics, and partnership building.

## Component Architecture

### Atomic Components
- **HealthScoreBadge.vue** - Displays relationship health scores with visual indicators and detailed tooltips
- **ActivityMetric.vue** - Shows individual activity metrics with performance levels and trends

### Molecular Components
- **PrincipalHealthCard.vue** - Core dashboard card showing principal relationship health, metrics, and quick actions
- **ActivityFeedItem.vue** - Individual activity items with principal context and interaction capabilities
- **HealthAnalyticsChart.vue** - Visual charts for health trends and distribution analytics

### Organism Components
- **PrincipalDashboard.vue** - Main dashboard layout with overview metrics, health cards, and activity feed

## Relationship Health Algorithm

The dashboard implements a sophisticated relationship health scoring system:

### Health Score Calculation (0-100)
1. **Engagement Frequency (30%)** - Based on interaction count vs expected frequency
2. **Response Quality (25%)** - Response rate and engagement score from interactions
3. **Relationship Progression (25%)** - Growth in opportunities and distributor relationships
4. **Recency (20%)** - Time since last meaningful interaction

### Health Status Categories
- **Excellent (80-100)** - Strong, active relationships with consistent engagement
- **Good (65-79)** - Healthy relationships with regular interaction
- **Fair (50-64)** - Adequate relationships requiring some attention
- **Poor (35-49)** - Concerning relationships needing immediate action
- **Critical (0-34)** - At-risk relationships requiring urgent intervention

### Trending Analysis
- **Up** - Increasing interaction frequency and engagement
- **Down** - Declining activity or response rates
- **Stable** - Consistent activity levels

## Key Features

### 1. Health-First Metrics
- Relationship strength over deal value
- Engagement quality over quantity
- Partnership development focus
- Risk identification and prevention

### 2. Activity Aggregation
- Principal-focused activity grouping
- Cross-relationship insights
- Timeline analysis
- Follow-up tracking

### 3. Interactive Analytics
- Health trend visualization
- Distribution analysis
- Comparative insights
- Real-time updates

### 4. Actionable Insights
- Risk factor identification
- Strength highlighting
- Next action recommendations
- Follow-up scheduling

## Usage Example

```vue
<template>
  <PrincipalDashboard />
</template>

<script setup>
import PrincipalDashboard from '@/components/dashboard/organism/PrincipalDashboard.vue'
</script>
```

## Store Integration

The dashboard integrates with the `useDashboardStore` for:
- Health score calculations
- Activity feed aggregation
- Filter management
- Real-time updates

```typescript
const dashboardStore = useDashboardStore()

// Load dashboard data
await dashboardStore.loadDashboardData()

// Access health metrics
const { averageHealthScore, atRiskPrincipals } = dashboardStore
```

## Styling and Theme

The dashboard uses the professional color theme defined in `dashboard-theme.css`:
- Health status colors for visual coding
- Activity level indicators
- Trending direction colors
- Professional typography and spacing

## Responsive Design

All components are responsive and work across:
- Desktop (full layout)
- Tablet (adapted grid)
- Mobile (stacked layout)

## Accessibility Features

- ARIA labels and descriptions
- Color-coded with text alternatives
- Keyboard navigation support
- Screen reader optimization
- High contrast mode support

## Performance Considerations

- Virtual scrolling for large activity feeds
- Efficient chart rendering with SVG
- Optimistic updates for quick interactions
- Background data refresh
- Component lazy loading

## Extension Points

The dashboard is designed for easy extension:
- Additional health metrics
- Custom activity types
- Enhanced chart visualizations
- Integration with external data sources
- Custom filtering options

## Data Flow

1. **Store Initialization** - Dashboard store loads and processes data
2. **Health Calculation** - Algorithm computes relationship health scores
3. **Component Rendering** - UI components display processed data
4. **User Interaction** - Actions trigger store updates
5. **Real-time Updates** - Background refresh keeps data current

This dashboard implementation prioritizes relationship management and business intelligence, helping sales managers focus on building stronger partnerships rather than just tracking deal values.