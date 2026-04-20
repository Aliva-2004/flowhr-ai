import {
  addEdge,
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NodePalette from './components/NodePalette';
import InspectorPanel from './components/InspectorPanel';
import SandboxPanel from './components/SandboxPanel';
import StartNode from './nodes/StartNode';
import TaskNode from './nodes/TaskNode';
import ApprovalNode from './nodes/ApprovalNode';
import AutomatedNode from './nodes/AutomatedNode';
import DecisionNode from './nodes/DecisionNode';
import EndNode from './nodes/EndNode';
import api from './services/api';
import type { AutomationAction, TemplateWorkflow, WorkflowEdge, WorkflowNode, WorkflowRecord } from './types/workflow';
import { validateWorkflow } from './utils/validation';

const initialNodes: WorkflowNode[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 100, y: 150 },
    data: { label: 'Start Workflow' },
  },
  {
    id: 'task-1',
    type: 'task',
    position: { x: 380, y: 150 },
    data: { label: 'Collect Documents', assignee: 'HR Executive' },
  },
  {
    id: 'end-1',
    type: 'end',
    position: { x: 680, y: 150 },
    data: { label: 'Workflow Complete', endMessage: 'Done' },
  },
];

const initialEdges: WorkflowEdge[] = [
  { id: 'e1', source: 'start-1', target: 'task-1' },
  { id: 'e2', source: 'task-1', target: 'end-1' },
];

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  decision: DecisionNode,
  end: EndNode,
};

function Header({
  workflows,
  templates,
  onLoadWorkflow,
  onLoadTemplate,
  onExport,
  onReset,
}: {
  workflows: WorkflowRecord[];
  templates: TemplateWorkflow[];
  onLoadWorkflow: (id: number) => void;
  onLoadTemplate: (id: number) => void;
  onExport: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
      <div>
        <h1 className="text-lg font-bold text-white">FlowHR AI – Full Stack Workflow Designer</h1>
        <p className="text-sm text-slate-400">Build, validate, save and simulate HR workflows.</p>
      </div>
      <div className="flex items-center gap-3">
        <select className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200" onChange={(e) => e.target.value && onLoadTemplate(Number(e.target.value))} defaultValue="">
          <option value="">Load Template</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>{template.name}</option>
          ))}
        </select>
        <select className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200" onChange={(e) => e.target.value && onLoadWorkflow(Number(e.target.value))} defaultValue="">
          <option value="">Load Saved Workflow</option>
          {workflows.map((workflow) => (
            <option key={workflow.id} value={workflow.id}>{workflow.name}</option>
          ))}
        </select>
        <button onClick={onExport} className="rounded-xl border border-cyan-600 px-3 py-2 text-sm font-semibold text-cyan-300">Export JSON</button>
        <button onClick={onReset} className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300">Reset</button>
      </div>
    </div>
  );
}

