export { Container } from './Container'
export { PageContainer } from './PageContainer'
export { PageLayout, PageLayoutHeader, PageLayoutContent } from './PageLayout'
export { SlotHeader, SlotHeaderTitle, SlotHeaderActions } from './SlotHeader'
export { FilterSlot, FilterSlotDesktop, FilterSlotMobile, FilterContentWrapper } from './FilterSlot'

// Composite slot components
export {
  ActionGroup,
  createAction,
  MetaBadge,
  createMeta,
  FilterGroup,
  createFilterGroup,
} from './slots'
export {
  TemplateAdapter,
  EntityManagementTemplate,
  OrganizationManagementTemplate,
  ContactManagementTemplate,
  ProductManagementTemplate,
  OpportunityManagementTemplate,
  useTemplatePropsTransform,
} from './TemplateAdapter'

// Type exports
export type {
  PageLayoutProps,
  PageLayoutHeaderProps,
  PageLayoutContentProps,
} from './PageLayout.types'
export type {
  SlotHeaderProps,
  SlotHeaderTitleProps,
  SlotHeaderActionsProps,
} from './SlotHeader.types'
export type {
  FilterSlotProps,
  FilterSlotDesktopProps,
  FilterSlotMobileProps,
  FilterContentWrapperProps,
} from './FilterSlot.types'

// Composite slot component types
export type {
  ActionGroupProps,
  ActionItem,
  MetaBadgeProps,
  MetaItem,
  FilterGroupProps,
  FilterGroupItem,
  FilterControl,
} from './slots'
export type {
  TemplateAdapterProps,
  TemplateAdapterConfig,
  EntityManagementTemplateProps,
  OrganizationManagementTemplateProps,
  ContactManagementTemplateProps,
  ProductManagementTemplateProps,
  OpportunityManagementTemplateProps,
} from './TemplateAdapter.types'
