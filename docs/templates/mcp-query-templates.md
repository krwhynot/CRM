# MCP Query Templates

Ready-to-use query templates for common MCP tool operations with proper pagination and filtering.

## Supabase Templates

### Documentation Search
```bash
# Basic documentation search with limit
mcp__supabase__search_docs(
    graphql_query: "query searchDocs($query: String!, $limit: Int) {
        searchDocs(query: $query, limit: $limit) {
            nodes {
                title
                href
                content
            }
            totalCount
        }
    }",
    variables: {
        query: "specific search terms",
        limit: 5
    }
)

# Advanced search with subsections
mcp__supabase__search_docs(
    graphql_query: "query searchDocs($query: String!, $limit: Int) {
        searchDocs(query: $query, limit: $limit) {
            nodes {
                title
                href
                content
                subsections {
                    nodes {
                        title
                        content
                    }
                }
            }
        }
    }",
    variables: {
        query: "authentication setup",
        limit: 3
    }
)
```

### Database Operations
```sql
-- Safe SELECT with pagination
SELECT 
    id, name, email, created_at
FROM contacts 
WHERE deleted_at IS NULL
    AND organization_id = $1
ORDER BY created_at DESC 
LIMIT 50;

-- Paginated results with offset
SELECT 
    o.name as org_name,
    c.name as contact_name,
    c.email
FROM organizations o
JOIN contacts c ON o.id = c.organization_id
WHERE o.deleted_at IS NULL 
    AND c.deleted_at IS NULL
ORDER BY o.name, c.name
LIMIT 25 OFFSET $1;

-- Count query for pagination
SELECT COUNT(*) as total_count
FROM contacts 
WHERE deleted_at IS NULL
    AND organization_id = $1;
```

## GitHub Templates

### Repository Search
```bash
# Search repositories with pagination
mcp__github__search_repositories(
    query: "topic:crm language:typescript",
    per_page: 25,
    page: 1
)

# Search code with filters
mcp__github__search_code(
    q: "useAuth filename:tsx repo:owner/repo",
    per_page: 20,
    page: 1
)
```

### List Operations
```bash
# List issues with filters
mcp__github__list_issues(
    owner: "owner",
    repo: "repo",
    state: "open",
    labels: ["bug", "high-priority"],
    per_page: 25,
    page: 1
)

# List commits with date range
mcp__github__list_commits(
    owner: "owner",
    repo: "repo",
    since: "2024-01-01T00:00:00Z",
    per_page: 30
)
```

## Vercel Templates

### Project Operations
```bash
# List projects with pagination
mcp__vercel__getprojects(
    limit: 25,
    search: "crm",
    from: "2024-01-01"
)

# List deployments with filters
mcp__vercel__getdeployments(
    projectId: "project_id",
    limit: 20,
    state: "READY",
    target: "production"
)
```

### Domain Management
```bash
# List domains with pagination
mcp__vercel__getdomains(
    limit: 50,
    since: timestamp
)

# Get project domains with filters
mcp__vercel__getprojectdomains(
    idOrName: "project_name",
    limit: 25,
    production: "true"
)
```

## Postgres Templates

### Database Analysis
```bash
# Get top queries with limit
mcp__postgres__get_top_queries(
    sort_by: "total_time",
    limit: 10
)

# Analyze specific queries (max 10)
mcp__postgres__analyze_query_indexes(
    queries: [
        "SELECT * FROM users WHERE email = $1",
        "SELECT * FROM orders WHERE user_id = $1 AND status = $2"
    ],
    method: "dta",
    max_index_size_mb: 1000
)
```

### Schema Operations
```bash
# List objects in schema
mcp__postgres__list_objects(
    schema_name: "public",
    object_type: "table"
)

# Get object details
mcp__postgres__get_object_details(
    schema_name: "public",
    object_name: "contacts",
    object_type: "table"
)
```

## Playwright Templates

### Browser Operations
```bash
# Navigate and take limited screenshot
mcp__playwright__browser_navigate(url: "https://example.com")
mcp__playwright__browser_wait_for(time: 2)
mcp__playwright__browser_take_screenshot(
    filename: "page_screenshot.png",
    raw: false
)

# Get console messages (auto-limited by session)
mcp__playwright__browser_console_messages()
```

## Generic Pagination Pattern

### Multi-Page Data Retrieval
```javascript
// Template for paginated data collection
async function getAllData(queryFunction, baseParams) {
    let allResults = [];
    let page = 1;
    const pageSize = 25;
    
    while (true) {
        const results = await queryFunction({
            ...baseParams,
            per_page: pageSize,
            page: page
        });
        
        allResults = allResults.concat(results.data || results);
        
        // Stop if we got less than a full page
        if ((results.data || results).length < pageSize) {
            break;
        }
        
        page++;
        
        // Safety: prevent infinite loops
        if (page > 100) {
            console.warn("Stopped pagination at page 100");
            break;
        }
    }
    
    return allResults;
}
```

## Error Recovery Templates

### Retry with Reduced Scope
```bash
# If initial query fails due to size:
# Step 1: Try with smaller limit
mcp__supabase__search_docs(query: "authentication", limit: 3)

# Step 2: If still fails, make more specific
mcp__supabase__search_docs(query: "supabase auth setup", limit: 2)

# Step 3: Break into multiple queries
mcp__supabase__search_docs(query: "auth configuration", limit: 1)
mcp__supabase__search_docs(query: "auth providers", limit: 1)
mcp__supabase__search_docs(query: "auth policies", limit: 1)
```

### Progressive Data Loading
```sql
-- Start with minimal data
SELECT id, name FROM contacts LIMIT 10;

-- Then get more details for specific records
SELECT * FROM contacts WHERE id IN ($1, $2, $3);

-- Finally get related data if needed
SELECT * FROM interactions WHERE contact_id IN ($1, $2, $3) LIMIT 20;
```

## Best Practice Checklist

Before using any template:

- [ ] Does my query have a `limit` parameter?
- [ ] Am I using specific search terms instead of broad ones?
- [ ] Do I have appropriate WHERE clauses for SQL?
- [ ] Am I requesting only the fields I actually need?
- [ ] Have I considered breaking this into multiple smaller queries?
- [ ] Is my pagination logic safe from infinite loops?

## Common Mistakes to Avoid

```bash
# ❌ DON'T: Unlimited queries
SELECT * FROM large_table;
mcp__supabase__search_docs(query: "database");

# ✅ DO: Limited and specific
SELECT id, name, email FROM large_table LIMIT 100;
mcp__supabase__search_docs(query: "database migrations", limit: 5);

# ❌ DON'T: No pagination for lists
mcp__github__list_issues(owner: "org", repo: "repo");

# ✅ DO: Paginated lists
mcp__github__list_issues(owner: "org", repo: "repo", per_page: 25, page: 1);
```

## Template Usage Guidelines

1. **Start Small**: Begin with limit: 5-10 for documentation, 25-50 for data
2. **Be Specific**: Use targeted search terms and filters
3. **Plan Pagination**: Always consider how to handle multiple pages
4. **Include Fallbacks**: Have a plan if your query is still too large
5. **Monitor Performance**: Track query response times and adjust limits accordingly