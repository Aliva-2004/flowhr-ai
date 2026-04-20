const nodeTypes = [
  { type: 'start', label: 'Start Node' },
  { type: 'task', label: 'Task Node' },
  { type: 'approval', label: 'Approval Node' },
  { type: 'automated', label: 'Automated Node' },
  { type: 'decision', label: 'Decision Node' },
  { type: 'end', label: 'End Node' },
];

export default function NodePalette() {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="flex w-64 flex-col gap-4 border-r border-slate-800 bg-slate-950 p-4">
      <div>
        <h1 className="text-xl font-bold text-white">FlowHR AI</h1>
        <p className="mt-1 text-sm text-slate-400">Drag a node to the canvas.</p>
      </div>
      <div className="space-y-3">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(event) => onDragStart(event, node.type)}
            className="cursor-grab rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm font-medium text-slate-200 transition hover:border-cyan-500 hover:bg-slate-800"
          >
            {node.label}
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400">
        Delete selected node or edge with the <span className="font-semibold text-slate-200">Delete</span> key.
      </div>
    </aside>
  );
}
