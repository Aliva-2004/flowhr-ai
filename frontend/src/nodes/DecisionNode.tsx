import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '../types/workflow';

export default function DecisionNode({ data }: NodeProps<NodeData>) {
  return (
    <div className="min-w-[240px] rounded-2xl border border-fuchsia-400 bg-fuchsia-950 px-4 py-3 shadow-lg shadow-fuchsia-900/30">
      <Handle type="target" position={Position.Left} />
      <div className="text-xs font-semibold uppercase tracking-wide text-fuchsia-300">Decision</div>
      <div className="mt-1 font-semibold text-white">{data.label}</div>
      <div className="mt-1 text-xs text-slate-300">
        {data.conditionField || 'field'} {data.conditionOperator || '=='} {data.conditionValue || 'value'}
      </div>
      <Handle type="source" id="yes" position={Position.Right} style={{ top: '35%' }} />
      <Handle type="source" id="no" position={Position.Right} style={{ top: '70%' }} />
    </div>
  );
}
