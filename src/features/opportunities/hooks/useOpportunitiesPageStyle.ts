/**
 * Opportunities Page Style Hook
 * Provides consistent styling configuration for the opportunities page
 * Matches the pattern used by Organizations and Contacts pages
 */

export const useOpportunitiesPageStyle = () => {
  // Future: This can be connected to feature flags or user preferences
  const USE_NEW_STYLE = false // Enable when ready for background styling
  
  return {
    USE_NEW_STYLE
  }
}