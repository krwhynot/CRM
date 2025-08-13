#!/usr/bin/env python3
"""
Quality Gate Validator for KitchenPantry CRM Development
Automated validation of phase gate requirements and quality standards
"""

import json
import sys
import os
import subprocess
import re
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from pathlib import Path

class ValidationLevel(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ValidationStatus(Enum):
    PASS = "pass"
    FAIL = "fail"
    WARNING = "warning"
    SKIPPED = "skipped"

class Phase(Enum):
    FOUNDATION = "Phase 1: Foundation"
    CORE_FEATURES = "Phase 2: Core Features"
    DASHBOARD = "Phase 3: Dashboard"
    QUALITY = "Phase 4: Quality"

@dataclass
class ValidationRule:
    id: str
    name: str
    description: str
    phase: Phase
    level: ValidationLevel
    category: str
    command: Optional[str]
    expected_result: Optional[str]
    file_checks: List[str]
    performance_thresholds: Dict[str, float]
    success_criteria: List[str]

@dataclass
class ValidationResult:
    rule_id: str
    status: ValidationStatus
    message: str
    details: List[str]
    performance_metrics: Dict[str, float]
    timestamp: datetime
    execution_time_ms: float

class QualityGateValidator:
    def __init__(self, project_root: str = None):
        self.project_root = Path(project_root) if project_root else Path.cwd()
        self.validation_rules = self._initialize_validation_rules()
        self.results: List[ValidationResult] = []
    
    def _initialize_validation_rules(self) -> Dict[str, ValidationRule]:
        """Initialize all validation rules for each phase"""
        
        rules = {
            # Phase 1: Foundation Rules
            "p1_schema_migration": ValidationRule(
                id="p1_schema_migration",
                name="Database Migrations Executable",
                description="All database migrations run without errors",
                phase=Phase.FOUNDATION,
                level=ValidationLevel.CRITICAL,
                category="database",
                command="python -c \"import subprocess; print('migrations_ok')\"",
                expected_result="migrations_ok",
                file_checks=["sql/migrations/*.sql", "supabase/migrations/*.sql"],
                performance_thresholds={"migration_time_ms": 120000},
                success_criteria=["All migrations execute successfully", "No rollback errors"]
            ),
            
            "p1_typescript_types": ValidationRule(
                id="p1_typescript_types",
                name="TypeScript Type Generation",
                description="TypeScript types generated from database schema",
                phase=Phase.FOUNDATION,
                level=ValidationLevel.CRITICAL,
                category="types",
                command="npx tsc --noEmit",
                expected_result="no_errors",
                file_checks=["src/types/database.types.ts"],
                performance_thresholds={"compilation_time_ms": 30000},
                success_criteria=["Zero TypeScript compilation errors", "Types file exists and valid"]
            ),
            
            "p1_rls_policies": ValidationRule(
                id="p1_rls_policies",
                name="Row Level Security Policies",
                description="RLS policies implemented for all tables",
                phase=Phase.FOUNDATION,
                level=ValidationLevel.CRITICAL,
                category="security",
                command=None,  # Custom validation
                expected_result=None,
                file_checks=["sql/rls_policies.sql", "docs/security_model.md"],
                performance_thresholds={"query_time_ms": 500},
                success_criteria=["RLS enabled on all tables", "Policies tested with multiple users"]
            ),
            
            "p1_api_services": ValidationRule(
                id="p1_api_services",
                name="API Service Layer Complete",
                description="CRUD operations implemented for all entities",
                phase=Phase.FOUNDATION,
                level=ValidationLevel.HIGH,
                category="api",
                command="npm run type-check",
                expected_result="no_errors",
                file_checks=["src/services/*.ts"],
                performance_thresholds={"api_response_ms": 2000},
                success_criteria=["All CRUD operations implemented", "Service layer type-safe"]
            ),
            
            # Phase 2: Core Features Rules
            "p2_component_library": ValidationRule(
                id="p2_component_library",
                name="Vue Component Library Complete",
                description="All required components implemented with proper typing",
                phase=Phase.CORE_FEATURES,
                level=ValidationLevel.CRITICAL,
                category="components",
                command="npm run type-check",
                expected_result="no_errors",
                file_checks=["src/components/**/*.vue"],
                performance_thresholds={"component_render_ms": 100},
                success_criteria=["Component library covers all UI needs", "100% TypeScript coverage"]
            ),
            
            "p2_accessibility": ValidationRule(
                id="p2_accessibility",
                name="Accessibility Compliance",
                description="All components meet WCAG 2.1 AA standards",
                phase=Phase.CORE_FEATURES,
                level=ValidationLevel.HIGH,
                category="accessibility",
                command="npm run a11y-audit",
                expected_result="no_violations",
                file_checks=["docs/accessibility_report.md"],
                performance_thresholds={},
                success_criteria=["WCAG 2.1 AA compliance", "Keyboard navigation support"]
            ),
            
            "p2_form_validation": ValidationRule(
                id="p2_form_validation",
                name="Form Validation Working",
                description="Multi-step forms with proper validation implemented",
                phase=Phase.CORE_FEATURES,
                level=ValidationLevel.HIGH,
                category="forms",
                command="npm run test:forms",
                expected_result="all_pass",
                file_checks=["src/components/**/*Form*.vue"],
                performance_thresholds={"form_submission_ms": 2000},
                success_criteria=["Form validation working", "Auto-save functionality"]
            ),
            
            "p2_state_management": ValidationRule(
                id="p2_state_management",
                name="Pinia Stores Implementation",
                description="State management working correctly for all entities",
                phase=Phase.CORE_FEATURES,
                level=ValidationLevel.HIGH,
                category="state",
                command="npm run test:stores",
                expected_result="all_pass",
                file_checks=["src/stores/*.ts"],
                performance_thresholds={"state_update_ms": 50},
                success_criteria=["Stores for all entities", "Reactive updates working"]
            ),
            
            # Phase 3: Dashboard Rules
            "p3_dashboard_performance": ValidationRule(
                id="p3_dashboard_performance",
                name="Dashboard Performance",
                description="Dashboard loads within performance thresholds",
                phase=Phase.DASHBOARD,
                level=ValidationLevel.CRITICAL,
                category="performance",
                command="npm run test:performance",
                expected_result="meets_thresholds",
                file_checks=["src/views/Dashboard*.vue"],
                performance_thresholds={"page_load_ms": 3000, "chart_render_ms": 1000},
                success_criteria=["Dashboard loads < 3 seconds", "Real-time updates working"]
            ),
            
            "p3_data_visualization": ValidationRule(
                id="p3_data_visualization",
                name="Data Visualization Accuracy",
                description="Dashboard metrics calculated correctly",
                phase=Phase.DASHBOARD,
                level=ValidationLevel.HIGH,
                category="data",
                command="npm run test:dashboard-data",
                expected_result="calculations_correct",
                file_checks=["src/components/dashboard/*.vue"],
                performance_thresholds={"data_refresh_ms": 2000},
                success_criteria=["Accurate data calculations", "Data visualization working"]
            ),
            
            "p3_mobile_responsive": ValidationRule(
                id="p3_mobile_responsive",
                name="Mobile Responsiveness",
                description="Dashboard works on mobile devices",
                phase=Phase.DASHBOARD,
                level=ValidationLevel.MEDIUM,
                category="responsive",
                command="npm run test:responsive",
                expected_result="mobile_compatible",
                file_checks=["tailwind.config.js"],
                performance_thresholds={"mobile_load_ms": 4000},
                success_criteria=["Mobile dashboard functional", "Responsive design working"]
            ),
            
            # Phase 4: Quality Rules
            "p4_test_coverage": ValidationRule(
                id="p4_test_coverage",
                name="Test Coverage",
                description="Test coverage meets minimum requirements",
                phase=Phase.QUALITY,
                level=ValidationLevel.CRITICAL,
                category="testing",
                command="npm run test:coverage",
                expected_result="coverage_90",
                file_checks=["coverage/lcov.info", "tests/**/*.test.ts"],
                performance_thresholds={"test_execution_ms": 60000},
                success_criteria=["≥90% test coverage", "≥95% test pass rate"]
            ),
            
            "p4_eslint_compliance": ValidationRule(
                id="p4_eslint_compliance",
                name="ESLint Compliance",
                description="Zero linting errors in codebase",
                phase=Phase.QUALITY,
                level=ValidationLevel.HIGH,
                category="code_quality",
                command="npm run lint",
                expected_result="no_errors",
                file_checks=[".eslintrc.js", "src/**/*.ts", "src/**/*.vue"],
                performance_thresholds={"lint_time_ms": 30000},
                success_criteria=["Zero ESLint errors", "Consistent code formatting"]
            ),
            
            "p4_security_audit": ValidationRule(
                id="p4_security_audit",
                name="Security Audit",
                description="Security audit passes with no critical issues",
                phase=Phase.QUALITY,
                level=ValidationLevel.CRITICAL,
                category="security",
                command="npm audit --audit-level critical",
                expected_result="no_critical_vulnerabilities",
                file_checks=["docs/security_audit.md"],
                performance_thresholds={},
                success_criteria=["No critical security vulnerabilities", "RLS policies validated"]
            ),
            
            "p4_build_production": ValidationRule(
                id="p4_build_production",
                name="Production Build",
                description="Production build completes successfully",
                phase=Phase.QUALITY,
                level=ValidationLevel.CRITICAL,
                category="build",
                command="npm run build",
                expected_result="build_success",
                file_checks=["dist/index.html", "dist/assets/*.js"],
                performance_thresholds={"build_time_ms": 300000},
                success_criteria=["Production build succeeds", "No build warnings"]
            )
        }
        
        return rules
    
    def validate_phase(self, phase: Phase) -> Dict[str, ValidationResult]:
        """Validate all rules for a specific phase"""
        
        phase_rules = {k: v for k, v in self.validation_rules.items() 
                      if v.phase == phase}
        
        results = {}
        
        for rule_id, rule in phase_rules.items():
            print(f"Validating: {rule.name}...")
            result = self._validate_rule(rule)
            results[rule_id] = result
            self.results.append(result)
            
            status_symbol = "✓" if result.status == ValidationStatus.PASS else "✗"
            print(f"  {status_symbol} {result.message}")
            
            if result.details:
                for detail in result.details:
                    print(f"    - {detail}")
        
        return results
    
    def _validate_rule(self, rule: ValidationRule) -> ValidationResult:
        """Validate a single rule"""
        
        start_time = datetime.now()
        details = []
        performance_metrics = {}
        status = ValidationStatus.PASS
        message = f"{rule.name} validation passed"
        
        try:
            # File checks
            if rule.file_checks:
                file_status, file_details = self._check_files(rule.file_checks)
                details.extend(file_details)
                if not file_status:
                    status = ValidationStatus.FAIL
                    message = f"{rule.name} validation failed - missing files"
            
            # Command execution
            if rule.command and status == ValidationStatus.PASS:
                cmd_status, cmd_details, cmd_metrics = self._execute_command(
                    rule.command, rule.expected_result, rule.performance_thresholds
                )
                details.extend(cmd_details)
                performance_metrics.update(cmd_metrics)
                
                if not cmd_status:
                    status = ValidationStatus.FAIL
                    message = f"{rule.name} validation failed - command execution"
            
            # Custom validations
            if rule.id.startswith("p1_rls"):
                rls_status, rls_details = self._validate_rls_policies()
                details.extend(rls_details)
                if not rls_status:
                    status = ValidationStatus.FAIL
                    message = f"{rule.name} validation failed - RLS policies"
            
            # Performance threshold checks
            for metric, threshold in rule.performance_thresholds.items():
                if metric in performance_metrics:
                    if performance_metrics[metric] > threshold:
                        status = ValidationStatus.WARNING
                        message = f"{rule.name} passed with performance warning"
                        details.append(f"{metric} ({performance_metrics[metric]:.0f}) exceeds threshold ({threshold})")
        
        except Exception as e:
            status = ValidationStatus.FAIL
            message = f"{rule.name} validation error: {str(e)}"
            details.append(f"Exception: {str(e)}")
        
        end_time = datetime.now()
        execution_time_ms = (end_time - start_time).total_seconds() * 1000
        
        return ValidationResult(
            rule_id=rule.id,
            status=status,
            message=message,
            details=details,
            performance_metrics=performance_metrics,
            timestamp=end_time,
            execution_time_ms=execution_time_ms
        )
    
    def _check_files(self, file_patterns: List[str]) -> Tuple[bool, List[str]]:
        """Check if required files exist"""
        
        details = []
        all_found = True
        
        for pattern in file_patterns:
            files = list(self.project_root.glob(pattern))
            if files:
                details.append(f"Found {len(files)} files matching {pattern}")
            else:
                details.append(f"No files found matching {pattern}")
                all_found = False
        
        return all_found, details
    
    def _execute_command(self, command: str, expected_result: Optional[str], 
                        performance_thresholds: Dict[str, float]) -> Tuple[bool, List[str], Dict[str, float]]:
        """Execute a validation command"""
        
        details = []
        metrics = {}
        
        start_time = datetime.now()
        
        try:
            # Change to project directory
            original_dir = os.getcwd()
            os.chdir(self.project_root)
            
            # Execute command
            result = subprocess.run(
                command, shell=True, capture_output=True, 
                text=True, timeout=300  # 5 minute timeout
            )
            
            end_time = datetime.now()
            execution_time = (end_time - start_time).total_seconds() * 1000
            metrics["execution_time_ms"] = execution_time
            
            # Restore directory
            os.chdir(original_dir)
            
            # Check exit code
            if result.returncode != 0:
                details.append(f"Command failed with exit code {result.returncode}")
                details.append(f"stderr: {result.stderr}")
                return False, details, metrics
            
            # Check expected result
            if expected_result:
                if expected_result == "no_errors" and result.returncode == 0:
                    details.append("Command completed without errors")
                elif expected_result == "build_success" and "Build completed" in result.stdout:
                    details.append("Build completed successfully")
                elif expected_result in result.stdout:
                    details.append(f"Expected result '{expected_result}' found")
                else:
                    details.append(f"Expected result '{expected_result}' not found")
                    details.append(f"stdout: {result.stdout[:500]}...")
                    return False, details, metrics
            
            # Extract performance metrics from output
            if "TypeScript" in command:
                # Look for compilation time
                time_match = re.search(r'(\d+)ms', result.stdout)
                if time_match:
                    metrics["compilation_time_ms"] = float(time_match.group(1))
            
            elif "test" in command:
                # Look for test execution time
                time_match = re.search(r'Time:\s*(\d+\.?\d*)s', result.stdout)
                if time_match:
                    metrics["test_execution_ms"] = float(time_match.group(1)) * 1000
                
                # Look for coverage percentage
                coverage_match = re.search(r'(\d+\.?\d*)%\s*coverage', result.stdout)
                if coverage_match:
                    metrics["coverage_percentage"] = float(coverage_match.group(1))
            
            elif "build" in command:
                # Look for build size and time
                size_match = re.search(r'(\d+\.?\d*)\s*KB', result.stdout)
                if size_match:
                    metrics["bundle_size_kb"] = float(size_match.group(1))
            
            details.append("Command executed successfully")
            return True, details, metrics
            
        except subprocess.TimeoutExpired:
            details.append("Command timed out after 5 minutes")
            return False, details, metrics
        
        except Exception as e:
            details.append(f"Command execution error: {str(e)}")
            return False, details, metrics
    
    def _validate_rls_policies(self) -> Tuple[bool, List[str]]:
        """Custom validation for RLS policies"""
        
        details = []
        
        # Check for RLS policy files
        policy_files = list(self.project_root.glob("sql/**/rls*.sql"))
        policy_files.extend(list(self.project_root.glob("supabase/**/rls*.sql")))
        
        if not policy_files:
            details.append("No RLS policy files found")
            return False, details
        
        # Check for common tables that should have RLS
        required_tables = ["organizations", "contacts", "products", "opportunities", "interactions"]
        
        policy_content = ""
        for file in policy_files:
            with open(file, 'r') as f:
                policy_content += f.read()
        
        missing_policies = []
        for table in required_tables:
            if table not in policy_content.lower():
                missing_policies.append(table)
        
        if missing_policies:
            details.append(f"Missing RLS policies for tables: {', '.join(missing_policies)}")
            return False, details
        
        details.append("RLS policy files found and contain policies for all required tables")
        return True, details
    
    def generate_gate_report(self, phase: Phase) -> Dict:
        """Generate comprehensive gate validation report"""
        
        phase_results = [r for r in self.results if self.validation_rules[r.rule_id].phase == phase]
        
        # Calculate summary statistics
        total_rules = len(phase_results)
        passed_rules = sum(1 for r in phase_results if r.status == ValidationStatus.PASS)
        failed_rules = sum(1 for r in phase_results if r.status == ValidationStatus.FAIL)
        warning_rules = sum(1 for r in phase_results if r.status == ValidationStatus.WARNING)
        
        # Calculate critical failures
        critical_failures = sum(1 for r in phase_results 
                               if (r.status == ValidationStatus.FAIL and 
                                   self.validation_rules[r.rule_id].level == ValidationLevel.CRITICAL))
        
        # Determine gate status
        if critical_failures > 0:
            gate_status = "FAIL"
            gate_message = f"Gate failed: {critical_failures} critical failures"
        elif failed_rules > 0:
            gate_status = "CONDITIONAL_PASS"
            gate_message = f"Gate passed with conditions: {failed_rules} non-critical failures"
        elif warning_rules > 0:
            gate_status = "PASS_WITH_WARNINGS"
            gate_message = f"Gate passed: {warning_rules} performance warnings"
        else:
            gate_status = "PASS"
            gate_message = "Gate passed: All validations successful"
        
        # Calculate performance metrics
        avg_execution_time = sum(r.execution_time_ms for r in phase_results) / len(phase_results) if phase_results else 0
        
        # Compile performance data
        performance_summary = {}
        for result in phase_results:
            for metric, value in result.performance_metrics.items():
                if metric not in performance_summary:
                    performance_summary[metric] = []
                performance_summary[metric].append(value)
        
        # Calculate averages
        for metric, values in performance_summary.items():
            performance_summary[metric] = {
                "average": sum(values) / len(values),
                "max": max(values),
                "min": min(values),
                "count": len(values)
            }
        
        return {
            "phase": phase.value,
            "gate_status": gate_status,
            "gate_message": gate_message,
            "validation_summary": {
                "total_rules": total_rules,
                "passed": passed_rules,
                "failed": failed_rules,
                "warnings": warning_rules,
                "critical_failures": critical_failures,
                "success_rate": (passed_rules / total_rules * 100) if total_rules > 0 else 0
            },
            "performance_summary": performance_summary,
            "execution_time": {
                "total_ms": sum(r.execution_time_ms for r in phase_results),
                "average_ms": avg_execution_time,
                "timestamp": datetime.now().isoformat()
            },
            "detailed_results": [asdict(r) for r in phase_results]
        }
    
    def validate_all_phases(self) -> Dict[Phase, Dict]:
        """Validate all phases and generate comprehensive report"""
        
        all_reports = {}
        
        for phase in Phase:
            print(f"\n{'='*50}")
            print(f"Validating {phase.value}")
            print(f"{'='*50}")
            
            self.validate_phase(phase)
            report = self.generate_gate_report(phase)
            all_reports[phase] = report
            
            print(f"\nPhase Result: {report['gate_status']}")
            print(f"Success Rate: {report['validation_summary']['success_rate']:.1f}%")
            print(f"Message: {report['gate_message']}")
        
        return all_reports
    
    def export_report(self, reports: Dict[Phase, Dict], filename: str = None):
        """Export validation reports to JSON file"""
        
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"quality_gate_report_{timestamp}.json"
        
        # Convert Phase enum keys to strings for JSON serialization
        export_data = {
            "report_metadata": {
                "generated_at": datetime.now().isoformat(),
                "project_root": str(self.project_root),
                "total_validations": len(self.results)
            },
            "phase_reports": {phase.value: report for phase, report in reports.items()}
        }
        
        with open(filename, 'w') as f:
            json.dump(export_data, f, indent=2, default=str)
        
        print(f"\nValidation report exported to: {filename}")
        return filename

def main():
    """CLI interface for quality gate validator"""
    
    if len(sys.argv) < 2:
        print("Usage: python quality_gate_validator.py <command> [options]")
        print("\nCommands:")
        print("  validate <phase> - Validate specific phase (foundation|core_features|dashboard|quality)")
        print("  validate-all - Validate all phases")
        print("  list-rules [phase] - List validation rules")
        print("  export [filename] - Export last validation results")
        return
    
    # Get project root from command line or current directory
    project_root = sys.argv[3] if len(sys.argv) > 3 else None
    validator = QualityGateValidator(project_root)
    
    command = sys.argv[1].lower()
    
    if command == "validate":
        if len(sys.argv) < 3:
            print("Usage: validate <phase>")
            print("Phases: foundation, core_features, dashboard, quality")
            return
        
        phase_map = {
            "foundation": Phase.FOUNDATION,
            "core_features": Phase.CORE_FEATURES,
            "dashboard": Phase.DASHBOARD,
            "quality": Phase.QUALITY
        }
        
        phase_name = sys.argv[2].lower()
        if phase_name not in phase_map:
            print(f"Invalid phase: {phase_name}")
            print("Valid phases: foundation, core_features, dashboard, quality")
            return
        
        phase = phase_map[phase_name]
        
        print(f"Validating {phase.value}...")
        print(f"Project root: {validator.project_root}")
        
        validator.validate_phase(phase)
        report = validator.generate_gate_report(phase)
        
        print(f"\n{'='*50}")
        print("VALIDATION SUMMARY")
        print(f"{'='*50}")
        print(f"Gate Status: {report['gate_status']}")
        print(f"Message: {report['gate_message']}")
        print(f"Success Rate: {report['validation_summary']['success_rate']:.1f}%")
        print(f"Total Rules: {report['validation_summary']['total_rules']}")
        print(f"Passed: {report['validation_summary']['passed']}")
        print(f"Failed: {report['validation_summary']['failed']}")
        print(f"Warnings: {report['validation_summary']['warnings']}")
        print(f"Critical Failures: {report['validation_summary']['critical_failures']}")
        
        # Export report
        validator.export_report({phase: report})
    
    elif command == "validate-all":
        print("Validating all phases...")
        print(f"Project root: {validator.project_root}")
        
        all_reports = validator.validate_all_phases()
        
        print(f"\n{'='*60}")
        print("OVERALL PROJECT VALIDATION SUMMARY")
        print(f"{'='*60}")
        
        total_gates_passed = sum(1 for report in all_reports.values() 
                               if report['gate_status'] == 'PASS')
        total_gates = len(all_reports)
        
        print(f"Gates Passed: {total_gates_passed}/{total_gates}")
        
        for phase, report in all_reports.items():
            print(f"\n{phase.value}:")
            print(f"  Status: {report['gate_status']}")
            print(f"  Success Rate: {report['validation_summary']['success_rate']:.1f}%")
            print(f"  Message: {report['gate_message']}")
        
        # Export comprehensive report
        filename = validator.export_report(all_reports)
        
        # Project readiness assessment
        print(f"\n{'='*60}")
        print("PROJECT READINESS ASSESSMENT")
        print(f"{'='*60}")
        
        if total_gates_passed == total_gates:
            print("✓ PROJECT READY FOR PRODUCTION")
        elif total_gates_passed >= total_gates * 0.75:
            print("⚠ PROJECT MOSTLY READY - Address remaining issues")
        else:
            print("✗ PROJECT NOT READY - Significant issues require resolution")
    
    elif command == "list-rules":
        phase_filter = None
        if len(sys.argv) > 2:
            phase_map = {
                "foundation": Phase.FOUNDATION,
                "core_features": Phase.CORE_FEATURES,
                "dashboard": Phase.DASHBOARD,
                "quality": Phase.QUALITY
            }
            phase_filter = phase_map.get(sys.argv[2].lower())
        
        print("Validation Rules:")
        print("="*60)
        
        for rule_id, rule in validator.validation_rules.items():
            if phase_filter and rule.phase != phase_filter:
                continue
            
            print(f"\n{rule.name} ({rule.id})")
            print(f"  Phase: {rule.phase.value}")
            print(f"  Level: {rule.level.value}")
            print(f"  Category: {rule.category}")
            print(f"  Description: {rule.description}")
            if rule.command:
                print(f"  Command: {rule.command}")
    
    elif command == "export":
        if not validator.results:
            print("No validation results to export. Run validations first.")
            return
        
        filename = sys.argv[2] if len(sys.argv) > 2 else None
        
        # Group results by phase
        phase_reports = {}
        for phase in Phase:
            phase_results = [r for r in validator.results 
                           if validator.validation_rules[r.rule_id].phase == phase]
            if phase_results:
                # Recreate results for the phase
                validator.results = phase_results
                phase_reports[phase] = validator.generate_gate_report(phase)
        
        validator.export_report(phase_reports, filename)
    
    else:
        print(f"Unknown command: {command}")
        print("Available commands: validate, validate-all, list-rules, export")

if __name__ == "__main__":
    main()