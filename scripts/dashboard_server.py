#!/usr/bin/env python3
"""
Success Metrics Dashboard Server
Real-time web server for KitchenPantry CRM project monitoring
"""

from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import json
import sqlite3
import threading
import time
from datetime import datetime, timedelta
from pathlib import Path
import logging
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any
import os
import sys

# Add the scripts directory to the path to import our existing modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from progress_tracking_system import ProgressTrackingSystem, Phase, AgentStatus, Priority
    from quality_gate_validator import QualityGateValidator, ValidationStatus
except ImportError:
    print("Warning: Could not import existing modules. Dashboard will run with limited functionality.")
    ProgressTrackingSystem = None
    QualityGateValidator = None

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dashboard_secret_key_change_in_production'
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DashboardMetrics:
    project_health_score: float
    overall_progress: float
    schedule_status: str
    quality_score: float
    budget_utilization: float
    phase_completion: Dict[str, float]
    active_alerts: List[Dict]
    agent_performance: List[Dict]
    timeline_metrics: Dict
    resource_utilization: Dict

class DashboardServer:
    def __init__(self, project_root: str = None):
        self.project_root = Path(project_root) if project_root else Path.cwd()
        
        # Initialize data sources
        if ProgressTrackingSystem:
            self.progress_tracker = ProgressTrackingSystem()
        else:
            self.progress_tracker = None
            
        if QualityGateValidator:
            self.quality_validator = QualityGateValidator(str(self.project_root))
        else:
            self.quality_validator = None
            
        self.metrics_cache = {}
        self.cache_expiry = {}
        self.cache_duration = 300  # 5 minutes
        
        # Start background data collection
        self.start_background_tasks()
    
    def start_background_tasks(self):
        """Start background threads for data collection and real-time updates"""
        
        def update_metrics():
            while True:
                try:
                    self.collect_metrics()
                    socketio.emit('metrics_update', self.get_current_metrics())
                    time.sleep(30)  # Update every 30 seconds
                except Exception as e:
                    logger.error(f"Error updating metrics: {e}")
                    time.sleep(60)  # Wait longer on error
        
        thread = threading.Thread(target=update_metrics, daemon=True)
        thread.start()
        logger.info("Background metrics collection started")
    
    def collect_metrics(self):
        """Collect all dashboard metrics from various sources"""
        try:
            current_time = datetime.now()
            
            # Collect progress tracking metrics
            if self.progress_tracker:
                progress_overview = self.progress_tracker.get_project_overview()
                critical_path = self.progress_tracker.get_critical_path_analysis()
            else:
                progress_overview = self._mock_progress_data()
                critical_path = self._mock_critical_path_data()
            
            # Collect quality metrics
            quality_metrics = self._collect_quality_metrics()
            
            # Calculate composite metrics
            dashboard_metrics = DashboardMetrics(
                project_health_score=self._calculate_project_health(progress_overview, quality_metrics),
                overall_progress=progress_overview.get('overview', {}).get('overall_progress', 0),
                schedule_status=self._get_schedule_status(progress_overview),
                quality_score=quality_metrics.get('overall_score', 0),
                budget_utilization=self._calculate_budget_utilization(),
                phase_completion=self._get_phase_completion(progress_overview),
                active_alerts=self._generate_alerts(progress_overview, critical_path, quality_metrics),
                agent_performance=self._get_agent_performance(progress_overview),
                timeline_metrics=self._get_timeline_metrics(progress_overview),
                resource_utilization=self._get_resource_utilization()
            )
            
            # Cache the metrics
            self.metrics_cache['dashboard'] = asdict(dashboard_metrics)
            self.cache_expiry['dashboard'] = current_time + timedelta(seconds=self.cache_duration)
            
        except Exception as e:
            logger.error(f"Error collecting metrics: {e}")
    
    def _mock_progress_data(self):
        """Mock progress data when progress tracker is unavailable"""
        return {
            'overview': {
                'overall_progress': 65.0,
                'timeline_progress': 62.5,
                'schedule_variance': 2.5,
                'on_schedule': True,
                'health_score': 87.0
            },
            'agent_summary': {
                'total_agents': 14,
                'completed': 3,
                'in_progress': 6,
                'blocked': 1,
                'not_started': 4
            },
            'agents': [
                {
                    'id': 'database_schema_architect',
                    'name': 'Database Schema Architect',
                    'priority': 'HIGH',
                    'completion_percentage': 100.0,
                    'status': 'completed'
                },
                {
                    'id': 'vue_component_architect',
                    'name': 'Vue Component Architect',
                    'priority': 'HIGH',
                    'completion_percentage': 85.0,
                    'status': 'in_progress'
                }
            ]
        }
    
    def _mock_critical_path_data(self):
        """Mock critical path data when progress tracker is unavailable"""
        return {
            'critical_path_progress': 82.0,
            'critical_agents_count': 4,
            'blocked_critical_agents': 0,
            'bottlenecks': [],
            'risk_level': 'LOW'
        }
    
    def _collect_quality_metrics(self):
        """Collect quality metrics from various sources"""
        quality_data = {
            'overall_score': 94,
            'code_quality': 92,
            'test_coverage': 96,
            'documentation': 90,
            'performance': 98,
            'security': 95,
            'accessibility': 89
        }
        
        # If quality validator is available, use real data
        if self.quality_validator:
            try:
                # This would need to be implemented based on actual quality gate results
                pass
            except Exception as e:
                logger.warning(f"Could not collect quality metrics: {e}")
        
        return quality_data
    
    def _calculate_project_health(self, progress_data, quality_data):
        """Calculate composite project health score"""
        weights = {
            'schedule': 0.25,
            'quality': 0.25,
            'progress': 0.20,
            'risks': 0.15,
            'resources': 0.15
        }
        
        # Get individual scores
        schedule_score = 100 - abs(progress_data.get('overview', {}).get('schedule_variance', 0))
        quality_score = quality_data.get('overall_score', 0)
        progress_score = progress_data.get('overview', {}).get('overall_progress', 0)
        risk_score = 85  # Mock risk score
        resource_score = 83  # Mock resource score
        
        # Calculate weighted health score
        health_score = (
            schedule_score * weights['schedule'] +
            quality_score * weights['quality'] +
            progress_score * weights['progress'] +
            risk_score * weights['risks'] +
            resource_score * weights['resources']
        )
        
        return round(health_score, 1)
    
    def _get_schedule_status(self, progress_data):
        """Determine schedule status from progress data"""
        schedule_variance = progress_data.get('overview', {}).get('schedule_variance', 0)
        on_schedule = progress_data.get('overview', {}).get('on_schedule', True)
        
        if on_schedule and abs(schedule_variance) <= 5:
            return "On Track"
        elif schedule_variance > 0:
            return "Ahead of Schedule"
        else:
            return "Behind Schedule"
    
    def _calculate_budget_utilization(self):
        """Calculate budget utilization percentage"""
        # Mock budget calculation - in real implementation, this would
        # pull from actual budget tracking systems
        return 92.0
    
    def _get_phase_completion(self, progress_data):
        """Extract phase completion percentages"""
        # Mock phase completion data
        return {
            "Phase 1: Foundation": 100,
            "Phase 2: Core Features": 80,
            "Phase 3: Dashboard": 30,
            "Phase 4: Quality": 0
        }
    
    def _generate_alerts(self, progress_data, critical_path, quality_data):
        """Generate active alerts based on current metrics"""
        alerts = []
        
        # Check for critical path issues
        if critical_path.get('blocked_critical_agents', 0) > 0:
            alerts.append({
                'id': 'critical_path_blocked',
                'level': 'critical',
                'title': 'Critical Path Blocked',
                'message': f"{critical_path['blocked_critical_agents']} critical agents are blocked",
                'timestamp': datetime.now().isoformat(),
                'category': 'timeline'
            })
        
        # Check for schedule variance
        schedule_variance = progress_data.get('overview', {}).get('schedule_variance', 0)
        if schedule_variance < -10:
            alerts.append({
                'id': 'schedule_behind',
                'level': 'high',
                'title': 'Schedule Behind Target',
                'message': f"Project is {abs(schedule_variance):.1f}% behind schedule",
                'timestamp': datetime.now().isoformat(),
                'category': 'timeline'
            })
        
        # Check for quality issues
        if quality_data.get('overall_score', 100) < 80:
            alerts.append({
                'id': 'quality_concern',
                'level': 'medium',
                'title': 'Quality Score Below Target',
                'message': f"Quality score is {quality_data['overall_score']}/100",
                'timestamp': datetime.now().isoformat(),
                'category': 'quality'
            })
        
        # Check for blocked agents
        blocked_count = progress_data.get('agent_summary', {}).get('blocked', 0)
        if blocked_count > 0:
            alerts.append({
                'id': 'agents_blocked',
                'level': 'high',
                'title': 'Agents Blocked',
                'message': f"{blocked_count} agents are currently blocked",
                'timestamp': datetime.now().isoformat(),
                'category': 'agents'
            })
        
        return alerts
    
    def _get_agent_performance(self, progress_data):
        """Extract agent performance data"""
        agents = progress_data.get('agents', [])
        performance_data = []
        
        for agent in agents:
            performance_data.append({
                'id': agent.get('id', ''),
                'name': agent.get('name', ''),
                'priority': agent.get('priority', 'MEDIUM'),
                'progress': agent.get('completion_percentage', 0),
                'status': agent.get('status', 'not_started'),
                'timeline_status': agent.get('timeline_status', 'on_track'),
                'current_deliverable': agent.get('current_deliverable', ''),
                'performance_score': self._calculate_agent_performance_score(agent)
            })
        
        return performance_data
    
    def _calculate_agent_performance_score(self, agent):
        """Calculate individual agent performance score"""
        # Mock performance calculation
        progress = agent.get('completion_percentage', 0)
        status = agent.get('status', 'not_started')
        timeline_status = agent.get('timeline_status', 'on_track')
        
        score = progress * 0.4  # Progress weight
        
        # Status bonus/penalty
        if status == 'completed':
            score += 20
        elif status == 'in_progress':
            score += 10
        elif status == 'blocked':
            score -= 15
        
        # Timeline bonus/penalty
        if timeline_status == 'ahead':
            score += 10
        elif timeline_status == 'behind':
            score -= 10
        
        return max(0, min(100, score))
    
    def _get_timeline_metrics(self, progress_data):
        """Extract timeline-related metrics"""
        return {
            'current_week': 10,
            'total_weeks': 16,
            'timeline_progress': progress_data.get('overview', {}).get('timeline_progress', 0),
            'schedule_variance': progress_data.get('overview', {}).get('schedule_variance', 0),
            'milestones_completed': 3,
            'milestones_total': 6,
            'critical_path_health': 85
        }
    
    def _get_resource_utilization(self):
        """Get resource utilization metrics"""
        return {
            'overall_utilization': 83,
            'agent_utilization': 85,
            'tool_usage': 78,
            'infrastructure': 89,
            'knowledge_transfer': 82,
            'optimization_opportunities': [
                'Add support resource to Vue Component Architect',
                'Extend TypeScript Detective to Phase 3 early',
                'Begin Performance Specialist preparation work'
            ]
        }
    
    def get_current_metrics(self):
        """Get current cached metrics"""
        current_time = datetime.now()
        
        # Check if cache is valid
        if ('dashboard' in self.cache_expiry and 
            current_time < self.cache_expiry['dashboard'] and
            'dashboard' in self.metrics_cache):
            return self.metrics_cache['dashboard']
        
        # Collect fresh metrics if cache is expired
        self.collect_metrics()
        return self.metrics_cache.get('dashboard', {})

