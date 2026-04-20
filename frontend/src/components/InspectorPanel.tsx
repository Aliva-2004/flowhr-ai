import type { AutomationAction, WorkflowNode } from '../types/workflow';

interface InspectorPanelProps {
  selectedNode: WorkflowNode | null;
  actions: AutomationAction[];
  onChange: (field: string, value: string | boolean) => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-3 block text-sm font-medium text-slate-300">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-100 outline-none focus:border-cyan-500" />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-100 outline-none focus:border-cyan-500" />;
}

export default function InspectorPanel({ selectedNode, actions, onChange }: InspectorPanelProps) {
  if (!selectedNode) {
    return (
      <aside className="w-80 border-l border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
        Select a node to edit it.
      </aside>
    );
  }

  const data = selectedNode.data;
  const selectedAction = actions.find((action) => action.id === data.actionId);

  return (
    <aside className="w-80 overflow-auto border-l border-slate-800 bg-slate-950 p-4 text-slate-200">
      <h3 className="mb-1 text-lg font-semibold text-white">Node Configuration</h3>
      <p className="mb-4 text-xs uppercase tracking-wide text-slate-500">{selectedNode.type}</p>

      <FieldLabel>
        Title
        <Input value={data.label || ''} onChange={(e) => onChange('label', e.target.value)} />
      </FieldLabel>

      {(selectedNode.type === 'task' || selectedNode.type === 'approval' || selectedNode.type === 'automated') && (
        <FieldLabel>
          Description
          <Input value={data.description || ''} onChange={(e) => onChange('description', e.target.value)} />
        </FieldLabel>
      )}

      {selectedNode.type === 'task' && (
        <>
          <FieldLabel>
            Assignee
            <Input value={data.assignee || ''} onChange={(e) => onChange('assignee', e.target.value)} />
          </FieldLabel>
          <FieldLabel>
            Due Date
            <Input type="date" value={data.dueDate || ''} onChange={(e) => onChange('dueDate', e.target.value)} />
          </FieldLabel>
        </>
      )}

      {selectedNode.type === 'approval' && (
        <>
          <FieldLabel>
            Approver Role
            <Input value={data.approverRole || ''} onChange={(e) => onChange('approverRole', e.target.value)} />
          </FieldLabel>
          <FieldLabel>
            Auto Approve Threshold
            <Input type="number" value={String(data.threshold ?? '')} onChange={(e) => onChange('threshold', e.target.value)} />
          </FieldLabel>
        </>
      )}

      {selectedNode.type === 'automated' && (
        <>
          <FieldLabel>
            Action
            <Select value={data.actionId || ''} onChange={(e) => onChange('actionId', e.target.value)}>
              <option value="">Select action</option>
              {actions.map((action) => (
                <option key={action.id} value={action.id}>
                  {action.label}
                </option>
              ))}
            </Select>
          </FieldLabel>
          {selectedAction?.params.map((param) => (
            <FieldLabel key={param}>
              {param}
              <Input
                value={data.actionParams?.[param] || ''}
                onChange={(e) => onChange(`actionParams.${param}`, e.target.value)}
              />
            </FieldLabel>
          ))}
        </>
      )}

      {selectedNode.type === 'decision' && (
        <>
          <FieldLabel>
            Condition Field
            <Input value={data.conditionField || ''} onChange={(e) => onChange('conditionField', e.target.value)} />
          </FieldLabel>
          <FieldLabel>
            Operator
            <Select value={data.conditionOperator || '=='} onChange={(e) => onChange('conditionOperator', e.target.value)}>
              <option value="==">==</option>
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
            </Select>
          </FieldLabel>
          <FieldLabel>
            Compare Value
            <Input value={data.conditionValue || ''} onChange={(e) => onChange('conditionValue', e.target.value)} />
          </FieldLabel>
        </>
      )}

      {selectedNode.type === 'end' && (
        <>
          <FieldLabel>
            End Message
            <Input value={data.endMessage || ''} onChange={(e) => onChange('endMessage', e.target.value)} />
          </FieldLabel>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={Boolean(data.summaryFlag)}
              onChange={(e) => onChange('summaryFlag', e.target.checked)}
            />
            Show summary
          </label>
        </>
      )}
    </aside>
  );
}
