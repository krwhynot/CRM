# RLS Policies

## contact_preferred_principals

### Users can create contact advocacy relationships for accessible 
- **Command**: INSERT
- **With Check**: User has access to contact's organization AND target is a principal organization

### Users can delete contact advocacy relationships they have acces
- **Command**: DELETE  
- **Using**: User created the record OR has access to the contact's organization

### Users can update contact advocacy relationships they have acces
- **Command**: UPDATE
- **Using**: User created the record OR has access to the contact's organization
- **With Check**: Target organization is a principal

### Users can view contact advocacy relationships they have access 
- **Command**: SELECT
- **Using**: User has access to the contact's organization OR created the record

## contacts

### contacts_delete_policy
- **Command**: DELETE
- **Using**: user_is_admin() OR created_by = auth.uid() OR user_has_org_access(organization_id)

### contacts_insert_policy
- **Command**: INSERT
- **With Check**: created_by = auth.uid() AND user_has_org_access(organization_id)

### contacts_select_policy
- **Command**: SELECT
- **Using**: user_is_admin() OR created_by = auth.uid() OR user_has_org_access(organization_id)

### contacts_update_policy
- **Command**: UPDATE
- **Using**: user_is_admin() OR created_by = auth.uid() OR user_has_org_access(organization_id)
- **With Check**: updated_by = auth.uid() AND user_has_org_access(organization_id)

## interactions

### interactions_delete_policy
- **Command**: DELETE
- **Using**: user_is_admin() OR created_by = auth.uid() OR user_has_org_access(organization_id)

### interactions_insert_policy
- **Command**: INSERT
- **With Check**: User created AND has access to related organization/opportunity

### interactions_select_policy
- **Command**: SELECT
- **Using**: user_is_admin() OR created_by = auth.uid() OR user_has_org_access(organization_id) OR has access via opportunity

### interactions_update_policy
- **Command**: UPDATE
- **Using**: user_is_admin() OR created_by = auth.uid() OR user_has_org_access(organization_id) OR has access via opportunity
- **With Check**: updated_by = auth.uid()

## opportunities

### opportunities_delete_policy
- **Command**: DELETE
- **Using**: user_is_admin() OR created_by = auth.uid() OR user_has_org_access(organization_id)

### opportunities_insert_policy
- **Command**: INSERT
- **With Check**: User created AND has access to organization, principal, and distributor

### opportunities_select_policy
- **Command**: SELECT
- **Using**: user_is_admin() OR created_by = auth.uid() OR user_has_org_access via organization/principal/distributor

### opportunities_update_policy
- **Command**: UPDATE
- **Using**: user_is_admin() OR created_by = auth.uid() OR user_has_org_access via organization/principal/distributor
- **With Check**: updated_by = auth.uid() AND user_has_org_access(organization_id)

## opportunity_products

### opportunity_products_delete_policy
- **Command**: DELETE
- **Using**: User has access to the opportunity

### opportunity_products_insert_policy
- **Command**: INSERT
- **With Check**: User has access to both opportunity AND product

### opportunity_products_select_policy
- **Command**: SELECT
- **Using**: User has access to opportunity OR product

### opportunity_products_update_policy
- **Command**: UPDATE
- **Using**: User has access to the opportunity
- **With Check**: User has access to the opportunity

## opportunity_participants

### select participants via accessible opps
- **Command**: SELECT
- **Role**: public
- **Using**: User can view participants for opportunities they have access to
- **Logic**: 
  ```sql
  EXISTS (
    SELECT 1 FROM opportunities o 
    WHERE o.id = opportunity_participants.opportunity_id 
    AND (user_is_admin() OR o.created_by = auth.uid() OR user_has_org_access(o.organization_id))
  )
  ```

### write participants via accessible opps
- **Command**: INSERT
- **Role**: authenticated
- **With Check**: User can add participants to opportunities they have access to
- **Logic**: Same as SELECT policy - user must have access to the opportunity

### update/delete participants via accessible opps
- **Command**: UPDATE
- **Role**: authenticated
- **Using**: User can modify participants for opportunities they have access to
- **With Check**: User can modify participants for opportunities they have access to
- **Logic**: Same as SELECT policy - user must have access to the opportunity

## organizations

### organizations_delete_policy
- **Command**: DELETE
- **Using**: user_is_admin() OR created_by = auth.uid()

### organizations_insert_policy
- **Command**: INSERT
- **With Check**: created_by = auth.uid()

### organizations_select_policy
- **Command**: SELECT
- **Using**: user_is_admin() OR created_by = auth.uid() OR user_has_org_access(id)

### organizations_update_policy
- **Command**: UPDATE
- **Using**: user_is_admin() OR created_by = auth.uid() OR user_has_org_access(id)
- **With Check**: updated_by = auth.uid()

## principal_distributor_relationships

### principal_distributor_delete_policy
- **Command**: DELETE
- **Using**: user_is_admin() OR (user_has_org_access(principal_id) AND user_has_org_access(distributor_id))

### principal_distributor_insert_policy
- **Command**: INSERT
- **With Check**: user_has_org_access(principal_id) AND user_has_org_access(distributor_id)

### principal_distributor_select_policy
- **Command**: SELECT
- **Using**: user_is_admin() OR user_has_org_access(principal_id) OR user_has_org_access(distributor_id)

### principal_distributor_update_policy
- **Command**: UPDATE
- **Using**: user_is_admin() OR (user_has_org_access(principal_id) AND user_has_org_access(distributor_id))
- **With Check**: user_has_org_access(principal_id) AND user_has_org_access(distributor_id)

## products

### products_delete_policy
- **Command**: DELETE
- **Using**: user_is_admin() OR created_by = auth.uid() OR user_has_org_access(principal_id)

### products_insert_policy
- **Command**: INSERT
- **With Check**: created_by = auth.uid() AND user_has_org_access(principal_id)

### products_select_policy
- **Command**: SELECT
- **Using**: user_is_admin() OR created_by = auth.uid() OR user_has_org_access(principal_id)

### products_update_policy
- **Command**: UPDATE
- **Using**: user_is_admin() OR created_by = auth.uid() OR user_has_org_access(principal_id)
- **With Check**: updated_by = auth.uid() AND user_has_org_access(principal_id)