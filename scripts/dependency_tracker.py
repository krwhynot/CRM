#!/usr/bin/env python3
"""
Dependency Tracker System for KitchenPantry CRM Development
Tracks critical path dependencies between agents and monitors blocker resolution
"""

import json
import sys
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple
from dataclasses import dataclass, asdict
import uuid

class TaskStatus(Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"

class Priority(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class BlockerType(Enum):
    DEPENDENCY = "dependency"
    RESOURCE = "resource"
    TECHNICAL = "technical"
    EXTERNAL = "external"

@dataclass
class Task:
    id: str
    name: str
    agent: str
    status: TaskStatus
    priority: Priority
    estimated_days: int
    actual_days: int
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    dependencies: List[str]  # Task IDs this task depends on
    blocks: List[str]  # Task IDs this task blocks
    deliverables: List[str]
    success_criteria: List[str]
    completion_percentage: float
    notes: str

@dataclass
class Blocker:
    id: str
    task_id: str
    blocker_type: BlockerType
    description: str
    impact: str
    reported_date: datetime
    resolved_date: Optional[datetime]
    assigned_to: str
    resolution_notes: str
    escalated: bool

@dataclass
class CriticalPath:
    path: List[str]  # Task IDs in order
    total_duration: int
    total_float: int  # Slack time available
    risk_level: str
    bottlenecks: List[str]

class DependencyTracker:
    def __init__(self):
        self.tasks: Dict[str, Task] = {}
        self.blockers: Dict[str, Blocker] = {}
        self.project_start_date = datetime.now()
        self.project_end_date = self.project_start_date + timedelta(days=112)  # 16 weeks
    
    def add_task(self, name: str, agent: str, estimated_days: int, 
                 dependencies: List[str] = None, priority: Priority = Priority.MEDIUM,
                 deliverables: List[str] = None, success_criteria: List[str] = None) -> str:
        """Add a new task to the tracker"""
        
        task_id = str(uuid.uuid4())
        
        task = Task(
            id=task_id,
            name=name,
            agent=agent,
            status=TaskStatus.NOT_STARTED,
            priority=priority,
            estimated_days=estimated_days,
            actual_days=0,
            start_date=None,
            end_date=None,
            dependencies=dependencies or [],
            blocks=[],
            deliverables=deliverables or [],
            success_criteria=success_criteria or [],
            completion_percentage=0.0,
            notes=""
        )
        
        self.tasks[task_id] = task
        
        # Update blocks relationships
        for dep_id in task.dependencies:
            if dep_id in self.tasks:
                self.tasks[dep_id].blocks.append(task_id)
        
        return task_id
    
    def update_task_status(self, task_id: str, status: TaskStatus, 
                          completion_percentage: float = None, notes: str = None):
        """Update task status and completion"""
        
        if task_id not in self.tasks:
            raise ValueError(f"Task {task_id} not found")
        
        task = self.tasks[task_id]
        old_status = task.status
        task.status = status
        
        if completion_percentage is not None:
            task.completion_percentage = completion_percentage
        
        if notes:
            task.notes = notes
        
        # Update dates based on status changes
        now = datetime.now()
        
        if old_status == TaskStatus.NOT_STARTED and status == TaskStatus.IN_PROGRESS:
            task.start_date = now
        elif status == TaskStatus.COMPLETED:
            task.end_date = now
            task.completion_percentage = 100.0
            if task.start_date:
                task.actual_days = (now - task.start_date).days
    
    def add_blocker(self, task_id: str, blocker_type: BlockerType, 
                   description: str, impact: str, assigned_to: str = None) -> str:
        """Add a blocker to a task"""
        
        if task_id not in self.tasks:
            raise ValueError(f"Task {task_id} not found")
        
        blocker_id = str(uuid.uuid4())
        
        blocker = Blocker(
            id=blocker_id,
            task_id=task_id,
            blocker_type=blocker_type,
            description=description,
            impact=impact,
            reported_date=datetime.now(),
            resolved_date=None,
            assigned_to=assigned_to or "",
            resolution_notes="",
            escalated=False
        )
        
        self.blockers[blocker_id] = blocker
        
        # Update task status to blocked if not already completed
        task = self.tasks[task_id]
        if task.status != TaskStatus.COMPLETED:
            task.status = TaskStatus.BLOCKED
        
        return blocker_id
    
    def resolve_blocker(self, blocker_id: str, resolution_notes: str):
        """Resolve a blocker"""
        
        if blocker_id not in self.blockers:
            raise ValueError(f"Blocker {blocker_id} not found")
        
        blocker = self.blockers[blocker_id]
        blocker.resolved_date = datetime.now()
        blocker.resolution_notes = resolution_notes
        
        task = self.tasks[blocker.task_id]
        
        # Check if this was the last blocker for the task
        active_blockers = [b for b in self.blockers.values() 
                          if b.task_id == task.id and b.resolved_date is None]
        
        if not active_blockers and task.status == TaskStatus.BLOCKED:
            task.status = TaskStatus.NOT_STARTED  # Ready to start again
    
    def calculate_critical_path(self) -> CriticalPath:
        """Calculate the critical path through all tasks"""
        
        # Build adjacency list
        graph = {}
        in_degree = {}
        
        for task_id, task in self.tasks.items():
            graph[task_id] = task.blocks
            in_degree[task_id] = len(task.dependencies)
        
        # Topological sort to find longest path (critical path)
        queue = [task_id for task_id, degree in in_degree.items() if degree == 0]
        distances = {task_id: 0 for task_id in self.tasks}
        predecessors = {task_id: None for task_id in self.tasks}
        
        while queue:
            current = queue.pop(0)
            current_task = self.tasks[current]
            
            for neighbor in graph[current]:
                new_distance = distances[current] + current_task.estimated_days
                if new_distance > distances[neighbor]:
                    distances[neighbor] = new_distance
                    predecessors[neighbor] = current
                
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        # Find the task with maximum distance (end of critical path)
        end_task = max(distances.keys(), key=lambda x: distances[x])
        total_duration = distances[end_task] + self.tasks[end_task].estimated_days
        
        # Reconstruct critical path
        path = []
        current = end_task
        while current is not None:
            path.append(current)
            current = predecessors[current]
        path.reverse()
        
        # Calculate project float
        project_days = (self.project_end_date - self.project_start_date).days
        total_float = project_days - total_duration
        
        # Identify bottlenecks (tasks with no float)
        bottlenecks = []
        for task_id in path:
            task = self.tasks[task_id]
            if task.priority == Priority.CRITICAL or len(task.blocks) > 2:
                bottlenecks.append(task_id)
        
        # Assess risk level
        if total_float < 0:
            risk_level = "HIGH - Project behind schedule"
        elif total_float < 7:
            risk_level = "MEDIUM - Limited schedule buffer"
        else:
            risk_level = "LOW - Adequate schedule buffer"
        
        return CriticalPath(
            path=path,
            total_duration=total_duration,
            total_float=total_float,
            risk_level=risk_level,
            bottlenecks=bottlenecks
        )
    
    def get_ready_tasks(self) -> List[str]:
        """Get tasks that are ready to start (all dependencies completed)"""
        
        ready_tasks = []
        
        for task_id, task in self.tasks.items():
            if task.status != TaskStatus.NOT_STARTED:
                continue
            
            # Check if all dependencies are completed
            all_deps_complete = all(
                self.tasks[dep_id].status == TaskStatus.COMPLETED 
                for dep_id in task.dependencies 
                if dep_id in self.tasks
            )
            
            # Check if task has no active blockers
            active_blockers = [b for b in self.blockers.values() 
                              if b.task_id == task_id and b.resolved_date is None]
            
            if all_deps_complete and not active_blockers:
                ready_tasks.append(task_id)
        
        # Sort by priority
        priority_order = {Priority.CRITICAL: 0, Priority.HIGH: 1, 
                         Priority.MEDIUM: 2, Priority.LOW: 3}
        
        ready_tasks.sort(key=lambda x: (priority_order[self.tasks[x].priority], 
                                       self.tasks[x].estimated_days))
        
        return ready_tasks
    
    def get_blocked_tasks(self) -> List[Tuple[str, List[str]]]:
        """Get tasks that are currently blocked with their blocker descriptions"""
        
        blocked_tasks = []
        
        for task_id, task in self.tasks.items():
            if task.status == TaskStatus.BLOCKED:
                active_blockers = [b.description for b in self.blockers.values() 
                                  if b.task_id == task_id and b.resolved_date is None]
                blocked_tasks.append((task_id, active_blockers))
        
        return blocked_tasks
    
    def get_overdue_tasks(self) -> List[str]:
        """Get tasks that are overdue based on their estimated completion dates"""
        
        overdue_tasks = []
        now = datetime.now()
        
        for task_id, task in self.tasks.items():
            if (task.status in [TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED] and
                task.start_date and
                (now - task.start_date).days > task.estimated_days):
                overdue_tasks.append(task_id)
        
        return overdue_tasks
    
    def get_agent_workload(self) -> Dict[str, Dict[str, int]]:
        """Get current workload by agent"""
        
        workload = {}
        
        for task in self.tasks.values():
            if task.agent not in workload:
                workload[task.agent] = {
                    "not_started": 0,
                    "in_progress": 0,
                    "blocked": 0,
                    "completed": 0,
                    "total_days": 0,
                    "remaining_days": 0
                }
            
            workload[task.agent][task.status.value] += 1
            workload[task.agent]["total_days"] += task.estimated_days
            
            if task.status in [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED]:
                remaining = task.estimated_days * (1 - task.completion_percentage / 100)
                workload[task.agent]["remaining_days"] += remaining
        
        return workload
    
    def get_dependency_violations(self) -> List[Dict]:
        """Find tasks that may have dependency violations"""
        
        violations = []
        
        for task_id, task in self.tasks.items():
            for dep_id in task.dependencies:
                if dep_id not in self.tasks:
                    violations.append({
                        "task_id": task_id,
                        "task_name": task.name,
                        "issue": f"Dependency {dep_id} not found",
                        "type": "missing_dependency"
                    })
                    continue
                
                dep_task = self.tasks[dep_id]
                
                # Check for circular dependencies
                if task_id in dep_task.dependencies:
                    violations.append({
                        "task_id": task_id,
                        "task_name": task.name,
                        "issue": f"Circular dependency with {dep_id}",
                        "type": "circular_dependency"
                    })
                
                # Check for logical violations (started before dependency completed)
                if (task.status == TaskStatus.IN_PROGRESS and 
                    dep_task.status != TaskStatus.COMPLETED):
                    violations.append({
                        "task_id": task_id,
                        "task_name": task.name,
                        "issue": f"Started before dependency {dep_id} completed",
                        "type": "premature_start"
                    })
        
        return violations
    
    def escalate_blocker(self, blocker_id: str):
        """Escalate a blocker for management attention"""
        
        if blocker_id not in self.blockers:
            raise ValueError(f"Blocker {blocker_id} not found")
        
        self.blockers[blocker_id].escalated = True
    
    def get_project_health(self) -> Dict:
        """Get overall project health metrics"""
        
        total_tasks = len(self.tasks)
        completed_tasks = sum(1 for t in self.tasks.values() 
                            if t.status == TaskStatus.COMPLETED)
        blocked_tasks = sum(1 for t in self.tasks.values() 
                           if t.status == TaskStatus.BLOCKED)
        overdue_tasks = len(self.get_overdue_tasks())
        
        active_blockers = sum(1 for b in self.blockers.values() 
                            if b.resolved_date is None)
        escalated_blockers = sum(1 for b in self.blockers.values() 
                               if b.escalated and b.resolved_date is None)
        
        critical_path = self.calculate_critical_path()
        
        # Calculate completion percentage by estimated days
        total_estimated_days = sum(t.estimated_days for t in self.tasks.values())
        completed_days = sum(t.estimated_days for t in self.tasks.values() 
                           if t.status == TaskStatus.COMPLETED)
        
        progress_percentage = (completed_days / total_estimated_days * 100) if total_estimated_days > 0 else 0
        
        # Health score calculation
        health_score = 100
        health_score -= min(30, blocked_tasks * 5)  # Penalty for blocked tasks
        health_score -= min(20, overdue_tasks * 3)   # Penalty for overdue tasks
        health_score -= min(25, escalated_blockers * 10)  # Penalty for escalated blockers
        
        if critical_path.total_float < 0:
            health_score -= 20  # Major penalty for schedule overrun
        elif critical_path.total_float < 7:
            health_score -= 10  # Minor penalty for tight schedule
        
        health_score = max(0, health_score)
        
        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "blocked_tasks": blocked_tasks,
            "overdue_tasks": overdue_tasks,
            "active_blockers": active_blockers,
            "escalated_blockers": escalated_blockers,
            "progress_percentage": round(progress_percentage, 1),
            "schedule_float_days": critical_path.total_float,
            "risk_level": critical_path.risk_level,
            "health_score": round(health_score, 1)
        }
    
    def export_status_report(self) -> str:
        """Export comprehensive status report"""
        
        health = self.get_project_health()
        critical_path = self.calculate_critical_path()
        ready_tasks = self.get_ready_tasks()
        blocked_tasks = self.get_blocked_tasks()
        overdue_tasks = self.get_overdue_tasks()
        workload = self.get_agent_workload()
        violations = self.get_dependency_violations()
        
        report = {
            "report_date": datetime.now().isoformat(),
            "project_health": health,
            "critical_path": {
                "task_ids": critical_path.path,
                "task_names": [self.tasks[tid].name for tid in critical_path.path],
                "total_duration_days": critical_path.total_duration,
                "schedule_float_days": critical_path.total_float,
                "risk_level": critical_path.risk_level,
                "bottlenecks": critical_path.bottlenecks
            },
            "ready_tasks": [
                {"id": tid, "name": self.tasks[tid].name, "agent": self.tasks[tid].agent}
                for tid in ready_tasks
            ],
            "blocked_tasks": [
                {"id": tid, "name": self.tasks[tid].name, "blockers": blockers}
                for tid, blockers in blocked_tasks
            ],
            "overdue_tasks": [
                {"id": tid, "name": self.tasks[tid].name, "days_overdue": 
                 (datetime.now() - self.tasks[tid].start_date).days - self.tasks[tid].estimated_days}
                for tid in overdue_tasks
            ],
            "agent_workload": workload,
            "dependency_violations": violations,
            "tasks": {tid: asdict(task) for tid, task in self.tasks.items()},
            "blockers": {bid: asdict(blocker) for bid, blocker in self.blockers.items()}
        }
        
        return json.dumps(report, indent=2, default=str)
    
    def load_from_file(self, filename: str):
        """Load tracker state from JSON file"""
        
        with open(filename, 'r') as f:
            data = json.load(f)
        
        # Load tasks
        for task_id, task_data in data.get("tasks", {}).items():
            task_data['status'] = TaskStatus(task_data['status'])
            task_data['priority'] = Priority(task_data['priority'])
            if task_data['start_date']:
                task_data['start_date'] = datetime.fromisoformat(task_data['start_date'])
            if task_data['end_date']:
                task_data['end_date'] = datetime.fromisoformat(task_data['end_date'])
            
            self.tasks[task_id] = Task(**task_data)
        
        # Load blockers
        for blocker_id, blocker_data in data.get("blockers", {}).items():
            blocker_data['blocker_type'] = BlockerType(blocker_data['blocker_type'])
            blocker_data['reported_date'] = datetime.fromisoformat(blocker_data['reported_date'])
            if blocker_data['resolved_date']:
                blocker_data['resolved_date'] = datetime.fromisoformat(blocker_data['resolved_date'])
            
            self.blockers[blocker_id] = Blocker(**blocker_data)
    
    def save_to_file(self, filename: str):
        """Save tracker state to JSON file"""
        
        data = {
            "project_start_date": self.project_start_date.isoformat(),
            "project_end_date": self.project_end_date.isoformat(),
            "tasks": {tid: asdict(task) for tid, task in self.tasks.items()},
            "blockers": {bid: asdict(blocker) for bid, blocker in self.blockers.items()}
        }
        
        with open(filename, 'w') as f:
            json.dumps(data, f, indent=2, default=str)

def main():
    """CLI interface for dependency tracker"""
    
    if len(sys.argv) < 2:
        print("Usage: python dependency_tracker.py <command> [options]")
        print("\nCommands:")
        print("  init - Initialize new tracker")
        print("  add-task <name> <agent> <days> [priority] [dependencies...]")
        print("  update-task <task_id> <status> [completion_%]")
        print("  add-blocker <task_id> <type> <description> <impact>")
        print("  resolve-blocker <blocker_id> <notes>")
        print("  status - Show project status")
        print("  critical-path - Show critical path")
        print("  ready-tasks - Show ready tasks")
        print("  blocked-tasks - Show blocked tasks")
        print("  health - Show project health")
        print("  export [filename] - Export status report")
        return
    
    tracker = DependencyTracker()
    command = sys.argv[1].lower()
    
    # Load existing data if available
    try:
        tracker.load_from_file("dependency_tracker.json")
    except FileNotFoundError:
        pass  # Start fresh
    
    if command == "init":
        print("Dependency tracker initialized.")
        tracker.save_to_file("dependency_tracker.json")
    
    elif command == "add-task":
        if len(sys.argv) < 5:
            print("Usage: add-task <name> <agent> <days> [priority] [dependencies...]")
            return
        
        name = sys.argv[2]
        agent = sys.argv[3]
        days = int(sys.argv[4])
        priority = Priority(sys.argv[5]) if len(sys.argv) > 5 else Priority.MEDIUM
        dependencies = sys.argv[6:] if len(sys.argv) > 6 else []
        
        task_id = tracker.add_task(name, agent, days, dependencies, priority)
        print(f"Added task {task_id}: {name}")
        tracker.save_to_file("dependency_tracker.json")
    
    elif command == "update-task":
        if len(sys.argv) < 4:
            print("Usage: update-task <task_id> <status> [completion_%]")
            return
        
        task_id = sys.argv[2]
        status = TaskStatus(sys.argv[3])
        completion = float(sys.argv[4]) if len(sys.argv) > 4 else None
        
        tracker.update_task_status(task_id, status, completion)
        print(f"Updated task {task_id} to {status}")
        tracker.save_to_file("dependency_tracker.json")
    
    elif command == "add-blocker":
        if len(sys.argv) < 6:
            print("Usage: add-blocker <task_id> <type> <description> <impact>")
            return
        
        task_id = sys.argv[2]
        blocker_type = BlockerType(sys.argv[3])
        description = sys.argv[4]
        impact = sys.argv[5]
        
        blocker_id = tracker.add_blocker(task_id, blocker_type, description, impact)
        print(f"Added blocker {blocker_id} to task {task_id}")
        tracker.save_to_file("dependency_tracker.json")
    
    elif command == "resolve-blocker":
        if len(sys.argv) < 4:
            print("Usage: resolve-blocker <blocker_id> <notes>")
            return
        
        blocker_id = sys.argv[2]
        notes = sys.argv[3]
        
        tracker.resolve_blocker(blocker_id, notes)
        print(f"Resolved blocker {blocker_id}")
        tracker.save_to_file("dependency_tracker.json")
    
    elif command == "status":
        health = tracker.get_project_health()
        print(f"\n=== Project Status ===")
        print(f"Health Score: {health['health_score']}/100")
        print(f"Progress: {health['progress_percentage']}%")
        print(f"Tasks: {health['completed_tasks']}/{health['total_tasks']} completed")
        print(f"Blocked: {health['blocked_tasks']} tasks")
        print(f"Overdue: {health['overdue_tasks']} tasks")
        print(f"Schedule Float: {health['schedule_float_days']} days")
        print(f"Risk Level: {health['risk_level']}")
    
    elif command == "critical-path":
        critical_path = tracker.calculate_critical_path()
        print(f"\n=== Critical Path ===")
        print(f"Duration: {critical_path.total_duration} days")
        print(f"Float: {critical_path.total_float} days")
        print(f"Risk: {critical_path.risk_level}")
        print("Path:")
        for i, task_id in enumerate(critical_path.path):
            task = tracker.tasks[task_id]
            print(f"  {i+1}. {task.name} ({task.agent}) - {task.estimated_days} days")
    
    elif command == "ready-tasks":
        ready_tasks = tracker.get_ready_tasks()
        if ready_tasks:
            print(f"\n=== Ready Tasks ===")
            for task_id in ready_tasks:
                task = tracker.tasks[task_id]
                print(f"- {task.name} ({task.agent}) - {task.estimated_days} days")
        else:
            print("No tasks ready to start.")
    
    elif command == "blocked-tasks":
        blocked_tasks = tracker.get_blocked_tasks()
        if blocked_tasks:
            print(f"\n=== Blocked Tasks ===")
            for task_id, blockers in blocked_tasks:
                task = tracker.tasks[task_id]
                print(f"- {task.name} ({task.agent})")
                for blocker in blockers:
                    print(f"  * {blocker}")
        else:
            print("No tasks currently blocked.")
    
    elif command == "health":
        health = tracker.get_project_health()
        workload = tracker.get_agent_workload()
        
        print(f"\n=== Project Health ===")
        print(f"Overall Health: {health['health_score']}/100")
        print(f"Progress: {health['progress_percentage']}%")
        print(f"Schedule Status: {health['risk_level']}")
        print(f"Active Issues: {health['active_blockers']} blockers, {health['overdue_tasks']} overdue")
        
        print(f"\n=== Agent Workload ===")
        for agent, load in workload.items():
            print(f"{agent}:")
            print(f"  Active: {load['in_progress']} tasks")
            print(f"  Remaining: {load['remaining_days']:.1f} days")
            print(f"  Blocked: {load['blocked']} tasks")
    
    elif command == "export":
        filename = sys.argv[2] if len(sys.argv) > 2 else "status_report.json"
        report = tracker.export_status_report()
        
        with open(filename, 'w') as f:
            f.write(report)
        
        print(f"Status report exported to {filename}")
    
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()