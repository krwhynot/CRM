#!/bin/bash

# ============================================================================
# Connection Pool Optimization Script for Emergency Incidents
# Description: Optimizes database connection pooling during high-stress incidents
# Usage: ./optimize-connection-pool.sh [--activate] [--deactivate] [--status]
# ============================================================================

set -e

# Configuration
NORMAL_MAX_CONNECTIONS=100
EMERGENCY_MAX_CONNECTIONS=150
EMERGENCY_RESERVED_CONNECTIONS=5
EMERGENCY_POOL_SIZE=25
NORMAL_POOL_SIZE=15

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="/tmp/connection-pool-optimization-$(date +%Y%m%d-%H%M%S).log"

# Function to log with timestamp
log_with_timestamp() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check current connection status
check_connection_status() {
    echo -e "${BLUE}=== Current Database Connection Status ===${NC}"
    
    # Get connection information
    local connection_stats=$(psql -t -c "
        SELECT 
            count(*) as total_connections,
            count(*) FILTER (WHERE state = 'active') as active_connections,
            count(*) FILTER (WHERE state = 'idle') as idle_connections,
            count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
            ROUND((count(*) FILTER (WHERE state = 'active')::numeric / count(*) * 100), 2) as active_percentage,
            (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
        FROM pg_stat_activity
        WHERE pid != pg_backend_pid();
    ")
    
    # Parse connection stats
    IFS='|' read -r total active idle idle_in_trans percentage max_conn <<< "$connection_stats"
    total=$(echo "$total" | xargs)
    active=$(echo "$active" | xargs)
    idle=$(echo "$idle" | xargs)
    idle_in_trans=$(echo "$idle_in_trans" | xargs)
    percentage=$(echo "$percentage" | xargs)
    max_conn=$(echo "$max_conn" | xargs)
    
    echo "Total Connections: $total / $max_conn"
    echo "Active: $active ($percentage%)"
    echo "Idle: $idle"
    echo "Idle in Transaction: $idle_in_trans"
    
    # Status indicators
    if (( $(echo "$percentage > 80" | bc -l 2>/dev/null || echo 0) )); then
        echo -e "${RED}⚠ High connection usage detected${NC}"
    elif (( $(echo "$percentage > 60" | bc -l 2>/dev/null || echo 0) )); then
        echo -e "${YELLOW}△ Moderate connection usage${NC}"
    else
        echo -e "${GREEN}✓ Normal connection usage${NC}"
    fi
    
    # Check for long-running queries
    local long_running=$(psql -t -c "
        SELECT count(*) 
        FROM pg_stat_activity 
        WHERE state = 'active' 
          AND query_start < now() - interval '30 seconds'
          AND pid != pg_backend_pid();
    ")
    long_running=$(echo "$long_running" | xargs)
    
    if [ "$long_running" -gt 0 ]; then
        echo -e "${YELLOW}Long-running queries: $long_running${NC}"
        
        # Show details of long-running queries
        echo -e "${BLUE}Long-running query details:${NC}"
        psql -c "
            SELECT 
                pid,
                EXTRACT(EPOCH FROM (now() - query_start))::int as duration_seconds,
                state,
                substr(query, 1, 100) as query_snippet
            FROM pg_stat_activity 
            WHERE state = 'active' 
              AND query_start < now() - interval '30 seconds'
              AND pid != pg_backend_pid()
            ORDER BY query_start;
        "
    fi
    
    log_with_timestamp "Connection status: $active/$total ($percentage% active), $long_running long-running queries"
}

# Function to activate emergency connection pool settings
activate_emergency_mode() {
    echo -e "${YELLOW}=== Activating Emergency Connection Pool Mode ===${NC}"
    log_with_timestamp "Activating emergency connection pool mode"
    
    # Create emergency connection pool configuration
    cat << EOF > /tmp/emergency-pool-config.sql
-- Emergency Connection Pool Optimization
-- This temporarily increases connection limits and optimizes pool settings

-- Note: These changes require appropriate permissions and may need restart
-- For production, these should be applied through your database management system

-- Connection pool optimizations (if using PgBouncer or similar)
-- These are example configurations - adjust based on your connection pooler

-- Emergency pool configuration recommendations:
-- pool_mode = transaction (for better connection reuse)
-- default_pool_size = $EMERGENCY_POOL_SIZE (increased from $NORMAL_POOL_SIZE)
-- reserve_pool_size = $EMERGENCY_RESERVED_CONNECTIONS
-- max_client_conn = $EMERGENCY_MAX_CONNECTIONS
-- server_round_robin = 1 (for load balancing)
-- query_timeout = 30 (prevent runaway queries)
-- query_wait_timeout = 5 (fail fast during high load)

-- PostgreSQL settings that can be changed without restart:
-- These can be set dynamically for the current session or globally

-- Increase work_mem for better query performance during emergencies
SET work_mem = '8MB';

-- Reduce checkpoint frequency to improve performance
-- (Note: This affects durability vs performance tradeoff)
-- SET checkpoint_completion_target = 0.9;

-- Optimize logging for emergency response (reduce I/O overhead)
SET log_statement = 'none';
SET log_min_duration_statement = 5000; -- Only log queries > 5 seconds

-- Connection-level optimizations
SET statement_timeout = '30s'; -- Prevent runaway queries
SET lock_timeout = '10s'; -- Prevent lock contention

-- Emergency query optimization settings
SET enable_seqscan = off; -- Force index usage where possible
SET random_page_cost = 1.1; -- Optimize for SSD storage

SELECT 'Emergency connection pool settings applied' as status;
EOF

    # Apply emergency settings
    if psql -f /tmp/emergency-pool-config.sql > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Emergency connection pool settings applied${NC}"
        log_with_timestamp "Emergency connection pool settings applied successfully"
    else
        echo -e "${RED}✗ Failed to apply emergency connection pool settings${NC}"
        log_with_timestamp "Failed to apply emergency connection pool settings"
        return 1
    fi
    
    # Clean up
    rm -f /tmp/emergency-pool-config.sql
    
    # Create emergency monitoring queries
    cat << 'EOF' > /tmp/emergency-connection-monitor.sql
-- Emergency connection monitoring queries
-- Run these periodically during incidents

-- Active connections by state
SELECT 
    state,
    count(*) as connection_count,
    ROUND(count(*) * 100.0 / (SELECT count(*) FROM pg_stat_activity WHERE pid != pg_backend_pid()), 2) as percentage
FROM pg_stat_activity 
WHERE pid != pg_backend_pid()
GROUP BY state
ORDER BY connection_count DESC;

-- Connections by application/user
SELECT 
    COALESCE(application_name, 'Unknown') as application,
    COALESCE(usename, 'Unknown') as username,
    count(*) as connection_count
FROM pg_stat_activity 
WHERE pid != pg_backend_pid()
GROUP BY application_name, usename
ORDER BY connection_count DESC;

-- Long-running transactions (potential blockers)
SELECT 
    pid,
    EXTRACT(EPOCH FROM (now() - xact_start))::int as transaction_duration_seconds,
    EXTRACT(EPOCH FROM (now() - query_start))::int as query_duration_seconds,
    state,
    substr(query, 1, 150) as query_snippet
FROM pg_stat_activity 
WHERE xact_start < now() - interval '1 minute'
  AND pid != pg_backend_pid()
ORDER BY xact_start;
EOF

    echo -e "${GREEN}✓ Emergency connection pool mode activated${NC}"
    echo "  - Emergency settings applied to current session"
    echo "  - Monitoring queries created at /tmp/emergency-connection-monitor.sql"
    echo "  - Use --status to monitor connection health"
    
    return 0
}

# Function to deactivate emergency mode
deactivate_emergency_mode() {
    echo -e "${YELLOW}=== Deactivating Emergency Connection Pool Mode ===${NC}"
    log_with_timestamp "Deactivating emergency connection pool mode"
    
    # Reset to normal settings
    cat << EOF > /tmp/normal-pool-config.sql
-- Reset to Normal Connection Pool Settings

-- Reset PostgreSQL settings to defaults
RESET work_mem;
RESET log_statement;
RESET log_min_duration_statement;
RESET statement_timeout;
RESET lock_timeout;
RESET enable_seqscan;
RESET random_page_cost;

-- Normal pool configuration recommendations:
-- pool_mode = session (normal mode)
-- default_pool_size = $NORMAL_POOL_SIZE (reduced from emergency)
-- reserve_pool_size = 2 (normal reserve)
-- max_client_conn = $NORMAL_MAX_CONNECTIONS
-- query_timeout = 120 (normal timeout)
-- query_wait_timeout = 30 (normal wait)

SELECT 'Normal connection pool settings restored' as status;
EOF

    # Apply normal settings
    if psql -f /tmp/normal-pool-config.sql > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Normal connection pool settings restored${NC}"
        log_with_timestamp "Normal connection pool settings restored successfully"
    else
        echo -e "${RED}✗ Failed to restore normal connection pool settings${NC}"
        log_with_timestamp "Failed to restore normal connection pool settings"
        return 1
    fi
    
    # Clean up
    rm -f /tmp/normal-pool-config.sql /tmp/emergency-connection-monitor.sql
    
    echo -e "${GREEN}✓ Emergency connection pool mode deactivated${NC}"
    return 0
}

# Function to terminate problematic connections
terminate_problematic_connections() {
    echo -e "${YELLOW}=== Checking for Problematic Connections ===${NC}"
    
    # Find long-running idle transactions
    local idle_transactions=$(psql -t -c "
        SELECT pid
        FROM pg_stat_activity 
        WHERE state = 'idle in transaction'
          AND xact_start < now() - interval '5 minutes'
          AND pid != pg_backend_pid();
    ")
    
    if [ -n "$idle_transactions" ] && [ "$idle_transactions" != "" ]; then
        echo -e "${YELLOW}Found long-running idle transactions:${NC}"
        echo "$idle_transactions" | while read -r pid; do
            if [ -n "$pid" ] && [ "$pid" != "" ]; then
                pid=$(echo "$pid" | xargs)
                echo "  Terminating idle transaction PID: $pid"
                psql -c "SELECT pg_terminate_backend($pid);" > /dev/null 2>&1 || true
                log_with_timestamp "Terminated idle transaction PID: $pid"
            fi
        done
    else
        echo -e "${GREEN}✓ No problematic idle transactions found${NC}"
    fi
    
    # Find very long-running queries (>5 minutes)
    local long_queries=$(psql -t -c "
        SELECT pid
        FROM pg_stat_activity 
        WHERE state = 'active'
          AND query_start < now() - interval '5 minutes'
          AND query NOT LIKE '%pg_stat_activity%'
          AND pid != pg_backend_pid();
    ")
    
    if [ -n "$long_queries" ] && [ "$long_queries" != "" ]; then
        echo -e "${YELLOW}Found very long-running queries (>5 min):${NC}"
        echo "$long_queries" | while read -r pid; do
            if [ -n "$pid" ] && [ "$pid" != "" ]; then
                pid=$(echo "$pid" | xargs)
                echo "  Consider terminating long-running query PID: $pid"
                # Don't automatically terminate - just report
                log_with_timestamp "Long-running query detected PID: $pid (not automatically terminated)"
            fi
        done
    else
        echo -e "${GREEN}✓ No extremely long-running queries found${NC}"
    fi
}

# Function to show connection pool recommendations
show_recommendations() {
    echo -e "${BLUE}=== Connection Pool Optimization Recommendations ===${NC}"
    
    # Get current stats for recommendations
    local stats=$(psql -t -c "
        SELECT 
            count(*) as total,
            count(*) FILTER (WHERE state = 'active') as active,
            ROUND((count(*) FILTER (WHERE state = 'active')::numeric / count(*) * 100), 2) as active_pct,
            (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_conn
        FROM pg_stat_activity
        WHERE pid != pg_backend_pid();
    ")
    
    IFS='|' read -r total active active_pct max_conn <<< "$stats"
    total=$(echo "$total" | xargs)
    active=$(echo "$active" | xargs)
    active_pct=$(echo "$active_pct" | xargs)
    max_conn=$(echo "$max_conn" | xargs)
    
    echo "Current Status: $active/$total connections active ($active_pct%)"
    echo ""
    echo "Recommendations based on current usage:"
    
    if (( $(echo "$active_pct > 80" | bc -l 2>/dev/null || echo 0) )); then
        echo -e "${RED}🚨 CRITICAL - High Connection Usage${NC}"
        echo "  • Activate emergency connection pool mode immediately"
        echo "  • Consider terminating idle transactions"
        echo "  • Monitor for connection leaks in applications"
        echo "  • Implement connection pooling if not already using"
    elif (( $(echo "$active_pct > 60" | bc -l 2>/dev/null || echo 0) )); then
        echo -e "${YELLOW}⚠ WARNING - Moderate Connection Usage${NC}"
        echo "  • Monitor connection usage closely"
        echo "  • Prepare to activate emergency mode if needed"
        echo "  • Review application connection management"
    else
        echo -e "${GREEN}✓ NORMAL - Connection Usage Healthy${NC}"
        echo "  • Current settings appear adequate"
        echo "  • Continue normal monitoring"
    fi
    
    echo ""
    echo "General Best Practices:"
    echo "  • Use connection pooling (PgBouncer, built-in pools)"
    echo "  • Set appropriate timeouts (statement_timeout, query_timeout)"
    echo "  • Monitor for idle in transaction connections"
    echo "  • Reserve connections for emergency diagnostic queries"
    echo "  • Use transaction-level pooling during high load"
}

# Main function
main() {
    case "${1:-status}" in
        --activate|activate)
            check_connection_status
            echo ""
            activate_emergency_mode
            echo ""
            check_connection_status
            ;;
        --deactivate|deactivate)
            check_connection_status
            echo ""
            deactivate_emergency_mode
            echo ""
            check_connection_status
            ;;
        --terminate|terminate)
            check_connection_status
            echo ""
            terminate_problematic_connections
            echo ""
            check_connection_status
            ;;
        --status|status)
            check_connection_status
            echo ""
            show_recommendations
            ;;
        --monitor|monitor)
            echo -e "${BLUE}Starting continuous connection monitoring (Ctrl+C to stop)...${NC}"
            while true; do
                clear
                echo "=== Connection Pool Monitor - $(date) ==="
                check_connection_status
                echo ""
                echo "Next update in 10 seconds..."
                sleep 10
            done
            ;;
        --help|help)
            echo "Connection Pool Optimization Script"
            echo ""
            echo "Usage: $0 [COMMAND]"
            echo ""
            echo "Commands:"
            echo "  --activate      Activate emergency connection pool mode"
            echo "  --deactivate    Deactivate emergency mode and restore normal settings"
            echo "  --status        Show current connection status and recommendations (default)"
            echo "  --terminate     Terminate problematic connections (idle transactions)"
            echo "  --monitor       Start continuous connection monitoring"
            echo "  --help          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --status                # Check current connection status"
            echo "  $0 --activate              # Activate emergency mode during incident"
            echo "  $0 --deactivate            # Return to normal after incident"
            echo "  $0 --monitor               # Continuous monitoring"
            ;;
        *)
            echo "Unknown command: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
}

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found. Please ensure PostgreSQL client is installed.${NC}"
    exit 1
fi

# Check if bc is available for calculations
if ! command -v bc &> /dev/null; then
    echo -e "${YELLOW}Warning: bc command not found. Some calculations may not work properly.${NC}"
fi

# Signal handling for graceful shutdown in monitor mode
trap 'echo -e "\n${YELLOW}Connection monitoring stopped by user${NC}"; exit 0' INT TERM

# Run main function
main "$@"