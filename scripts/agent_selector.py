#!/usr/bin/env python3
"""
Agent Selection Script for KitchenPantry CRM Development
Automated tool to recommend appropriate agents based on current phase/task
"""

import json
import sys
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict

class Priority(Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class Phase(Enum):
    FOUNDATION = "Phase 1: Foundation (Weeks 1-4)"
    CORE_FEATURES = "Phase 2: Core Features (Weeks 5-8)"
    DASHBOARD = "Phase 3: Dashboard & Reporting (Weeks 9-12)"
    QUALITY = "Phase 4: Quality & Deployment (Weeks 13-16)"

class TaskComplexity(Enum):
    SIMPLE = "Simple (1-3 days)"
    MEDIUM = "Medium (4-7 days)"
    COMPLEX = "Complex (1-2 weeks)"

class TeamSize(Enum):
    SINGLE = "1 Developer"
    DUAL = "2 Developers"

@dataclass
class Agent:
    name: str
    priority: Priority
    phases: List[Phase]
    specialization: str
    dependencies: List[str]
    blocks: List[str]
    can_work_parallel: List[str]
    deliverables: List[str]
    success_criteria: List[str]
    escalation_triggers: List[str]

@dataclass
class TaskAssessment:
    phase: Phase
    complexity: TaskComplexity
    team_size: TeamSize
    task_description: str
    required_deliverables: List[str]
    timeline_days: int
    current_blockers: List[str]

@dataclass
class AgentRecommendation:
    primary_agent: str
    supporting_agents: List[str]
    alternative_agents: List[str]
    reasoning: str
    estimated_timeline: str
    risk_factors: List[str]
    success_probability: float

class AgentSelector:
    def __init__(self):
        self.agents = self._initialize_agents()
    
    def _initialize_agents(self) -> Dict[str, Agent]:
        """Initialize all available agents with their specifications"""
        
        agents = {
            "database_schema_architect": Agent(
                name="Database Schema Architect",
                priority=Priority.HIGH,
                phases=[Phase.FOUNDATION],
                specialization="PostgreSQL schema design, migrations, RLS policies",
                dependencies=[],
                blocks=["typescript_api_service_developer", "pinia_store_manager"],
                can_work_parallel=["supabase_integration_specialist"],
                deliverables=[
                    "Complete database schema",
                    "Migration scripts",
                    "Index optimization",
                    "Schema documentation"
                ],
                success_criteria=[
                    "All 5 entities fully defined",
                    "Foreign key relationships working",
                    "Migrations run cleanly",
                    "Query performance < 500ms"
                ],
                escalation_triggers=[
                    "Schema conflicts impacting multiple entities",
                    "Performance requiring architectural changes",
                    "Migration failures in development"
                ]
            ),
            
            "supabase_integration_specialist": Agent(
                name="Supabase Integration Specialist",
                priority=Priority.HIGH,
                phases=[Phase.FOUNDATION],
                specialization="RLS policies, authentication, Supabase configuration",
                dependencies=["database_schema_architect"],
                blocks=["vue_component_architect"],
                can_work_parallel=["database_schema_architect"],
                deliverables=[
                    "RLS policies for all tables",
                    "Authentication integration",
                    "Environment configuration",
                    "Security documentation"
                ],
                success_criteria=[
                    "100% RLS coverage",
                    "Authentication working",
                    "Data isolation verified",
                    "Multi-user testing passed"
                ],
                escalation_triggers=[
                    "RLS policy conflicts with business requirements",
                    "Performance degradation from security policies",
                    "Complex authentication requirements"
                ]
            ),
            
            "vue_component_architect": Agent(
                name="Vue Component Architect",
                priority=Priority.HIGH,
                phases=[Phase.CORE_FEATURES],
                specialization="Vue 3 components, design system, accessibility",
                dependencies=["supabase_integration_specialist"],
                blocks=["dashboard_component_developer"],
                can_work_parallel=["pinia_store_manager", "multi_step_form_specialist"],
                deliverables=[
                    "Complete component library",
                    "Design system",
                    "Accessibility compliance",
                    "Mobile responsiveness"
                ],
                success_criteria=[
                    "Component library covers all UI needs",
                    "100% WCAG 2.1 AA compliance",
                    "Mobile responsiveness verified",
                    "Component reusability > 80%"
                ],
                escalation_triggers=[
                    "Design system conflicts requiring architecture changes",
                    "Performance issues with component rendering",
                    "Accessibility conflicts with design requirements"
                ]
            ),
            
            "typescript_api_service_developer": Agent(
                name="TypeScript API Service Developer",
                priority=Priority.HIGH,
                phases=[Phase.FOUNDATION, Phase.CORE_FEATURES],
                specialization="TypeScript, API services, type generation",
                dependencies=["database_schema_architect"],
                blocks=["pinia_store_manager"],
                can_work_parallel=["supabase_integration_specialist"],
                deliverables=[
                    "Complete API service layer",
                    "TypeScript type definitions",
                    "Error handling patterns",
                    "Service integration examples"
                ],
                success_criteria=[
                    "Complete CRUD coverage for all entities",
                    "Zero TypeScript errors",
                    "Error handling for all scenarios",
                    "API operations < 2 seconds"
                ],
                escalation_triggers=[
                    "Complex business logic requiring database procedures",
                    "Performance issues requiring query optimization",
                    "Type generation issues with complex relationships"
                ]
            ),
            
            "pinia_store_manager": Agent(
                name="Pinia Store Manager",
                priority=Priority.MEDIUM,
                phases=[Phase.CORE_FEATURES],
                specialization="Pinia stores, state management, reactivity",
                dependencies=["typescript_api_service_developer"],
                blocks=["vue_component_architect"],
                can_work_parallel=["multi_step_form_specialist"],
                deliverables=[
                    "Stores for all entities",
                    "Reactive state management",
                    "API integration patterns",
                    "State management documentation"
                ],
                success_criteria=[
                    "Stores implemented for all entities",
                    "Reactive updates working correctly",
                    "Error state management implemented",
                    "State updates < 50ms"
                ],
                escalation_triggers=[
                    "Complex state relationships requiring architecture changes",
                    "Performance issues with state updates",
                    "State synchronization issues"
                ]
            ),
            
            "multi_step_form_specialist": Agent(
                name="Multi-Step Form Specialist",
                priority=Priority.MEDIUM,
                phases=[Phase.CORE_FEATURES],
                specialization="Complex forms, form state, validation workflows",
                dependencies=["vue_component_architect"],
                blocks=[],
                can_work_parallel=["pinia_store_manager", "crud_interface_developer"],
                deliverables=[
                    "Multi-step opportunity form",
                    "Form state management",
                    "Auto-save functionality",
                    "Form validation patterns"
                ],
                success_criteria=[
                    "Complete opportunity creation workflow",
                    "Form validation across all steps",
                    "Auto-save preserving state",
                    "Mobile form support"
                ],
                escalation_triggers=[
                    "Complex form logic requiring custom validation",
                    "UX issues impacting completion rates",
                    "Performance issues with form state"
                ]
            ),
            
            "crud_interface_developer": Agent(
                name="CRUD Interface Developer",
                priority=Priority.LOW,
                phases=[Phase.CORE_FEATURES],
                specialization="List views, detail views, data tables",
                dependencies=["vue_component_architect"],
                blocks=[],
                can_work_parallel=["multi_step_form_specialist", "pinia_store_manager"],
                deliverables=[
                    "List views for all entities",
                    "Search and filtering",
                    "Data tables with sorting",
                    "Bulk operations"
                ],
                success_criteria=[
                    "Complete CRUD coverage",
                    "Effective search functionality",
                    "Efficient large dataset handling",
                    "Intuitive data management"
                ],
                escalation_triggers=[
                    "Performance issues with large datasets",
                    "Complex filtering requirements",
                    "User experience issues with data management"
                ]
            ),
            
            "dashboard_component_developer": Agent(
                name="Dashboard Component Developer",
                priority=Priority.MEDIUM,
                phases=[Phase.DASHBOARD],
                specialization="Data visualization, dashboard architecture, metrics",
                dependencies=["vue_component_architect"],
                blocks=[],
                can_work_parallel=["performance_optimization_specialist"],
                deliverables=[
                    "Principal overview cards",
                    "Metrics dashboard",
                    "Activity feed",
                    "Data visualization components"
                ],
                success_criteria=[
                    "All dashboard components implemented",
                    "Dashboard loads < 3 seconds",
                    "Real-time updates working",
                    "Mobile dashboard support"
                ],
                escalation_triggers=[
                    "Performance issues with dashboard loading",
                    "Complex visualization requirements",
                    "Real-time update implementation challenges"
                ]
            ),
            
            "typescript_error_detective": Agent(
                name="TypeScript Error Detective",
                priority=Priority.MEDIUM,
                phases=[Phase.CORE_FEATURES, Phase.DASHBOARD, Phase.QUALITY],
                specialization="TypeScript debugging, type safety, error resolution",
                dependencies=[],
                blocks=[],
                can_work_parallel=["eslint_compliance_specialist"],
                deliverables=[
                    "Zero TypeScript errors",
                    "Enhanced type definitions",
                    "Type utilities",
                    "Type documentation"
                ],
                success_criteria=[
                    "No TypeScript compilation errors",
                    "High type coverage",
                    "Smooth development workflow",
                    "Type safety preventing runtime errors"
                ],
                escalation_triggers=[
                    "Complex type issues requiring architectural changes",
                    "TypeScript configuration conflicts",
                    "Compilation performance issues"
                ]
            ),
            
            "performance_optimization_specialist": Agent(
                name="Performance Optimization Specialist",
                priority=Priority.LOW,
                phases=[Phase.DASHBOARD, Phase.QUALITY],
                specialization="Performance optimization, bundle optimization, caching",
                dependencies=["dashboard_component_developer"],
                blocks=[],
                can_work_parallel=["security_implementation_specialist"],
                deliverables=[
                    "Performance optimization",
                    "Bundle size optimization",
                    "Caching strategies",
                    "Performance monitoring"
                ],
                success_criteria=[
                    "All performance benchmarks met",
                    "Optimized bundle size and loading",
                    "Database queries under thresholds",
                    "Performance monitoring implemented"
                ],
                escalation_triggers=[
                    "Performance issues requiring architectural changes",
                    "Complex optimization requirements",
                    "Performance regression issues"
                ]
            ),
            
            "testing_implementation_specialist": Agent(
                name="Testing Implementation Specialist",
                priority=Priority.LOW,
                phases=[Phase.QUALITY],
                specialization="Test architecture, quality assurance, automation",
                dependencies=[],
                blocks=[],
                can_work_parallel=["build_deployment_specialist"],
                deliverables=[
                    "Comprehensive test suite",
                    "Automated testing pipeline",
                    "Test coverage reporting",
                    "Quality gates"
                ],
                success_criteria=[
                    "≥90% test coverage",
                    "≥95% test pass rate",
                    "Automated testing in CI/CD",
                    "Quality gates preventing regression"
                ],
                escalation_triggers=[
                    "Test reliability issues",
                    "Complex testing scenarios",
                    "CI/CD integration problems"
                ]
            ),
            
            "security_implementation_specialist": Agent(
                name="Security Implementation Specialist",
                priority=Priority.LOW,
                phases=[Phase.QUALITY],
                specialization="Security audit, vulnerability assessment, best practices",
                dependencies=[],
                blocks=[],
                can_work_parallel=["performance_optimization_specialist"],
                deliverables=[
                    "Security audit report",
                    "Security best practices implementation",
                    "Security monitoring",
                    "Security documentation"
                ],
                success_criteria=[
                    "Security audit with no critical issues",
                    "RLS validation complete",
                    "Security best practices followed",
                    "Security procedures documented"
                ],
                escalation_triggers=[
                    "Critical security vulnerabilities found",
                    "Complex security requirements",
                    "Security compliance issues"
                ]
            ),
            
            "eslint_compliance_specialist": Agent(
                name="ESLint Compliance Specialist",
                priority=Priority.LOW,
                phases=[Phase.CORE_FEATURES, Phase.DASHBOARD, Phase.QUALITY],
                specialization="Code quality, linting, formatting standards",
                dependencies=[],
                blocks=[],
                can_work_parallel=["typescript_error_detective"],
                deliverables=[
                    "ESLint configuration",
                    "Code quality standards",
                    "Automated quality checks",
                    "Coding standards documentation"
                ],
                success_criteria=[
                    "Zero ESLint errors",
                    "Consistent code formatting",
                    "Automated quality checking",
                    "Coding standards documented"
                ],
                escalation_triggers=[
                    "ESLint configuration conflicts",
                    "Code quality issues impacting development",
                    "Standards conflicts between team members"
                ]
            ),
            
            "build_deployment_specialist": Agent(
                name="Build & Deployment Specialist",
                priority=Priority.LOW,
                phases=[Phase.QUALITY],
                specialization="Build optimization, deployment automation, DevOps",
                dependencies=[],
                blocks=[],
                can_work_parallel=["testing_implementation_specialist"],
                deliverables=[
                    "Build optimization",
                    "Deployment automation",
                    "Environment configuration",
                    "Deployment documentation"
                ],
                success_criteria=[
                    "Fast and reliable builds",
                    "Automated deployment pipeline",
                    "Proper environment management",
                    "Complete deployment documentation"
                ],
                escalation_triggers=[
                    "Build reliability issues",
                    "Deployment failures",
                    "Environment configuration problems"
                ]
            )
        }
        
        return agents
    
    def get_phase_recommendations(self, assessment: TaskAssessment) -> AgentRecommendation:
        """Get agent recommendations based on task assessment"""
        
        # Filter agents by phase
        phase_agents = {k: v for k, v in self.agents.items() 
                       if assessment.phase in v.phases}
        
        # Get primary agent based on phase and complexity
        primary_agent = self._select_primary_agent(assessment, phase_agents)
        
        # Get supporting agents
        supporting_agents = self._select_supporting_agents(
            assessment, phase_agents, primary_agent
        )
        
        # Get alternative agents
        alternative_agents = self._select_alternative_agents(
            assessment, phase_agents, primary_agent
        )
        
        # Calculate success probability and risks
        success_probability, risk_factors = self._assess_risks(
            assessment, primary_agent, supporting_agents
        )
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            assessment, primary_agent, supporting_agents
        )
        
        # Estimate timeline
        estimated_timeline = self._estimate_timeline(
            assessment, primary_agent, supporting_agents
        )
        
        return AgentRecommendation(
            primary_agent=primary_agent,
            supporting_agents=supporting_agents,
            alternative_agents=alternative_agents,
            reasoning=reasoning,
            estimated_timeline=estimated_timeline,
            risk_factors=risk_factors,
            success_probability=success_probability
        )
    
    def _select_primary_agent(self, assessment: TaskAssessment, 
                             phase_agents: Dict[str, Agent]) -> str:
        """Select the primary agent for the task"""
        
        # Phase-based primary agent mapping
        phase_primaries = {
            Phase.FOUNDATION: "database_schema_architect",
            Phase.CORE_FEATURES: "vue_component_architect",
            Phase.DASHBOARD: "dashboard_component_developer",
            Phase.QUALITY: "testing_implementation_specialist"
        }
        
        primary = phase_primaries.get(assessment.phase)
        
        # If primary agent is not available in filtered agents, find alternative
        if primary not in phase_agents:
            # Find highest priority agent in phase
            high_priority = [k for k, v in phase_agents.items() 
                           if v.priority == Priority.HIGH]
            if high_priority:
                return high_priority[0]
            
            medium_priority = [k for k, v in phase_agents.items() 
                             if v.priority == Priority.MEDIUM]
            if medium_priority:
                return medium_priority[0]
            
            # Fallback to first available agent
            return list(phase_agents.keys())[0]
        
        return primary
    
    def _select_supporting_agents(self, assessment: TaskAssessment, 
                                 phase_agents: Dict[str, Agent], 
                                 primary_agent: str) -> List[str]:
        """Select supporting agents based on complexity and team size"""
        
        supporting = []
        primary_agent_obj = phase_agents[primary_agent]
        
        # Get agents that can work in parallel with primary
        parallel_candidates = [agent for agent in primary_agent_obj.can_work_parallel 
                              if agent in phase_agents]
        
        # Select based on complexity
        if assessment.complexity == TaskComplexity.SIMPLE:
            # Simple tasks - no supporting agents usually needed
            if assessment.team_size == TeamSize.DUAL and parallel_candidates:
                supporting = parallel_candidates[:1]
        
        elif assessment.complexity == TaskComplexity.MEDIUM:
            # Medium tasks - 1 supporting agent
            if parallel_candidates:
                supporting = parallel_candidates[:1]
        
        elif assessment.complexity == TaskComplexity.COMPLEX:
            # Complex tasks - 2-3 supporting agents
            if assessment.team_size == TeamSize.SINGLE:
                supporting = parallel_candidates[:2]
            else:
                supporting = parallel_candidates[:3]
        
        # Add high priority agents if available
        high_priority_available = [k for k, v in phase_agents.items() 
                                 if v.priority == Priority.HIGH 
                                 and k != primary_agent 
                                 and k not in supporting]
        
        if len(supporting) < 2 and high_priority_available:
            supporting.extend(high_priority_available[:2-len(supporting)])
        
        return supporting
    
    def _select_alternative_agents(self, assessment: TaskAssessment, 
                                  phase_agents: Dict[str, Agent], 
                                  primary_agent: str) -> List[str]:
        """Select alternative agents in case primary is unavailable"""
        
        alternatives = []
        
        # Get agents of same priority level
        primary_priority = phase_agents[primary_agent].priority
        same_priority = [k for k, v in phase_agents.items() 
                        if v.priority == primary_priority and k != primary_agent]
        
        alternatives.extend(same_priority[:2])
        
        # Add medium priority agents as fallback
        if len(alternatives) < 2:
            medium_priority = [k for k, v in phase_agents.items() 
                             if v.priority == Priority.MEDIUM and k != primary_agent]
            alternatives.extend(medium_priority[:2-len(alternatives)])
        
        return alternatives
    
    def _assess_risks(self, assessment: TaskAssessment, primary_agent: str, 
                     supporting_agents: List[str]) -> Tuple[float, List[str]]:
        """Assess success probability and risk factors"""
        
        risk_factors = []
        success_probability = 0.85  # Base probability
        
        # Timeline pressure
        if assessment.timeline_days < 3:
            risk_factors.append("Very tight timeline may impact quality")
            success_probability -= 0.1
        elif assessment.timeline_days > 14:
            risk_factors.append("Extended timeline may lead to scope creep")
            success_probability -= 0.05
        
        # Complexity risks
        if assessment.complexity == TaskComplexity.COMPLEX:
            risk_factors.append("Complex task requires careful coordination")
            success_probability -= 0.1
        
        # Team size vs complexity mismatch
        if (assessment.team_size == TeamSize.SINGLE and 
            assessment.complexity == TaskComplexity.COMPLEX):
            risk_factors.append("Single developer handling complex task")
            success_probability -= 0.15
        
        # Blocker risks
        if assessment.current_blockers:
            risk_factors.append(f"Current blockers: {', '.join(assessment.current_blockers)}")
            success_probability -= 0.1 * len(assessment.current_blockers)
        
        # Agent availability
        primary_obj = self.agents[primary_agent]
        if primary_obj.escalation_triggers:
            risk_factors.append("Primary agent has known escalation triggers")
            success_probability -= 0.05
        
        # Ensure probability stays within reasonable bounds
        success_probability = max(0.4, min(0.95, success_probability))
        
        return success_probability, risk_factors
    
    def _generate_reasoning(self, assessment: TaskAssessment, primary_agent: str, 
                           supporting_agents: List[str]) -> str:
        """Generate reasoning for agent selection"""
        
        primary_obj = self.agents[primary_agent]
        
        reasoning_parts = [
            f"Primary agent '{primary_obj.name}' selected as phase lead for {assessment.phase.value}",
            f"Specialization matches task requirements: {primary_obj.specialization}",
        ]
        
        if supporting_agents:
            supporting_names = [self.agents[agent].name for agent in supporting_agents]
            reasoning_parts.append(
                f"Supporting agents ({', '.join(supporting_names)}) provide complementary expertise"
            )
        
        if assessment.complexity == TaskComplexity.COMPLEX:
            reasoning_parts.append(
                "Complex task complexity requires coordinated multi-agent approach"
            )
        
        if assessment.team_size == TeamSize.DUAL:
            reasoning_parts.append(
                "Dual developer team enables parallel work streams"
            )
        
        return ". ".join(reasoning_parts) + "."
    
    def _estimate_timeline(self, assessment: TaskAssessment, primary_agent: str, 
                          supporting_agents: List[str]) -> str:
        """Estimate timeline based on agents and complexity"""
        
        base_days = assessment.timeline_days
        
        # Adjust based on supporting agents
        if supporting_agents and assessment.team_size == TeamSize.DUAL:
            # Parallel work can reduce timeline
            reduction = min(0.3, len(supporting_agents) * 0.15)
            adjusted_days = base_days * (1 - reduction)
        else:
            adjusted_days = base_days
        
        # Adjust for complexity
        if assessment.complexity == TaskComplexity.COMPLEX:
            adjusted_days *= 1.1  # 10% buffer for complexity
        
        adjusted_days = max(1, round(adjusted_days))
        
        if adjusted_days != base_days:
            return f"{adjusted_days} days (adjusted from {base_days} days)"
        else:
            return f"{adjusted_days} days"
    
    def get_dependency_chain(self, target_agent: str) -> List[str]:
        """Get the dependency chain for an agent"""
        
        if target_agent not in self.agents:
            return []
        
        chain = []
        visited = set()
        
        def build_chain(agent_key: str):
            if agent_key in visited:
                return
            visited.add(agent_key)
            
            agent = self.agents[agent_key]
            for dependency in agent.dependencies:
                if dependency in self.agents:
                    build_chain(dependency)
                    if dependency not in chain:
                        chain.append(dependency)
        
        build_chain(target_agent)
        return chain
    
    def get_blocking_impact(self, blocked_agent: str) -> List[str]:
        """Get list of agents that would be blocked by this agent"""
        
        blocked_by = []
        for agent_key, agent in self.agents.items():
            if blocked_agent in agent.blocks:
                blocked_by.append(agent_key)
        
        return blocked_by
    
    def export_configuration(self) -> str:
        """Export current configuration as JSON"""
        
        config = {
            "agents": {k: asdict(v) for k, v in self.agents.items()},
            "metadata": {
                "generated": datetime.now().isoformat(),
                "version": "1.0",
                "total_agents": len(self.agents)
            }
        }
        
        return json.dumps(config, indent=2, default=str)

