/**
 * Manual test script to verify data consistency fix
 * Run this in browser console to check if Dashboard and Organizations pages show same data
 */

async function testDataConsistency() {
  console.log('🧪 [DataConsistencyTest] Starting data consistency check...')
  
  // Create a QueryClient instance to check cache
  const queryClient = window.__REACT_QUERY_CLIENT__
  
  if (!queryClient) {
    console.error('❌ React Query client not found in window.__REACT_QUERY_CLIENT__')
    return
  }
  
  // Get all organization queries from cache
  const cache = queryClient.getQueryCache()
  const queries = cache.getAll()
  
  const orgQueries = queries.filter(q => 
    q.queryKey.some(key => key === 'organizations')
  )
  
  console.log('📊 Found', orgQueries.length, 'organization queries in cache:')
  
  orgQueries.forEach((query, index) => {
    console.log(`Query ${index + 1}:`, {
      key: query.queryKey,
      status: query.state.status,
      dataCount: Array.isArray(query.state.data) ? query.state.data.length : 'not-array',
      isStale: query.isStale(),
      error: query.state.error?.message
    })
  })
  
  // Check for data consistency
  const dataCounts = orgQueries
    .filter(q => q.state.data && Array.isArray(q.state.data))
    .map(q => q.state.data.length)
  
  const uniqueCounts = [...new Set(dataCounts)]
  
  if (uniqueCounts.length === 1) {
    console.log('✅ [DataConsistencyTest] PASS: All queries return same count:', uniqueCounts[0])
  } else if (uniqueCounts.length === 0) {
    console.log('⚠️  [DataConsistencyTest] WARNING: No data found in any queries')
  } else {
    console.log('❌ [DataConsistencyTest] FAIL: Inconsistent data counts found:', uniqueCounts)
  }
  
  return {
    totalQueries: orgQueries.length,
    dataCounts,
    uniqueCounts,
    consistent: uniqueCounts.length <= 1
  }
}

// Export to window for easy access
window.testDataConsistency = testDataConsistency

console.log('🔍 Data consistency test loaded. Run testDataConsistency() in console to check.')