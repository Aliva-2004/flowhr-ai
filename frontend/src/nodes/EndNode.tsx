import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '../types/workflow';

export default function EndNode({ data }: NodeProps<NodeData>) {
  return (
    <div className="min-w-[180px] rounded-2xl border border-rose-400 bg-rose-950 px-4 py-3 shadow-lg shadow-rose-900/30">
      <Handle type="target" position={Position.Left} />
      <div className="text-xs font-semibold uppercase tracking-wide text-rose-300">End</div>
      <div className="mt-1 font-semibold text-white">{data.label}</div>
    </div>
  );
}