def main():
    """Main CLI interface"""
    
    if len(sys.argv) < 2:
        print("Usage: python agent_selector.py <command> [options]")
        print("\nCommands:")
        print("  recommend <phase> <complexity> <team_size> [task_description]")
        print("  dependencies <agent_key>")
        print("  blocking <agent_key>")
        print("  export")
        print("  list-agents")
        return
    
    selector = AgentSelector()
    command = sys.argv[1].lower()
    
    if command == "recommend":
        if len(sys.argv) < 5:
            print("Usage: recommend <phase> <complexity> <team_size> [task_description]")
            print("Phases: foundation, core_features, dashboard, quality")
            print("Complexity: simple, medium, complex")
            print("Team Size: single, dual")
            return
        
        # Parse arguments
        phase_map = {
            "foundation": Phase.FOUNDATION,
            "core_features": Phase.CORE_FEATURES,
            "dashboard": Phase.DASHBOARD,
            "quality": Phase.QUALITY
        }
        
        complexity_map = {
            "simple": TaskComplexity.SIMPLE,
            "medium": TaskComplexity.MEDIUM,
            "complex": TaskComplexity.COMPLEX
        }
        
        team_map = {
            "single": TeamSize.SINGLE,
            "dual": TeamSize.DUAL
        }
        
        phase = phase_map.get(sys.argv[2].lower())
        complexity = complexity_map.get(sys.argv[3].lower())
        team_size = team_map.get(sys.argv[4].lower())
        task_description = sys.argv[5] if len(sys.argv) > 5 else "Development task"
        
        if not all([phase, complexity, team_size]):
            print("Invalid arguments. Please check the valid options.")
            return
        
        # Create assessment
        assessment = TaskAssessment(
            phase=phase,
            complexity=complexity,
            team_size=team_size,
            task_description=task_description,
            required_deliverables=[],
            timeline_days=7 if complexity == TaskComplexity.MEDIUM else 
                         3 if complexity == TaskComplexity.SIMPLE else 14,
            current_blockers=[]
        )
        
        # Get recommendation
        recommendation = selector.get_phase_recommendations(assessment)
        
        # Display results
        print(f"\n=== Agent Recommendation for {phase.value} ===")
        print(f"Task: {task_description}")
        print(f"Complexity: {complexity.value}")
        print(f"Team Size: {team_size.value}")
        print(f"\nPrimary Agent: {recommendation.primary_agent}")
        print(f"Supporting Agents: {', '.join(recommendation.supporting_agents) or 'None'}")
        print(f"Alternative Agents: {', '.join(recommendation.alternative_agents) or 'None'}")
        print(f"\nReasoning: {recommendation.reasoning}")
        print(f"Estimated Timeline: {recommendation.estimated_timeline}")
        print(f"Success Probability: {recommendation.success_probability:.1%}")
        if recommendation.risk_factors:
            print(f"Risk Factors:")
            for risk in recommendation.risk_factors:
                print(f"  - {risk}")
    
    elif command == "dependencies":
        if len(sys.argv) < 3:
            print("Usage: dependencies <agent_key>")
            return
        
        agent_key = sys.argv[2]
        chain = selector.get_dependency_chain(agent_key)
        
        if chain:
            print(f"\nDependency chain for {agent_key}:")
            for i, dep in enumerate(chain):
                print(f"  {i+1}. {dep}")
        else:
            print(f"No dependencies found for {agent_key}")
    
    elif command == "blocking":
        if len(sys.argv) < 3:
            print("Usage: blocking <agent_key>")
            return
        
        agent_key = sys.argv[2]
        blocked = selector.get_blocking_impact(agent_key)
        
        if blocked:
            print(f"\nAgents blocked by {agent_key}:")
            for agent in blocked:
                print(f"  - {agent}")
        else:
            print(f"No agents blocked by {agent_key}")
    
    elif command == "export":
        config = selector.export_configuration()
        print(config)
    
    elif command == "list-agents":
        print("\nAvailable Agents:")
        for key, agent in selector.agents.items():
            print(f"  {key}: {agent.name} ({agent.priority.value})")
    
    else:
        print(f"Unknown command: {command}")
        print("Available commands: recommend, dependencies, blocking, export, list-agents")

if __name__ == "__main__":
    main()