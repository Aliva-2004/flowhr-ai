import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '../types/workflow';

export default function ApprovalNode({ data }: NodeProps<NodeData>) {
  return (
    <div className="min-w-[220px] rounded-2xl border border-amber-400 bg-amber-950 px-4 py-3 shadow-lg shadow-amber-900/30">
      <Handle type="target" position={Position.Left} />
      <div className="text-xs font-semibold uppercase tracking-wide text-amber-300">Approval</div>
      <div className="mt-1 font-semibold text-white">{data.label}</div>
      <div className="mt-1 text-xs text-slate-300">{data.approverRole || 'Approver not set'}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
