# Custom Copilot Agents

This directory contains specialized agent instructions for GitHub Copilot coding agent. These agents are designed to handle specific types of tasks with domain expertise.

## Available Agents

### 1. Documentation Agent
**File**: `documentation.instructions.md`  
**Purpose**: Create, update, and maintain high-quality documentation  
**Best for**:
- Writing README files
- Creating API documentation
- Updating guides and tutorials
- Maintaining consistency across documentation

**Example prompts**:
- "Update the API documentation for the projects endpoint"
- "Create a quick start guide for new developers"
- "Document the authentication flow in the README"

### 2. Testing Agent
**File**: `testing.instructions.md`  
**Purpose**: Create comprehensive test suites with proper patterns  
**Best for**:
- Writing unit tests
- Creating integration tests
- Testing React components
- Ensuring proper test coverage

**Example prompts**:
- "Write unit tests for the ProjectService class"
- "Create integration tests for the projects API endpoint"
- "Add tests for the ProjectCard component"

### 3. Security Agent
**File**: `security.instructions.md`  
**Purpose**: Identify and remediate security vulnerabilities  
**Best for**:
- Security code reviews
- Identifying vulnerabilities
- Multi-tenant data isolation checks
- Input validation verification
- Dependency vulnerability scanning

**Example prompts**:
- "Review the authentication logic for security issues"
- "Check if all API endpoints have proper multi-tenant isolation"
- "Scan for potential XSS vulnerabilities in user input handling"

## How Custom Agents Work

Custom agents are specialized versions of GitHub Copilot that have been configured with specific instructions and expertise for particular tasks. When you assign a task to GitHub Copilot, it will automatically:

1. Review available custom agents
2. Select the most appropriate agent for the task
3. Use that agent's specialized knowledge to complete the work

## Agent Instruction Format

Each agent instruction file:
- Describes the agent's expertise and role
- Provides detailed guidelines and best practices
- Includes code examples and patterns
- Defines success criteria
- Specifies when to escalate to human review

## Adding New Agents

To add a new custom agent:

1. Create a new `.instructions.md` file in this directory
2. Name it descriptively (e.g., `performance.instructions.md`)
3. Follow the structure of existing agents:
   - Role and expertise description
   - Detailed guidelines
   - Code examples and patterns
   - Success criteria
4. Document the agent in this README

## Best Practices

- **Specific instructions**: The more specific the agent instructions, the better results
- **Code examples**: Include clear examples of good and bad patterns
- **Project context**: Reference project-specific patterns and conventions
- **Success criteria**: Define what "done" looks like for the agent
- **Escalation rules**: Specify when to involve human review

## Agent Maintenance

Custom agent instructions should be updated when:
- Project patterns or conventions change
- New technologies are adopted
- Common issues are identified
- Best practices evolve

## Learn More

- [GitHub Copilot Custom Agents Documentation](https://docs.github.com/en/copilot/customizing-copilot/creating-custom-agents)
- [Best Practices for Copilot Coding Agent](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
