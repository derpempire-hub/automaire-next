import type { WorkflowNode, WorkflowEdge, WorkflowNodeType } from './types';
import { getNodeDefinition } from './nodeRegistry';

export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  type: 'error' | 'warning';
  code: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validates a workflow canvas state
 */
export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check for empty workflow
  if (nodes.length === 0) {
    errors.push({
      type: 'error',
      code: 'EMPTY_WORKFLOW',
      message: 'Workflow must have at least one node',
    });
    return { isValid: false, errors, warnings };
  }

  // Check for trigger node
  const triggerNodes = nodes.filter((n) => n.type?.startsWith('trigger:'));
  if (triggerNodes.length === 0) {
    errors.push({
      type: 'error',
      code: 'NO_TRIGGER',
      message: 'Workflow must have at least one trigger node',
    });
  } else if (triggerNodes.length > 1) {
    warnings.push({
      type: 'warning',
      code: 'MULTIPLE_TRIGGERS',
      message: 'Workflow has multiple triggers. Only the first trigger will be used.',
    });
  }

  // Check each node
  nodes.forEach((node) => {
    const nodeData = node.data as unknown as Record<string, unknown>;
    const nodeType = node.type as WorkflowNodeType;
    const definition = getNodeDefinition(nodeType);

    if (!definition) {
      errors.push({
        nodeId: node.id,
        type: 'error',
        code: 'UNKNOWN_NODE_TYPE',
        message: `Unknown node type: ${node.type}`,
      });
      return;
    }

    // Check if node is configured
    if (!nodeData.isConfigured && definition.configFields.length > 0) {
      errors.push({
        nodeId: node.id,
        type: 'error',
        code: 'UNCONFIGURED_NODE',
        message: `${definition.label} is not configured`,
      });
    }

    // Check required config fields
    const config = (nodeData.config || {}) as Record<string, unknown>;
    definition.configFields.forEach((field) => {
      if (field.required && !config[field.name]) {
        errors.push({
          nodeId: node.id,
          type: 'error',
          code: 'MISSING_REQUIRED_FIELD',
          message: `${definition.label}: "${field.label}" is required`,
        });
      }
    });

    // Check node has outputs (except for end nodes)
    if (!nodeType.startsWith('trigger:')) {
      const hasInput = edges.some((e) => e.target === node.id);
      if (!hasInput) {
        warnings.push({
          nodeId: node.id,
          type: 'warning',
          code: 'ORPHAN_NODE',
          message: `${definition.label} is not connected to the workflow`,
        });
      }
    }
  });

  // Check for disconnected edges
  edges.forEach((edge) => {
    const sourceExists = nodes.some((n) => n.id === edge.source);
    const targetExists = nodes.some((n) => n.id === edge.target);

    if (!sourceExists || !targetExists) {
      errors.push({
        edgeId: edge.id,
        type: 'error',
        code: 'INVALID_EDGE',
        message: 'Edge connects to non-existent nodes',
      });
    }
  });

  // Check for circular dependencies
  const circularCheck = detectCircularDependency(nodes, edges);
  if (circularCheck) {
    errors.push({
      type: 'error',
      code: 'CIRCULAR_DEPENDENCY',
      message: `Circular dependency detected: ${circularCheck}`,
    });
  }

  // Check condition nodes have both branches
  nodes
    .filter((n) => n.type === 'logic:condition')
    .forEach((node) => {
      const outgoingEdges = edges.filter((e) => e.source === node.id);
      const hasTrue = outgoingEdges.some((e) => e.sourceHandle === 'true');
      const hasFalse = outgoingEdges.some((e) => e.sourceHandle === 'false');

      if (!hasTrue && !hasFalse) {
        warnings.push({
          nodeId: node.id,
          type: 'warning',
          code: 'CONDITION_NO_BRANCHES',
          message: 'Condition node has no connected branches',
        });
      } else if (!hasTrue) {
        warnings.push({
          nodeId: node.id,
          type: 'warning',
          code: 'CONDITION_MISSING_TRUE',
          message: 'Condition node is missing "True" branch',
        });
      } else if (!hasFalse) {
        warnings.push({
          nodeId: node.id,
          type: 'warning',
          code: 'CONDITION_MISSING_FALSE',
          message: 'Condition node is missing "False" branch',
        });
      }
    });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Detect circular dependencies using DFS
 */
function detectCircularDependency(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string | null {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  function dfs(nodeId: string): string | null {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const outgoingEdges = edges.filter((e) => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        const result = dfs(edge.target);
        if (result) return result;
      } else if (recursionStack.has(edge.target)) {
        const cycleStart = path.indexOf(edge.target);
        const cycle = [...path.slice(cycleStart), edge.target];
        return cycle.join(' → ');
      }
    }

    path.pop();
    recursionStack.delete(nodeId);
    return null;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const result = dfs(node.id);
      if (result) return result;
    }
  }

  return null;
}

/**
 * Get a summary of workflow stats
 */
export function getWorkflowStats(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  const triggers = nodes.filter((n) => n.type?.startsWith('trigger:')).length;
  const actions = nodes.filter((n) => n.type?.startsWith('action:')).length;
  const logic = nodes.filter((n) => n.type?.startsWith('logic:')).length;
  const ai = nodes.filter((n) => n.type?.startsWith('ai:')).length;
  const configured = nodes.filter((n) => (n.data as unknown as Record<string, unknown>)?.isConfigured).length;

  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    triggers,
    actions,
    logic,
    ai,
    configured,
    unconfigured: nodes.length - configured,
  };
}
