import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '../types/workflow';

export default function StartNode({ data }: NodeProps<NodeData>) {
  return (
    <div className="min-w-[180px] rounded-2xl border border-emerald-400 bg-emerald-950 px-4 py-3 shadow-lg shadow-emerald-900/30">
      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Start</div>
      <div className="mt-1 font-semibold text-white">{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
