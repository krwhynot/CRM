# Custom Enum Types

## contact_role
Defines the role a contact plays in the purchasing process within their organization.

- **decision_maker** - Has final authority to approve purchases
- **influencer** - Influences purchase decisions without final authority
- **buyer** - Responsible for procurement activities
- **end_user** - Will use the product/service being purchased
- **gatekeeper** - Controls access to decision makers
- **champion** - Advocates for your product/service internally

## interaction_type
Defines the type of communication or engagement with contacts.

- **call** - Phone conversation
- **email** - Email communication
- **meeting** - In-person or virtual meeting
- **demo** - Product demonstration
- **proposal** - Formal proposal presentation
- **follow_up** - Follow-up communication
- **trade_show** - Trade show or conference interaction
- **site_visit** - Visit to customer location
- **contract_review** - Contract or agreement review

## opportunity_priority
Defines the business priority level for opportunities.

- **low** - Low priority opportunity
- **medium** - Medium priority opportunity
- **high** - High priority opportunity
- **critical** - Critical priority opportunity

## opportunity_stage
Defines the current stage of an opportunity in the sales pipeline. Note: Contains both legacy and current values due to system migration.

**Current Values:**
- **lead** - Initial lead identification
- **qualified** - Lead has been qualified
- **proposal** - Proposal has been submitted
- **negotiation** - Contract negotiation in progress
- **closed_won** - Opportunity won
- **closed_lost** - Opportunity lost

**Legacy Values (maintained for data compatibility):**
- **New Lead** - Legacy: Initial lead identification
- **Initial Outreach** - Legacy: First contact made
- **Sample/Visit Offered** - Legacy: Sample or site visit offered
- **Awaiting Response** - Legacy: Waiting for customer response
- **Feedback Logged** - Legacy: Customer feedback received
- **Demo Scheduled** - Legacy: Product demo scheduled
- **Closed - Won** - Legacy: Opportunity won
- **Closed - Lost** - Legacy: Opportunity lost

## opportunity_status
Defines the current activity status of an opportunity. Note: Contains both legacy and current values due to system migration.

**Current Values:**
- **active** - Currently being pursued
- **on_hold** - Temporarily paused
- **nurturing** - Long-term relationship building
- **qualified** - Qualified and ready for active pursuit
- **closed_won** - Successfully closed
- **closed_lost** - Lost opportunity

**Legacy Values (maintained for data compatibility):**
- **Active** - Legacy: Currently being pursued
- **On Hold** - Legacy: Temporarily paused
- **Nurturing** - Legacy: Long-term relationship building
- **Qualified** - Legacy: Qualified and ready for active pursuit
- **Closed - Won** - Legacy: Successfully closed
- **Closed - Lost** - Legacy: Lost opportunity

## organization_type
Defines the business relationship type for organizations.

- **customer** - Current paying customer
- **principal** - Manufacturer or brand owner (supplier)
- **distributor** - Distribution partner
- **prospect** - Potential customer
- **vendor** - Service or supply vendor
- **unknown** - Unknown or undefined organization type

## priority_level
Generic priority classification used across multiple entities.

- **low** - Low priority
- **medium** - Medium priority
- **high** - High priority
- **critical** - Critical priority

## product_category
Defines the category classification for products in the food service industry.

- **beverages** - Drinks and beverage products
- **dairy** - Dairy products and alternatives
- **frozen** - Frozen food products
- **fresh_produce** - Fresh fruits and vegetables
- **meat_poultry** - Meat and poultry products
- **seafood** - Fish and seafood products
- **dry_goods** - Non-perishable dry goods
- **spices_seasonings** - Spices, herbs, and seasonings
- **baking_supplies** - Baking ingredients and supplies
- **cleaning_supplies** - Cleaning and sanitation products
- **paper_products** - Paper goods and disposables
- **equipment** - Kitchen and food service equipment