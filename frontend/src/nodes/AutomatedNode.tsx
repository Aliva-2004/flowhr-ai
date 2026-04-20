import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '../types/workflow';

export default function AutomatedNode({ data }: NodeProps<NodeData>) {
  return (
    <div className="min-w-[240px] rounded-2xl border border-violet-400 bg-violet-950 px-4 py-3 shadow-lg shadow-violet-900/30">
      <Handle type="target" position={Position.Left} />
      <div className="text-xs font-semibold uppercase tracking-wide text-violet-300">Automated</div>
      <div className="mt-1 font-semibold text-white">{data.label}</div>
      <div className="mt-1 text-xs text-slate-300">{data.actionId || 'No action selected'}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
