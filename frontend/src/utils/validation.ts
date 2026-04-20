import type { WorkflowEdge, WorkflowNode, ValidationResult } from '../types/workflow';

export function validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): ValidationResult {
  const errors: string[] = [];

  const startNodes = nodes.filter((node) => node.type === 'start');
  const endNodes = nodes.filter((node) => node.type === 'end');

  if (startNodes.length === 0) errors.push('Workflow must contain one Start node.');
  if (startNodes.length > 1) errors.push('Workflow can contain only one Start node.');
  if (endNodes.length === 0) errors.push('Workflow must contain at least one End node.');

  const incomingCount = new Map<string, number>();
  const outgoingCount = new Map<string, number>();
  nodes.forEach((node) => {
    incomingCount.set(node.id, 0);
    outgoingCount.set(node.id, 0);
  });

  edges.forEach((edge) => {
    incomingCount.set(edge.target, (incomingCount.get(edge.target) ?? 0) + 1);
    outgoingCount.set(edge.source, (outgoingCount.get(edge.source) ?? 0) + 1);
  });

  nodes.forEach((node) => {
    const incoming = incomingCount.get(node.id) ?? 0;
    const outgoing = outgoingCount.get(node.id) ?? 0;

    if (node.type === 'start' && incoming > 0) {
      errors.push('Start node cannot have incoming edges.');
    }
    if (node.type === 'end' && outgoing > 0) {
      errors.push('End node cannot have outgoing edges.');
    }
    if (node.type !== 'start' && node.type !== 'end' && incoming === 0) {
      errors.push(`${node.data.label || node.id} is disconnected.`);
    }
    if (node.type !== 'end' && outgoing === 0) {
      errors.push(`${node.data.label || node.id} must connect to a next step.`);
    }
    if (!node.data.label?.trim()) {
      errors.push(`Node ${node.id} is missing a title.`);
    }
  });

  return { valid: errors.length === 0, errors };
}
