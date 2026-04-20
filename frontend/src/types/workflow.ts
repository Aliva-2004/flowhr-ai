import type { Edge, Node } from '@xyflow/react';

export type WorkflowNodeType = 'start' | 'task' | 'approval' | 'automated' | 'decision' | 'end';

export interface NodeData {
  label: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  approverRole?: string;
  threshold?: number;
  actionId?: string;
  actionParams?: Record<string, string>;
  conditionField?: string;
  conditionOperator?: string;
  conditionValue?: string;
  endMessage?: string;
  summaryFlag?: boolean;
}

export type WorkflowNode = Node<NodeData, WorkflowNodeType>;
export type WorkflowEdge = Edge;

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface TemplateWorkflow {
  id: number;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowRecord {
  id: number;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  created_at: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
