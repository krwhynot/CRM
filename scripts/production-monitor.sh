#!/bin/bash
# Production Monitoring Script for KitchenPantry CRM
# Monitors application health, database performance, and user experience metrics

set -euo pipefail

PRODUCTION_URL="https://crm.kjrcloud.com"
HEALTH_ENDPOINT="${PRODUCTION_URL}/health.json"
SUPABASE_PROJECT_ID="ixitjldcdvbazvjsnkao"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
LOG_FILE="/home/krwhynot/Projects/CRM/logs/production-monitor-$(date +%Y%m%d).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ensure logs directory exists
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

# 1. Application Health Check
check_application_health() {
    log "Checking application health..."
    
    # Test main application
    if response=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL"); then
        if [ "$response" = "200" ]; then
            success "Application responding: HTTP $response"
        else
            error "Application unhealthy: HTTP $response"
            return 1
        fi
    else
        error "Application unreachable"
        return 1
    fi
    
    # Test health endpoint
    if health_data=$(curl -s "$HEALTH_ENDPOINT"); then
        health_status=$(echo "$health_data" | jq -r '.status')
        if [ "$health_status" = "healthy" ]; then
            success "Health endpoint reports: $health_status"
        else
            warning "Health endpoint reports: $health_status"
        fi
    else
        error "Health endpoint unavailable"
        return 1
    fi
}

# 2. Performance Metrics
check_performance() {
    log "Measuring performance metrics..."
    
    # Measure page load time
    load_time=$(curl -s -o /dev/null -w "%{time_total}" "$PRODUCTION_URL")
    load_time_ms=$(echo "$load_time * 1000" | bc -l)
    
    if (( $(echo "$load_time < 3.0" | bc -l) )); then
        success "Page load time: ${load_time_ms%.???}ms (< 3s target)"
    else
        warning "Page load time: ${load_time_ms%.???}ms (exceeds 3s target)"
    fi
    
    # Check SSL certificate
    ssl_expiry=$(echo | openssl s_client -servername crm.kjrcloud.com -connect crm.kjrcloud.com:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
    ssl_days=$(( ($(date -d "$ssl_expiry" +%s) - $(date +%s)) / 86400 ))
    
    if [ "$ssl_days" -gt 30 ]; then
        success "SSL certificate valid for $ssl_days days"
    else
        warning "SSL certificate expires in $ssl_days days"
    fi
}

# 3. Database Health Check
check_database_health() {
    log "Checking database health via MCP tools..."
    
    # Note: In production, this would ideally use Supabase API to check database metrics
    # For now, we'll verify the application can connect by testing a basic endpoint
    
    # Test if we can reach Supabase
    supabase_url="https://$SUPABASE_PROJECT_ID.supabase.co"
    if response=$(curl -s -o /dev/null -w "%{http_code}" "$supabase_url"); then
        if [ "$response" = "200" ]; then
            success "Database endpoint reachable: HTTP $response"
        else
            warning "Database endpoint response: HTTP $response"
        fi
    else
        error "Database endpoint unreachable"
        return 1
    fi
}

# 4. Security Headers Check
check_security_headers() {
    log "Validating security headers..."
    
    headers=$(curl -s -I "$PRODUCTION_URL")
    
    # Check for required security headers
    security_headers=(
        "x-content-type-options"
        "x-frame-options"
        "x-xss-protection"
        "referrer-policy"
        "content-security-policy"
        "strict-transport-security"
    )
    
    missing_headers=()
    for header in "${security_headers[@]}"; do
        if ! echo "$headers" | grep -i "$header" > /dev/null; then
            missing_headers+=("$header")
        fi
    done
    
    if [ ${#missing_headers[@]} -eq 0 ]; then
        success "All security headers present"
    else
        warning "Missing security headers: ${missing_headers[*]}"
    fi
}

# 5. Core Functionality Test
test_core_functionality() {
    log "Testing core application functionality..."
    
    # Test that key pages load correctly
    pages=(
        "/"
        "/#/dashboard"
        "/#/organizations"
        "/#/contacts"
        "/#/opportunities"
        "/#/products"
        "/#/interactions"
        "/#/import-export"
    )
    
    failed_pages=()
    for page in "${pages[@]}"; do
        if ! curl -s -o /dev/null -f "$PRODUCTION_URL$page"; then
            failed_pages+=("$page")
        fi
    done
    
    if [ ${#failed_pages[@]} -eq 0 ]; then
        success "All core pages accessible"
    else
        error "Failed to load pages: ${failed_pages[*]}"
        return 1
    fi
}

# Main monitoring function
run_monitoring() {
    log "=== Production Monitoring Started ==="
    
    failed_checks=0
    
    if ! check_application_health; then ((failed_checks++)); fi
    check_performance
    if ! check_database_health; then ((failed_checks++)); fi
    check_security_headers
    if ! test_core_functionality; then ((failed_checks++)); fi
    
    # Overall health assessment
    if [ "$failed_checks" -eq 0 ]; then
        success "=== All monitoring checks passed ==="
        exit 0
    elif [ "$failed_checks" -le 2 ]; then
        warning "=== Monitoring completed with $failed_checks warnings ==="
        exit 1
    else
        error "=== Critical monitoring failures detected ($failed_checks) ==="
        exit 2
    fi
}

# Alert function for critical issues
send_alert() {
    local message="$1"
    log "ALERT: $message"
    # In production, this would integrate with alerting systems like:
    # - Email notifications
    # - Slack/Teams webhooks  
    # - PagerDuty
    # - SMS alerts for critical issues
    echo "Production Alert: $message" >> "$LOG_FILE"
}

# Handle script arguments
case "${1:-monitor}" in
    "monitor")
        run_monitoring
        ;;
    "alert")
        send_alert "${2:-Unknown alert}"
        ;;
    "health")
        check_application_health && echo "Healthy"
        ;;
    *)
        echo "Usage: $0 {monitor|alert|health}"
        exit 1
        ;;
esac