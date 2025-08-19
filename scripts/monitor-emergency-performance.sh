#!/bin/bash

# ============================================================================
# Emergency Performance Monitoring Script
# Description: Real-time performance monitoring during emergency incidents
# Usage: ./monitor-emergency-performance.sh [--continuous] [--alert-threshold=2000]
# ============================================================================

set -e

# Configuration
DEFAULT_THRESHOLD=2000  # 2 seconds in milliseconds
CONTINUOUS_MODE=false
ALERT_THRESHOLD=${DEFAULT_THRESHOLD}
LOG_FILE="/tmp/emergency-performance-$(date +%Y%m%d-%H%M%S).log"
ALERT_LOG="/tmp/emergency-alerts-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --continuous)
            CONTINUOUS_MODE=true
            shift
            ;;
        --alert-threshold=*)
            ALERT_THRESHOLD="${1#*=}"
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --continuous              Run in continuous monitoring mode"
            echo "  --alert-threshold=N       Set alert threshold in milliseconds (default: 2000)"
            echo "  --help                   Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Function to log with timestamp
log_with_timestamp() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to send alert
send_alert() {
    local message="$1"
    local severity="$2"
    
    echo -e "${RED}[ALERT - $severity] $message${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ALERT [$severity]: $message" >> "$ALERT_LOG"
    
    # TODO: Integrate with your alerting system (Slack, PagerDuty, etc.)
    # Example: curl -X POST -H 'Content-type: application/json' \
    #     --data "{\"text\":\"CRM Emergency Alert [$severity]: $message\"}" \
    #     $SLACK_WEBHOOK_URL
}

# Function to check database connectivity
check_db_connectivity() {
    local start_time=$(date +%s%3N)
    
    if psql -c "SELECT 1;" > /dev/null 2>&1; then
        local end_time=$(date +%s%3N)
        local duration=$((end_time - start_time))
        
        if [ $duration -gt 1000 ]; then
            send_alert "Database connection slow: ${duration}ms" "WARNING"
        fi
        
        echo -e "${GREEN}✓ Database connectivity: ${duration}ms${NC}"
        return 0
    else
        send_alert "Database connection failed" "CRITICAL"
        echo -e "${RED}✗ Database connection failed${NC}"
        return 1
    fi
}

# Function to run emergency performance test
run_emergency_performance_test() {
    log_with_timestamp "Running emergency performance test suite..."
    
    # Create temporary SQL file for testing
    cat << 'EOF' > /tmp/emergency_performance_test.sql
-- Emergency Performance Test Suite
\timing on
\set QUIET on

-- Test 1: Principal-Distributor relationship validation
\echo 'Test 1: Principal-Distributor Relationships'
SELECT COUNT(*) as unauthorized_relationships 
FROM organizations p
JOIN principal_distributor_relationships pr ON p.id = pr.principal_id  
JOIN organizations d ON pr.distributor_id = d.id
WHERE p.is_principal = true 
  AND d.is_distributor = true
  AND (pr.relationship_status != 'active' OR pr.deleted_at IS NOT NULL)
  AND p.deleted_at IS NULL 
  AND d.deleted_at IS NULL
LIMIT 100;

-- Test 2: Primary contact validation
\echo 'Test 2: Primary Contact Validation'
SELECT organization_id, COUNT(*) as primary_contact_count
FROM contacts 
WHERE is_primary = true AND deleted_at IS NULL
GROUP BY organization_id
HAVING COUNT(*) > 1
LIMIT 20;

-- Test 3: Priority validation
\echo 'Test 3: Priority Validation'
SELECT COUNT(*) as invalid_priorities 
FROM organizations 
WHERE (priority NOT IN ('A+', 'A', 'B', 'C', 'D') OR priority IS NULL)
  AND deleted_at IS NULL
LIMIT 100;

-- Test 4: Opportunity pipeline validation
\echo 'Test 4: Opportunity Pipeline Validation'
SELECT COUNT(*) as invalid_opportunities 
FROM opportunities 
WHERE deleted_at IS NULL
  AND (stage NOT IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')
    OR (stage = 'closed_won' AND close_date IS NULL)
    OR (stage IN ('closed_won', 'closed_lost') AND close_date > CURRENT_DATE))
LIMIT 100;

-- Test 5: Recent organization creation performance
\echo 'Test 5: Recent Organization Creation Performance'
SELECT COUNT(*) as recent_orgs
FROM organizations 
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND deleted_at IS NULL
LIMIT 100;
EOF

    # Run the performance tests and capture timing
    local test_output=$(psql -f /tmp/emergency_performance_test.sql 2>&1)
    local test_exit_code=$?
    
    # Clean up
    rm -f /tmp/emergency_performance_test.sql
    
    if [ $test_exit_code -eq 0 ]; then
        echo -e "${GREEN}✓ Emergency performance tests completed${NC}"
        
        # Parse timing information and check for slow queries
        echo "$test_output" | grep -E "Time: [0-9]+\.[0-9]+ ms" | while read line; do
            local time_ms=$(echo "$line" | grep -o '[0-9]\+\.[0-9]\+' | head -1)
            local time_ms_int=$(echo "$time_ms" | cut -d'.' -f1)
            
            if [ "$time_ms_int" -gt "$ALERT_THRESHOLD" ]; then
                send_alert "Slow query detected: ${time_ms}ms (threshold: ${ALERT_THRESHOLD}ms)" "WARNING"
            fi
            
            log_with_timestamp "Query execution time: ${time_ms}ms"
        done
        
        return 0
    else
        send_alert "Emergency performance tests failed" "CRITICAL"
        echo -e "${RED}✗ Emergency performance tests failed${NC}"
        log_with_timestamp "Performance test error output: $test_output"
        return 1
    fi
}