function FlowBuilder() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as Edge[]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [templates, setTemplates] = useState<TemplateWorkflow[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const refreshSavedWorkflows = useCallback(async () => {
    const response = await api.get<WorkflowRecord[]>('/workflows');
    setWorkflows(response.data);
  }, []);

  useEffect(() => {
    const load = async () => {
      const [automationResponse, templateResponse] = await Promise.all([
        api.get<AutomationAction[]>('/automations'),
        api.get<TemplateWorkflow[]>('/templates'),
      ]);
      setActions(automationResponse.data);
      setTemplates(templateResponse.data);
      await refreshSavedWorkflows();
    };
    void load();
  }, [refreshSavedWorkflows]);

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);

  const onConnect = useCallback((params: Connection | Edge) => {
    setEdges((currentEdges) => addEdge({ ...params, id: `e-${Date.now()}` }, currentEdges));
  }, [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !wrapperRef.current) return;

    const bounds = wrapperRef.current.getBoundingClientRect();
    const position = {
      x: event.clientX - bounds.left - 100,
      y: event.clientY - bounds.top - 40,
    };

    const labelMap: Record<string, string> = {
      start: 'Start Workflow',
      task: 'New Task',
      approval: 'Approval Step',
      automated: 'Automated Step',
      decision: 'Decision Check',
      end: 'End Workflow',
    };

    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type: type as WorkflowNode['type'],
      position,
      data: {
        label: labelMap[type] || 'New Node',
      },
    };

    setNodes((currentNodes) => currentNodes.concat(newNode as Node));
  }, [setNodes]);

  const handleSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    const node = params.nodes[0];
    setSelectedNodeId(node?.id ?? null);
  }, []);

  const handleNodeChange = (field: string, value: string | boolean) => {
    if (!selectedNodeId) return;

    setNodes((currentNodes) => currentNodes.map((node) => {
      if (node.id !== selectedNodeId) return node;

      if (field.startsWith('actionParams.')) {
        const key = field.split('.')[1];
        const existing = (node.data.actionParams ?? {}) as Record<string, string>;
        return {
          ...node,
          data: {
            ...node.data,
            actionParams: {
              ...existing,
              [key]: String(value),
            },
          },
        };
      }

      const normalizedValue = field === 'threshold' ? Number(value || 0) : value;
      return {
        ...node,
        data: {
          ...node.data,
          [field]: normalizedValue,
        },
      };
    }));
  };

  const runValidation = () => {
    const result = validateWorkflow(nodes as WorkflowNode[], edges as WorkflowEdge[]);
    setErrors(result.errors);
    setLogs((current) => [result.valid ? 'Validation passed.' : 'Validation failed.', ...current]);
    return result.valid;
  };

  const saveWorkflow = async () => {
    const workflowName = window.prompt('Enter workflow name', 'HR Workflow Demo') || 'HR Workflow Demo';
    await api.post('/workflows', { name: workflowName, nodes, edges });
    await refreshSavedWorkflows();
    setLogs((current) => [`Workflow "${workflowName}" saved.`, ...current]);
  };

  const runSimulation = async () => {
    const isValid = runValidation();
    if (!isValid) return;

    const response = await api.post<{ logs: string[] }>('/simulate', { nodes, edges });
    setLogs(response.data.logs);
  };

  const loadTemplate = async (id: number) => {
    const response = await api.get<TemplateWorkflow>(`/templates/${id}`);
    setNodes(response.data.nodes as Node[]);
    setEdges(response.data.edges as Edge[]);
    setSelectedNodeId(null);
    setLogs((current) => [`Loaded template: ${response.data.name}`, ...current]);
  };

  const loadWorkflow = async (id: number) => {
    const response = await api.get<WorkflowRecord>(`/workflows/${id}`);
    setNodes(response.data.nodes as Node[]);
    setEdges(response.data.edges as Edge[]);
    setSelectedNodeId(null);
    setLogs((current) => [`Loaded saved workflow: ${response.data.name}`, ...current]);
  };

  const exportJson = () => {
    const payload = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workflow.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetDemo = () => {
    setNodes(initialNodes as Node[]);
    setEdges(initialEdges as Edge[]);
    setSelectedNodeId(null);
    setLogs(['Reset to starter workflow.']);
    setErrors([]);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;
      setNodes((currentNodes) => currentNodes.filter((node) => !node.selected));
      setEdges((currentEdges) => currentEdges.filter((edge) => !edge.selected));
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setEdges, setNodes]);

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      <Header workflows={workflows} templates={templates} onLoadWorkflow={loadWorkflow} onLoadTemplate={loadTemplate} onExport={exportJson} onReset={resetDemo} />
      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        <div className="flex flex-1 flex-col" ref={wrapperRef}>
          <div className="flex-1" onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={handleSelectionChange}
              fitView
            >
              <Background gap={16} size={1} />
              
              <Controls />
            </ReactFlow>
          </div>
          <SandboxPanel logs={logs} errors={errors} onRun={runSimulation} onSave={saveWorkflow} onValidate={runValidation} />
        </div>
        <InspectorPanel selectedNode={selectedNode as WorkflowNode | null} actions={actions} onChange={handleNodeChange} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  );
}
