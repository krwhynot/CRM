# MCP Tool Reference Guide

This guide provides best practices for using MCP tools to prevent response size errors and optimize query performance.

## Response Size Limits

Most MCP tools have a **25,000 token response limit**. Exceeding this limit will cause errors and prevent data retrieval.

## Tool-Specific Parameters

### Supabase Tools

#### search_docs
```bash
# ❌ Avoid broad searches without limits
mcp__supabase__search_docs(query: "authentication")

# ✅ Use specific queries with limits
mcp__supabase__search_docs(query: "authentication setup", limit: 5)
```

**Available Parameters:**
- `graphql_query`: Use specific GraphQL queries to limit fields
- `limit`: Limit number of results (recommended: 5-10 for docs)

#### execute_sql / apply_migration
```sql
-- ❌ Avoid unlimited queries
SELECT * FROM large_table;

-- ✅ Always use LIMIT
SELECT * FROM large_table LIMIT 100;
```

### GitHub Tools

#### search_repositories / search_code
```bash
# Parameters for pagination
per_page: 10-50  # Default 30, max 100
page: 1          # Page number for pagination
```

#### list_commits / list_issues
```bash
# Control response size
perPage: 25      # Results per page
page: 1          # Page number
```

### Vercel Tools

#### Most Vercel tools support:
```bash
limit: 50        # Maximum items to return
since: timestamp # Filter by date
until: timestamp # Filter by date
```

### Postgres Tools

#### execute_sql / get_top_queries
```sql
-- Always include LIMIT for large datasets
SELECT * FROM table_name 
WHERE condition 
ORDER BY created_at DESC 
LIMIT 100;
```

#### analyze_query_indexes
```bash
# Limit number of queries analyzed
queries: ["query1", "query2"]  # Max 10 queries recommended
```

### Playwright Tools

#### browser_console_messages / browser_network_requests
- These tools return all messages/requests since page load
- Use `browser_close` and `browser_navigate` to reset state if needed

## Best Practices

### 1. Start Small, Scale Up
```bash
# Start with small limits
limit: 5

# Increase gradually if needed
limit: 25
limit: 50
```

### 2. Use Specific Queries
```bash
# ❌ Too broad
query: "user"

# ✅ Specific and targeted
query: "user authentication login"
```

### 3. Implement Pagination
```bash
# First request
page: 1, per_page: 25

# Subsequent requests
page: 2, per_page: 25
page: 3, per_page: 25
```

### 4. Filter by Date/Type
```bash
# Use filters to narrow results
since: timestamp
object_type: "table"
state: "open"
```

### 5. Sequential Querying Strategy
Instead of one large query, use multiple focused queries:

```bash
# Step 1: Get overview
mcp__supabase__search_docs(query: "auth overview", limit: 3)

# Step 2: Get specific implementation
mcp__supabase__search_docs(query: "auth setup guide", limit: 5)

# Step 3: Get troubleshooting
mcp__supabase__search_docs(query: "auth troubleshooting", limit: 3)
```

## Query Templates

### Database Query Template
```sql
SELECT 
    specific_columns,
    NOT *
FROM table_name 
WHERE meaningful_conditions
    AND deleted_at IS NULL  -- For soft deletes
ORDER BY relevant_column 
LIMIT 100;  -- Always include LIMIT
```

### Documentation Search Template
```bash
mcp__supabase__search_docs(
    graphql_query: "query searchDocs($query: String!, $limit: Int) {
        searchDocs(query: $query, limit: $limit) {
            nodes {
                title
                href
                content
            }
        }
    }",
    variables: {
        query: "specific search terms",
        limit: 5
    }
)
```

### API Pagination Template
```bash
# First request
tool_name(
    query: "search terms",
    limit: 25,
    page: 1
)

# Check if more results needed
if (results.length === 25) {
    # Continue pagination
    tool_name(
        query: "search terms", 
        limit: 25,
        page: 2
    )
}
```

## Error Prevention Checklist

Before making MCP tool calls:

- [ ] Is this a large dataset? Use `limit` parameter
- [ ] Can I be more specific with my query?
- [ ] Am I using the right filters?
- [ ] Do I need all this data at once?
- [ ] Should I break this into multiple queries?
- [ ] Have I included appropriate WHERE clauses for SQL?
- [ ] Am I using pagination for list operations?

## Common Error Patterns

### 1. Unlimited Database Queries
```sql
-- ❌ This can return millions of rows
SELECT * FROM interactions;

-- ✅ Limited and filtered
SELECT * FROM interactions 
WHERE created_at >= NOW() - INTERVAL '7 days'
LIMIT 100;
```

### 2. Broad Documentation Searches
```bash
# ❌ Returns too much content
mcp__supabase__search_docs(query: "database")

# ✅ Specific and limited
mcp__supabase__search_docs(query: "database migrations setup", limit: 3)
```

### 3. Unfiltered List Operations
```bash
# ❌ Gets everything
mcp__github__list_issues(owner: "org", repo: "repo")

# ✅ Filtered and limited
mcp__github__list_issues(
    owner: "org", 
    repo: "repo",
    state: "open",
    per_page: 25
)
```

## Tool Response Size Guidelines

| Tool Type | Recommended Limit | Max Safe Limit |
|-----------|------------------|----------------|
| Documentation Search | 5-10 | 15 |
| Database Queries | 100 rows | 500 rows |
| API Lists | 25-50 | 100 |
| File Operations | 10-25 files | 50 files |
| Log/Message Retrieval | 50-100 | 200 |

## Emergency Response Size Reduction

If you encounter a response size error:

1. **Immediate Fix**: Add or reduce `limit` parameter
2. **Medium Term**: Make query more specific
3. **Long Term**: Implement proper pagination
4. **Alternative**: Break into multiple sequential queries

Remember: It's better to make 3 focused queries than 1 oversized query that fails.