# Function to check index usage
check_emergency_index_usage() {
    log_with_timestamp "Checking emergency index usage..."
    
    local index_usage=$(psql -t -c "
        SELECT 
            indexname,
            idx_scan,
            idx_tup_read,
            CASE 
                WHEN idx_scan = 0 THEN 'UNUSED'
                WHEN idx_scan < 10 THEN 'LOW'
                WHEN idx_scan < 100 THEN 'MODERATE'
                ELSE 'HIGH'
            END as usage_level
        FROM pg_stat_user_indexes 
        WHERE indexname LIKE 'idx_emergency_%'
        ORDER BY idx_scan DESC;
    ")
    
    if [ -z "$index_usage" ]; then
        send_alert "No emergency indexes found - performance optimization may not be active" "WARNING"
        return 1
    fi
    
    echo -e "${BLUE}Emergency Index Usage:${NC}"
    echo "$index_usage" | while IFS='|' read -r indexname scans reads usage_level; do
        # Trim whitespace
        indexname=$(echo "$indexname" | xargs)
        scans=$(echo "$scans" | xargs)
        usage_level=$(echo "$usage_level" | xargs)
        
        case "$usage_level" in
            "UNUSED")
                echo -e "  ${RED}✗ $indexname: $scans scans ($usage_level)${NC}"
                ;;
            "LOW"|"MODERATE")
                echo -e "  ${YELLOW}△ $indexname: $scans scans ($usage_level)${NC}"
                ;;
            "HIGH")
                echo -e "  ${GREEN}✓ $indexname: $scans scans ($usage_level)${NC}"
                ;;
        esac
    done
    
    return 0
}

