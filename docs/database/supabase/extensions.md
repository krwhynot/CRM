# Extensions

## Installed Extensions

| Extension | Version | Schema | Purpose |
|-----------|---------|--------|---------|
| citext | 1.6 | public | Case-insensitive character strings |
| hypopg | 1.4.1 | public | Hypothetical indexes for query optimization |
| pg_graphql | 1.5.11 | graphql | GraphQL API support |
| pg_stat_statements | 1.11 | extensions | SQL statement execution statistics |
| pg_trgm | 1.6 | extensions | Trigram matching for text similarity |
| pgcrypto | 1.3 | extensions | Cryptographic functions |
| plpgsql | 1.0 | pg_catalog | PL/pgSQL procedural language |
| supabase_vault | 0.3.1 | vault | Supabase Vault for secrets management |
| uuid-ossp | 1.1 | extensions | UUID generation functions |

## Extension Details

### citext
- **Version**: 1.6
- **Description**: Case-insensitive text type for email and username comparisons
- **Schema**: public
- **Usage**: Used for case-insensitive email lookups and comparisons

### hypopg
- **Version**: 1.4.1
- **Description**: Creates hypothetical indexes for query optimization testing
- **Schema**: public
- **Usage**: Testing index performance without actually creating indexes

### pg_graphql
- **Version**: 1.5.11
- **Description**: GraphQL API support for Supabase
- **Schema**: graphql
- **Usage**: Auto-generated GraphQL API for database access

### pg_stat_statements
- **Version**: 1.11
- **Description**: Tracks planning and execution statistics of SQL statements
- **Schema**: extensions
- **Usage**: Performance monitoring and query optimization

### pg_trgm
- **Version**: 1.6
- **Description**: Trigram matching for text similarity and full-text search
- **Schema**: extensions
- **Usage**: GIN indexes for fuzzy text search on names and descriptions

### pgcrypto
- **Version**: 1.3
- **Description**: Cryptographic functions for PostgreSQL
- **Schema**: extensions
- **Usage**: Password hashing and data encryption

### supabase_vault
- **Version**: 0.3.1
- **Description**: Supabase Vault for secrets management
- **Schema**: vault
- **Usage**: Secure storage of API keys and sensitive configuration

### uuid-ossp
- **Version**: 1.1
- **Description**: UUID generation functions
- **Schema**: extensions
- **Usage**: Primary key generation with gen_random_uuid()