# Initialize dashboard server
dashboard_server = DashboardServer()

# Flask Routes
@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('dashboard.html')

@app.route('/api/metrics')
def get_metrics():
    """API endpoint for current metrics"""
    try:
        metrics = dashboard_server.get_current_metrics()
        return jsonify({
            'success': True,
            'data': metrics,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error serving metrics: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/alerts')
def get_alerts():
    """API endpoint for active alerts"""
    try:
        metrics = dashboard_server.get_current_metrics()
        alerts = metrics.get('active_alerts', [])
        return jsonify({
            'success': True,
            'data': alerts,
            'count': len(alerts),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error serving alerts: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/agents')
def get_agent_performance():
    """API endpoint for agent performance data"""
    try:
        metrics = dashboard_server.get_current_metrics()
        agents = metrics.get('agent_performance', [])
        return jsonify({
            'success': True,
            'data': agents,
            'count': len(agents),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error serving agent data: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

# WebSocket Events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    # Send current metrics to newly connected client
    emit('metrics_update', dashboard_server.get_current_metrics())

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('request_update')
def handle_update_request():
    """Handle manual update request from client"""
    logger.info(f"Manual update requested by client: {request.sid}")
    dashboard_server.collect_metrics()
    emit('metrics_update', dashboard_server.get_current_metrics())

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Success Metrics Dashboard Server')
    parser.add_argument('--port', type=int, default=5000, help='Port to run server on')
    parser.add_argument('--host', default='localhost', help='Host to bind to')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    parser.add_argument('--project-root', help='Project root directory')
    
    args = parser.parse_args()
    
    # Initialize dashboard with project root if provided
    if args.project_root:
        dashboard_server = DashboardServer(args.project_root)
    
    logger.info(f"Starting Success Metrics Dashboard Server on {args.host}:{args.port}")
    logger.info(f"Project root: {dashboard_server.project_root}")
    logger.info("Dashboard will be available at http://{}:{}".format(args.host, args.port))
    
    try:
        socketio.run(
            app, 
            host=args.host, 
            port=args.port, 
            debug=args.debug,
            allow_unsafe_werkzeug=True
        )
    except KeyboardInterrupt:
        logger.info("Dashboard server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")