# Function to monitor database connections
monitor_connections() {
    log_with_timestamp "Monitoring database connections..."
    
    local connection_info=$(psql -t -c "
        SELECT 
            count(*) as total_connections,
            count(*) FILTER (WHERE state = 'active') as active_connections,
            count(*) FILTER (WHERE state = 'idle') as idle_connections,
            ROUND((count(*) FILTER (WHERE state = 'active')::numeric / count(*) * 100), 2) as active_percentage
        FROM pg_stat_activity
        WHERE pid != pg_backend_pid();
    ")
    
    # Parse connection info
    IFS='|' read -r total active idle percentage <<< "$connection_info"
    total=$(echo "$total" | xargs)
    active=$(echo "$active" | xargs)
    idle=$(echo "$idle" | xargs)
    percentage=$(echo "$percentage" | xargs)
    
    echo -e "${BLUE}Database Connections:${NC}"
    echo "  Total: $total"
    echo "  Active: $active ($percentage%)"
    echo "  Idle: $idle"
    
    # Alert on high connection usage
    if (( $(echo "$percentage > 80" | bc -l) )); then
        send_alert "High database connection usage: $percentage% active" "WARNING"
    elif (( $(echo "$percentage > 95" | bc -l) )); then
        send_alert "Critical database connection usage: $percentage% active" "CRITICAL"
    fi
    
    log_with_timestamp "Connection usage: $active/$total ($percentage% active)"
}

# Function to check recent query performance
check_recent_query_performance() {
    log_with_timestamp "Checking recent query performance..."
    
    local slow_queries=$(psql -t -c "
        SELECT 
            substr(query, 1, 100) as query_snippet,
            calls,
            ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
            ROUND(max_exec_time::numeric, 2) as max_time_ms
        FROM pg_stat_statements 
        WHERE query LIKE '%organizations%' 
          OR query LIKE '%contacts%'
          OR query LIKE '%opportunities%'
        ORDER BY mean_exec_time DESC
        LIMIT 5;
    ")
    
    if [ -n "$slow_queries" ]; then
        echo -e "${BLUE}Recent Query Performance (Top 5):${NC}"
        echo "$slow_queries" | while IFS='|' read -r query calls avg_time max_time; do
            query=$(echo "$query" | xargs)
            avg_time=$(echo "$avg_time" | xargs)
            max_time=$(echo "$max_time" | xargs)
            
            # Convert to integer for comparison
            avg_time_int=$(echo "$avg_time" | cut -d'.' -f1)
            
            if [ "$avg_time_int" -gt "$ALERT_THRESHOLD" ]; then
                echo -e "  ${RED}✗ Slow query: ${avg_time}ms avg, ${max_time}ms max${NC}"
                echo -e "    Query: $query"
                send_alert "Slow query detected: ${avg_time}ms average execution time" "WARNING"
            else
                echo -e "  ${GREEN}✓ Query: ${avg_time}ms avg, ${max_time}ms max${NC}"
            fi
        done
    fi
}

# Function to generate performance report
generate_performance_report() {
    log_with_timestamp "Generating performance report..."
    
    local report_file="/tmp/emergency-performance-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat << EOF > "$report_file"
# Emergency CRM Performance Report
**Generated:** $(date)
**Alert Threshold:** ${ALERT_THRESHOLD}ms

## Database Connectivity
$(check_db_connectivity 2>&1)

## Emergency Index Usage
$(check_emergency_index_usage 2>&1)

## Connection Monitoring  
$(monitor_connections 2>&1)

## Query Performance
$(check_recent_query_performance 2>&1)

## Performance Test Results
$(run_emergency_performance_test 2>&1)

---
*Report generated by emergency performance monitoring script*
EOF

    echo -e "${GREEN}✓ Performance report generated: $report_file${NC}"
    log_with_timestamp "Performance report generated: $report_file"
}

# Main monitoring function
run_monitoring_cycle() {
    echo -e "${BLUE}=== Emergency Performance Monitoring Cycle ===${NC}"
    echo "Timestamp: $(date)"
    echo "Alert Threshold: ${ALERT_THRESHOLD}ms"
    echo "Log File: $LOG_FILE"
    echo "Alert Log: $ALERT_LOG"
    echo ""
    
    # Run all monitoring checks
    check_db_connectivity
    check_emergency_index_usage
    monitor_connections
    check_recent_query_performance
    run_emergency_performance_test
    
    echo ""
    echo -e "${GREEN}=== Monitoring cycle completed ===${NC}"
    log_with_timestamp "Monitoring cycle completed successfully"
}

# Main execution
main() {
    echo -e "${BLUE}Emergency CRM Performance Monitor${NC}"
    echo "Starting monitoring with alert threshold: ${ALERT_THRESHOLD}ms"
    echo "Log file: $LOG_FILE"
    echo "Alert log: $ALERT_LOG"
    echo ""
    
    if [ "$CONTINUOUS_MODE" = true ]; then
        echo "Running in continuous mode (Ctrl+C to stop)..."
        
        while true; do
            run_monitoring_cycle
            echo ""
            echo "Waiting 30 seconds for next cycle..."
            sleep 30
        done
    else
        echo "Running single monitoring cycle..."
        run_monitoring_cycle
        generate_performance_report
    fi
}

# Signal handling for graceful shutdown
trap 'echo -e "\n${YELLOW}Monitoring stopped by user${NC}"; exit 0' INT TERM

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found. Please ensure PostgreSQL client is installed.${NC}"
    exit 1
fi

# Check if bc is available for calculations
if ! command -v bc &> /dev/null; then
    echo -e "${YELLOW}Warning: bc command not found. Some calculations may not work properly.${NC}"
fi

# Run main function
main "$@"