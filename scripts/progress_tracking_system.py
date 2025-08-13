#!/usr/bin/env python3
"""
Progress Tracking System for KitchenPantry CRM Development
Real-time monitoring and reporting of agent progress across all phases
"""

import json
import sys
import os
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
import uuid
import sqlite3
import argparse

class Phase(Enum):
    FOUNDATION = "Phase 1: Foundation (Weeks 1-4)"
    CORE_FEATURES = "Phase 2: Core Features (Weeks 5-8)" 
    DASHBOARD = "Phase 3: Dashboard & Reporting (Weeks 9-12)"
    QUALITY = "Phase 4: Quality & Deployment (Weeks 13-16)"

class Priority(Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class AgentStatus(Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    ON_HOLD = "on_hold"

class DeliverableStatus(Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"

@dataclass
class Agent:
    id: str
    name: str
    priority: Priority
    phases: List[Phase]
    current_status: AgentStatus
    start_date: Optional[datetime]
    planned_end_date: Optional[datetime]
    actual_end_date: Optional[datetime]
    completion_percentage: float
    current_deliverable: str
    notes: str

@dataclass
class Deliverable:
    id: str
    name: str
    agent_id: str
    phase: Phase
    status: DeliverableStatus
    priority: Priority
    estimated_hours: int
    actual_hours: int
    start_date: Optional[datetime]
    due_date: datetime
    completion_date: Optional[datetime]
    completion_percentage: float
    dependencies: List[str]
    blockers: List[str]
    notes: str

@dataclass
class PhaseProgress:
    phase: Phase
    start_date: datetime
    planned_end_date: datetime
    actual_end_date: Optional[datetime]
    completion_percentage: float
    agents_assigned: int
    agents_completed: int
    deliverables_total: int
    deliverables_completed: int
    on_schedule: bool
    risk_level: str

@dataclass
class Milestone:
    id: str
    name: str
    phase: Phase
    due_date: datetime
    completion_date: Optional[datetime]
    status: str
    deliverables: List[str]
    success_criteria: List[str]
    notes: str

class ProgressTrackingSystem:
    def __init__(self, db_path: str = "progress_tracking.db"):
        self.db_path = db_path
        self.init_database()
        self.agents = {}
        self.deliverables = {}
        self.phases = {}
        self.milestones = {}
        self.project_start_date = datetime.now()
        self.project_end_date = self.project_start_date + timedelta(days=112)  # 16 weeks
        
        self._initialize_project_data()
    
    def init_database(self):
        """Initialize SQLite database for progress tracking"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS agents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                priority TEXT NOT NULL,
                phases TEXT NOT NULL,
                current_status TEXT NOT NULL,
                start_date TEXT,
                planned_end_date TEXT,
                actual_end_date TEXT,
                completion_percentage REAL DEFAULT 0,
                current_deliverable TEXT,
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS deliverables (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                phase TEXT NOT NULL,
                status TEXT NOT NULL,
                priority TEXT NOT NULL,
                estimated_hours INTEGER DEFAULT 0,
                actual_hours INTEGER DEFAULT 0,
                start_date TEXT,
                due_date TEXT NOT NULL,
                completion_date TEXT,
                completion_percentage REAL DEFAULT 0,
                dependencies TEXT,
                blockers TEXT,
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (agent_id) REFERENCES agents (id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS milestones (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                phase TEXT NOT NULL,
                due_date TEXT NOT NULL,
                completion_date TEXT,
                status TEXT NOT NULL,
                deliverables TEXT,
                success_criteria TEXT,
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS progress_snapshots (
                id TEXT PRIMARY KEY,
                snapshot_date TEXT NOT NULL,
                overall_progress REAL,
                phase_progress TEXT,
                agent_progress TEXT,
                milestone_status TEXT,
                project_health_score REAL,
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def _initialize_project_data(self):
        """Initialize project with agent and milestone data"""
        
        # Initialize 14 specialized agents
        agents_data = [
            {
                "id": "database_schema_architect",
                "name": "Database Schema Architect",
                "priority": Priority.HIGH,
                "phases": [Phase.FOUNDATION],
                "planned_weeks": 4
            },
            {
                "id": "supabase_integration_specialist", 
                "name": "Supabase Integration Specialist",
                "priority": Priority.HIGH,
                "phases": [Phase.FOUNDATION],
                "planned_weeks": 3
            },
            {
                "id": "vue_component_architect",
                "name": "Vue Component Architect", 
                "priority": Priority.HIGH,
                "phases": [Phase.CORE_FEATURES],
                "planned_weeks": 4
            },
            {
                "id": "typescript_api_service_developer",
                "name": "TypeScript API Service Developer",
                "priority": Priority.HIGH, 
                "phases": [Phase.FOUNDATION, Phase.CORE_FEATURES],
                "planned_weeks": 4
            },
            {
                "id": "pinia_store_manager",
                "name": "Pinia Store Manager",
                "priority": Priority.MEDIUM,
                "phases": [Phase.CORE_FEATURES],
                "planned_weeks": 3
            },
            {
                "id": "multi_step_form_specialist",
                "name": "Multi-Step Form Specialist",
                "priority": Priority.MEDIUM,
                "phases": [Phase.CORE_FEATURES], 
                "planned_weeks": 3
            },
            {
                "id": "crud_interface_developer",
                "name": "CRUD Interface Developer",
                "priority": Priority.LOW,
                "phases": [Phase.CORE_FEATURES],
                "planned_weeks": 3
            },
            {
                "id": "dashboard_component_developer",
                "name": "Dashboard Component Developer",
                "priority": Priority.MEDIUM,
                "phases": [Phase.DASHBOARD],
                "planned_weeks": 4
            },
            {
                "id": "typescript_error_detective",
                "name": "TypeScript Error Detective",
                "priority": Priority.MEDIUM,
                "phases": [Phase.CORE_FEATURES, Phase.DASHBOARD, Phase.QUALITY],
                "planned_weeks": 8
            },
            {
                "id": "performance_optimization_specialist",
                "name": "Performance Optimization Specialist", 
                "priority": Priority.LOW,
                "phases": [Phase.DASHBOARD, Phase.QUALITY],
                "planned_weeks": 3
            },
            {
                "id": "testing_implementation_specialist",
                "name": "Testing Implementation Specialist",
                "priority": Priority.LOW,
                "phases": [Phase.QUALITY],
                "planned_weeks": 4
            },
            {
                "id": "security_implementation_specialist",
                "name": "Security Implementation Specialist",
                "priority": Priority.LOW, 
                "phases": [Phase.QUALITY],
                "planned_weeks": 3
            },
            {
                "id": "eslint_compliance_specialist",
                "name": "ESLint Compliance Specialist",
                "priority": Priority.LOW,
                "phases": [Phase.CORE_FEATURES, Phase.DASHBOARD, Phase.QUALITY],
                "planned_weeks": 6
            },
            {
                "id": "build_deployment_specialist",
                "name": "Build & Deployment Specialist",
                "priority": Priority.LOW,
                "phases": [Phase.QUALITY],
                "planned_weeks": 2
            }
        ]
        
        for agent_data in agents_data:
            if not self.get_agent(agent_data["id"]):
                planned_end = self.project_start_date + timedelta(weeks=agent_data["planned_weeks"])
                agent = Agent(
                    id=agent_data["id"],
                    name=agent_data["name"],
                    priority=agent_data["priority"],
                    phases=agent_data["phases"],
                    current_status=AgentStatus.NOT_STARTED,
                    start_date=None,
                    planned_end_date=planned_end,
                    actual_end_date=None,
                    completion_percentage=0.0,
                    current_deliverable="",
                    notes=""
                )
                self.add_agent(agent)
    
    def add_agent(self, agent: Agent):
        """Add or update agent in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO agents 
            (id, name, priority, phases, current_status, start_date, planned_end_date,
             actual_end_date, completion_percentage, current_deliverable, notes, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            agent.id, agent.name, agent.priority.value,
            json.dumps([p.value for p in agent.phases]),
            agent.current_status.value,
            agent.start_date.isoformat() if agent.start_date else None,
            agent.planned_end_date.isoformat() if agent.planned_end_date else None,
            agent.actual_end_date.isoformat() if agent.actual_end_date else None,
            agent.completion_percentage,
            agent.current_deliverable,
            agent.notes,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        self.agents[agent.id] = agent
    
    def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Retrieve agent from database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM agents WHERE id = ?', (agent_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        phases = [Phase(p) for p in json.loads(row[3])]
        
        agent = Agent(
            id=row[0],
            name=row[1], 
            priority=Priority(row[2]),
            phases=phases,
            current_status=AgentStatus(row[4]),
            start_date=datetime.fromisoformat(row[5]) if row[5] else None,
            planned_end_date=datetime.fromisoformat(row[6]) if row[6] else None,
            actual_end_date=datetime.fromisoformat(row[7]) if row[7] else None,
            completion_percentage=row[8],
            current_deliverable=row[9],
            notes=row[10]
        )
        
        self.agents[agent.id] = agent
        return agent
    
    def update_agent_progress(self, agent_id: str, completion_percentage: float, 
                            current_deliverable: str = None, notes: str = None,
                            status: AgentStatus = None):
        """Update agent progress"""
        agent = self.get_agent(agent_id)
        if not agent:
            raise ValueError(f"Agent {agent_id} not found")
        
        # Update fields
        agent.completion_percentage = completion_percentage
        if current_deliverable:
            agent.current_deliverable = current_deliverable
        if notes:
            agent.notes = notes
        if status:
            old_status = agent.current_status
            agent.current_status = status
            
            # Update dates based on status changes
            now = datetime.now()
            if old_status == AgentStatus.NOT_STARTED and status == AgentStatus.IN_PROGRESS:
                agent.start_date = now
            elif status == AgentStatus.COMPLETED:
                agent.actual_end_date = now
                agent.completion_percentage = 100.0
        
        self.add_agent(agent)
    
    def add_deliverable(self, deliverable: Deliverable):
        """Add deliverable to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO deliverables
            (id, name, agent_id, phase, status, priority, estimated_hours, actual_hours,
             start_date, due_date, completion_date, completion_percentage, dependencies, 
             blockers, notes, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            deliverable.id, deliverable.name, deliverable.agent_id,
            deliverable.phase.value, deliverable.status.value, deliverable.priority.value,
            deliverable.estimated_hours, deliverable.actual_hours,
            deliverable.start_date.isoformat() if deliverable.start_date else None,
            deliverable.due_date.isoformat(),
            deliverable.completion_date.isoformat() if deliverable.completion_date else None,
            deliverable.completion_percentage,
            json.dumps(deliverable.dependencies),
            json.dumps(deliverable.blockers),
            deliverable.notes,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        self.deliverables[deliverable.id] = deliverable
    
    def get_project_overview(self) -> Dict:
        """Get comprehensive project overview"""
        
        # Load all agents
        all_agents = self._load_all_agents()
        
        # Calculate overall statistics
        total_agents = len(all_agents)
        completed_agents = sum(1 for a in all_agents if a.current_status == AgentStatus.COMPLETED)
        in_progress_agents = sum(1 for a in all_agents if a.current_status == AgentStatus.IN_PROGRESS)
        blocked_agents = sum(1 for a in all_agents if a.current_status == AgentStatus.BLOCKED)
        
        # Calculate overall progress (weighted by priority)
        priority_weights = {Priority.HIGH: 3, Priority.MEDIUM: 2, Priority.LOW: 1}
        total_weight = sum(priority_weights[a.priority] for a in all_agents)
        weighted_progress = sum(a.completion_percentage * priority_weights[a.priority] for a in all_agents)
        overall_progress = (weighted_progress / total_weight) if total_weight > 0 else 0
        
        # Phase analysis
        phase_progress = self._calculate_phase_progress(all_agents)
        
        # Timeline analysis
        days_elapsed = (datetime.now() - self.project_start_date).days
        total_project_days = (self.project_end_date - self.project_start_date).days
        timeline_progress = (days_elapsed / total_project_days) * 100
        
        # Schedule analysis
        schedule_variance = overall_progress - timeline_progress
        on_schedule = abs(schedule_variance) <= 10  # Within 10%
        
        # Health score calculation
        health_score = self._calculate_health_score(
            overall_progress, timeline_progress, blocked_agents, total_agents
        )
        
        return {
            "overview": {
                "project_start": self.project_start_date.isoformat(),
                "project_end": self.project_end_date.isoformat(),
                "days_elapsed": days_elapsed,
                "total_days": total_project_days,
                "timeline_progress": round(timeline_progress, 1),
                "overall_progress": round(overall_progress, 1),
                "schedule_variance": round(schedule_variance, 1),
                "on_schedule": on_schedule,
                "health_score": round(health_score, 1)
            },
            "agent_summary": {
                "total_agents": total_agents,
                "completed": completed_agents,
                "in_progress": in_progress_agents,
                "blocked": blocked_agents,
                "not_started": total_agents - completed_agents - in_progress_agents - blocked_agents
            },
            "phase_progress": phase_progress,
            "agents": [self._agent_summary(a) for a in all_agents]
        }
    
    def _load_all_agents(self) -> List[Agent]:
        """Load all agents from database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM agents ORDER BY priority DESC, name')
        rows = cursor.fetchall()
        conn.close()
        
        agents = []
        for row in rows:
            phases = [Phase(p) for p in json.loads(row[3])]
            agent = Agent(
                id=row[0],
                name=row[1],
                priority=Priority(row[2]), 
                phases=phases,
                current_status=AgentStatus(row[4]),
                start_date=datetime.fromisoformat(row[5]) if row[5] else None,
                planned_end_date=datetime.fromisoformat(row[6]) if row[6] else None,
                actual_end_date=datetime.fromisoformat(row[7]) if row[7] else None,
                completion_percentage=row[8],
                current_deliverable=row[9],
                notes=row[10]
            )
            agents.append(agent)
        
        return agents
    
    def _calculate_phase_progress(self, agents: List[Agent]) -> Dict:
        """Calculate progress for each phase"""
        phase_data = {}
        
        for phase in Phase:
            phase_agents = [a for a in agents if phase in a.phases]
            
            if not phase_agents:
                continue
            
            total_agents = len(phase_agents)
            completed_agents = sum(1 for a in phase_agents if a.current_status == AgentStatus.COMPLETED)
            avg_progress = sum(a.completion_percentage for a in phase_agents) / total_agents
            
            # Determine phase status
            if avg_progress >= 100:
                status = "completed"
            elif avg_progress >= 75:
                status = "near_completion"
            elif avg_progress >= 25:
                status = "in_progress"
            else:
                status = "early_stage"
            
            phase_data[phase.value] = {
                "total_agents": total_agents,
                "completed_agents": completed_agents,
                "average_progress": round(avg_progress, 1),
                "status": status,
                "agents": [{"id": a.id, "name": a.name, "progress": a.completion_percentage} for a in phase_agents]
            }
        
        return phase_data
    
    def _agent_summary(self, agent: Agent) -> Dict:
        """Create agent summary"""
        
        # Calculate timeline status
        timeline_status = "on_track"
        if agent.planned_end_date and agent.start_date:
            planned_duration = (agent.planned_end_date - agent.start_date).days
            elapsed_days = (datetime.now() - agent.start_date).days
            expected_progress = (elapsed_days / planned_duration) * 100 if planned_duration > 0 else 0
            
            if agent.completion_percentage < expected_progress - 15:
                timeline_status = "behind"
            elif agent.completion_percentage > expected_progress + 15:
                timeline_status = "ahead"
        
        return {
            "id": agent.id,
            "name": agent.name,
            "priority": agent.priority.value,
            "phases": [p.value for p in agent.phases],
            "status": agent.current_status.value,
            "completion_percentage": agent.completion_percentage,
            "timeline_status": timeline_status,
            "current_deliverable": agent.current_deliverable,
            "start_date": agent.start_date.isoformat() if agent.start_date else None,
            "planned_end_date": agent.planned_end_date.isoformat() if agent.planned_end_date else None,
            "notes": agent.notes
        }
    
    def _calculate_health_score(self, overall_progress: float, timeline_progress: float,
                               blocked_agents: int, total_agents: int) -> float:
        """Calculate project health score (0-100)"""
        
        health_score = 100.0
        
        # Schedule performance (30% weight)
        schedule_variance = abs(overall_progress - timeline_progress)
        if schedule_variance > 20:
            health_score -= 30
        elif schedule_variance > 10:
            health_score -= 15
        elif schedule_variance > 5:
            health_score -= 5
        
        # Blocked agents penalty (25% weight)
        blocked_percentage = (blocked_agents / total_agents) * 100 if total_agents > 0 else 0
        health_score -= min(25, blocked_percentage * 2)
        
        # Progress momentum (25% weight)
        if overall_progress < 10:
            health_score -= 10
        elif overall_progress > 80:
            health_score += 5
        
        # Timeline pressure (20% weight)
        days_elapsed = (datetime.now() - self.project_start_date).days
        total_days = (self.project_end_date - self.project_start_date).days
        time_remaining = total_days - days_elapsed
        
        if time_remaining < 14:  # Less than 2 weeks
            health_score -= 20
        elif time_remaining < 28:  # Less than 4 weeks
            health_score -= 10
        
        return max(0, min(100, health_score))
    
    def get_critical_path_analysis(self) -> Dict:
        """Analyze critical path and dependencies"""
        agents = self._load_all_agents()
        
        # High priority agents form the critical path
        critical_agents = [a for a in agents if a.priority == Priority.HIGH]
        
        # Calculate critical path metrics
        critical_progress = sum(a.completion_percentage for a in critical_agents) / len(critical_agents) if critical_agents else 0
        blocked_critical = sum(1 for a in critical_agents if a.current_status == AgentStatus.BLOCKED)
        
        # Identify bottlenecks
        bottlenecks = []
        for agent in critical_agents:
            if (agent.current_status == AgentStatus.BLOCKED or 
                (agent.current_status == AgentStatus.IN_PROGRESS and agent.completion_percentage < 50)):
                bottlenecks.append({
                    "agent": agent.name,
                    "issue": agent.notes or "Progress slower than expected",
                    "impact": "High - blocks dependent agents"
                })
        
        return {
            "critical_path_progress": round(critical_progress, 1),
            "critical_agents_count": len(critical_agents),
            "blocked_critical_agents": blocked_critical,
            "bottlenecks": bottlenecks,
            "risk_level": "HIGH" if bottlenecks else "MEDIUM" if blocked_critical > 0 else "LOW"
        }
    
    def generate_status_report(self) -> Dict:
        """Generate comprehensive status report"""
        overview = self.get_project_overview()
        critical_path = self.get_critical_path_analysis()
        
        # Risk analysis
        risks = []
        if overview["overview"]["schedule_variance"] < -15:
            risks.append("Project significantly behind schedule")
        if overview["agent_summary"]["blocked"] > 0:
            risks.append(f"{overview['agent_summary']['blocked']} agents are blocked")
        if critical_path["blocked_critical_agents"] > 0:
            risks.append("Critical path agents are blocked")
        if overview["overview"]["health_score"] < 70:
            risks.append("Project health score below acceptable threshold")
        
        # Recommendations
        recommendations = []
        if overview["agent_summary"]["blocked"] > 0:
            recommendations.append("Priority: Resolve agent blockers immediately")
        if overview["overview"]["schedule_variance"] < -10:
            recommendations.append("Consider resource reallocation or scope adjustment")
        if overview["overview"]["health_score"] < 80:
            recommendations.append("Conduct detailed project review and intervention")
        
        return {
            "report_date": datetime.now().isoformat(),
            "project_overview": overview,
            "critical_path_analysis": critical_path,
            "risk_assessment": {
                "risk_level": critical_path["risk_level"],
                "risks": risks,
                "recommendations": recommendations
            },
            "next_actions": self._get_next_actions()
        }
    
    def _get_next_actions(self) -> List[str]:
        """Determine recommended next actions"""
        agents = self._load_all_agents()
        actions = []
        
        # Check for agents ready to start
        ready_agents = [a for a in agents if a.current_status == AgentStatus.NOT_STARTED]
        if ready_agents:
            actions.append(f"Start {len(ready_agents)} agents ready to begin work")
        
        # Check for blocked agents
        blocked_agents = [a for a in agents if a.current_status == AgentStatus.BLOCKED]
        if blocked_agents:
            actions.append(f"Resolve blockers for {len(blocked_agents)} agents")
        
        # Check for overdue agents
        overdue_agents = []
        for agent in agents:
            if (agent.planned_end_date and datetime.now() > agent.planned_end_date and 
                agent.current_status != AgentStatus.COMPLETED):
                overdue_agents.append(agent)
        
        if overdue_agents:
            actions.append(f"Address {len(overdue_agents)} overdue agents")
        
        return actions
    
    def save_progress_snapshot(self):
        """Save current progress snapshot to database"""
        overview = self.get_project_overview()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        snapshot_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO progress_snapshots
            (id, snapshot_date, overall_progress, phase_progress, agent_progress,
             project_health_score, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            snapshot_id,
            datetime.now().isoformat(),
            overview["overview"]["overall_progress"],
            json.dumps(overview["phase_progress"]),
            json.dumps(overview["agent_summary"]),
            overview["overview"]["health_score"],
            f"Automated snapshot - {overview['agent_summary']['in_progress']} agents in progress"
        ))
        
        conn.commit()
        conn.close()
        
        return snapshot_id

def main():
    parser = argparse.ArgumentParser(description="Progress Tracking System for KitchenPantry CRM")
    parser.add_argument("command", choices=[
        "init", "status", "overview", "update", "report", "critical-path", "snapshot"
    ], help="Command to execute")
    parser.add_argument("--agent", help="Agent ID for update operations")
    parser.add_argument("--progress", type=float, help="Completion percentage (0-100)")
    parser.add_argument("--status", choices=[
        "not_started", "in_progress", "completed", "blocked", "on_hold"
    ], help="Agent status")
    parser.add_argument("--deliverable", help="Current deliverable")
    parser.add_argument("--notes", help="Progress notes")
    parser.add_argument("--export", help="Export report to file")
    
    args = parser.parse_args()
    
    tracker = ProgressTrackingSystem()
    
    if args.command == "init":
        print("Progress tracking system initialized.")
        print(f"Database: {tracker.db_path}")
        print(f"Project timeline: {tracker.project_start_date.strftime('%Y-%m-%d')} to {tracker.project_end_date.strftime('%Y-%m-%d')}")
    
    elif args.command == "status":
        overview = tracker.get_project_overview()
        print("\n=== PROJECT STATUS ===")
        print(f"Overall Progress: {overview['overview']['overall_progress']:.1f}%")
        print(f"Timeline Progress: {overview['overview']['timeline_progress']:.1f}%")
        print(f"Schedule Variance: {overview['overview']['schedule_variance']:+.1f}%")
        print(f"Health Score: {overview['overview']['health_score']:.1f}/100")
        print(f"On Schedule: {'Yes' if overview['overview']['on_schedule'] else 'No'}")
        
        print(f"\n=== AGENT SUMMARY ===")
        agent_summary = overview['agent_summary']
        print(f"Total Agents: {agent_summary['total_agents']}")
        print(f"Completed: {agent_summary['completed']}")
        print(f"In Progress: {agent_summary['in_progress']}")
        print(f"Blocked: {agent_summary['blocked']}")
        print(f"Not Started: {agent_summary['not_started']}")
    
    elif args.command == "overview":
        overview = tracker.get_project_overview()
        print("\n=== DETAILED PROJECT OVERVIEW ===")
        
        # Phase progress
        print("\n=== PHASE PROGRESS ===")
        for phase_name, phase_data in overview['phase_progress'].items():
            print(f"\n{phase_name}:")
            print(f"  Progress: {phase_data['average_progress']:.1f}%")
            print(f"  Status: {phase_data['status']}")
            print(f"  Agents: {phase_data['completed_agents']}/{phase_data['total_agents']} completed")
        
        # Agent details
        print("\n=== AGENT DETAILS ===")
        for agent in overview['agents']:
            status_icon = {
                'completed': '✓',
                'in_progress': '→', 
                'blocked': '⚠',
                'not_started': '○',
                'on_hold': '⏸'
            }.get(agent['status'], '?')
            
            timeline_icon = {
                'ahead': '↗',
                'on_track': '→',
                'behind': '↘'
            }.get(agent['timeline_status'], '?')
            
            print(f"{status_icon} {agent['name']} ({agent['priority']})")
            print(f"   Progress: {agent['completion_percentage']:.1f}% {timeline_icon}")
            if agent['current_deliverable']:
                print(f"   Current: {agent['current_deliverable']}")
    
    elif args.command == "update":
        if not args.agent:
            print("Error: --agent required for update command")
            return
        
        try:
            status = AgentStatus(args.status) if args.status else None
            tracker.update_agent_progress(
                agent_id=args.agent,
                completion_percentage=args.progress or 0,
                current_deliverable=args.deliverable,
                notes=args.notes,
                status=status
            )
            print(f"Updated agent {args.agent}")
            
            # Show updated status
            agent = tracker.get_agent(args.agent)
            print(f"Status: {agent.current_status.value}")
            print(f"Progress: {agent.completion_percentage:.1f}%")
            
        except ValueError as e:
            print(f"Error: {e}")
    
    elif args.command == "report":
        report = tracker.generate_status_report()
        
        if args.export:
            with open(args.export, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            print(f"Report exported to {args.export}")
        else:
            print("\n=== PROJECT STATUS REPORT ===")
            print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            overview = report['project_overview']['overview']
            print(f"\nOverall Progress: {overview['overall_progress']:.1f}%")
            print(f"Health Score: {overview['health_score']:.1f}/100")
            print(f"Schedule Status: {'On Track' if overview['on_schedule'] else 'Behind Schedule'}")
            
            if report['risk_assessment']['risks']:
                print(f"\nRisks:")
                for risk in report['risk_assessment']['risks']:
                    print(f"  ⚠ {risk}")
            
            if report['risk_assessment']['recommendations']:
                print(f"\nRecommendations:")
                for rec in report['risk_assessment']['recommendations']:
                    print(f"  → {rec}")
            
            if report['next_actions']:
                print(f"\nNext Actions:")
                for action in report['next_actions']:
                    print(f"  • {action}")
    
    elif args.command == "critical-path":
        critical_path = tracker.get_critical_path_analysis()
        
        print("\n=== CRITICAL PATH ANALYSIS ===")
        print(f"Critical Path Progress: {critical_path['critical_path_progress']:.1f}%")
        print(f"Risk Level: {critical_path['risk_level']}")
        print(f"Blocked Critical Agents: {critical_path['blocked_critical_agents']}")
        
        if critical_path['bottlenecks']:
            print("\nBottlenecks:")
            for bottleneck in critical_path['bottlenecks']:
                print(f"  ⚠ {bottleneck['agent']}: {bottleneck['issue']}")
                print(f"    Impact: {bottleneck['impact']}")
    
    elif args.command == "snapshot":
        snapshot_id = tracker.save_progress_snapshot()
        print(f"Progress snapshot saved: {snapshot_id}")

if __name__ == "__main__":
    main()