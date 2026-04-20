import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '../types/workflow';

export default function TaskNode({ data }: NodeProps<NodeData>) {
  return (
    <div className="min-w-[220px] rounded-2xl border border-sky-400 bg-sky-950 px-4 py-3 shadow-lg shadow-sky-900/30">
      <Handle type="target" position={Position.Left} />
      <div className="text-xs font-semibold uppercase tracking-wide text-sky-300">Task</div>
      <div className="mt-1 font-semibold text-white">{data.label}</div>
      <div className="mt-1 text-xs text-slate-300">{data.assignee || 'Unassigned'}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
