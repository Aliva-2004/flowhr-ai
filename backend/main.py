from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "flowhr.db"

app = FastAPI(title="FlowHR AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUTOMATIONS = [
    {"id": "send_email", "label": "Send Email", "params": ["to", "subject"]},
    {"id": "generate_doc", "label": "Generate Document", "params": ["template", "recipient"]},
    {"id": "create_employee_record", "label": "Create Employee Record", "params": ["employee_id", "department"]},
    {"id": "notify_manager", "label": "Notify Manager", "params": ["manager_email", "message"]},
]

TEMPLATES = [
    {
        "id": 1,
        "name": "Employee Onboarding",
        "description": "Standard onboarding workflow",
        "nodes": [
            {"id": "start-1", "type": "start", "position": {"x": 100, "y": 150}, "data": {"label": "Start Onboarding"}},
            {"id": "task-1", "type": "task", "position": {"x": 360, "y": 150}, "data": {"label": "Collect Documents", "assignee": "HR"}},
            {"id": "approval-1", "type": "approval", "position": {"x": 640, "y": 150}, "data": {"label": "Manager Approval", "approverRole": "Manager"}},
            {"id": "automated-1", "type": "automated", "position": {"x": 920, "y": 150}, "data": {"label": "Send Welcome Email", "actionId": "send_email", "actionParams": {"to": "employee@company.com", "subject": "Welcome"}}},
            {"id": "end-1", "type": "end", "position": {"x": 1200, "y": 150}, "data": {"label": "Workflow Complete", "endMessage": "Onboarding finished"}},
        ],
        "edges": [
            {"id": "e1", "source": "start-1", "target": "task-1"},
            {"id": "e2", "source": "task-1", "target": "approval-1"},
            {"id": "e3", "source": "approval-1", "target": "automated-1"},
            {"id": "e4", "source": "automated-1", "target": "end-1"},
        ],
    },
    {
        "id": 2,
        "name": "Leave Approval",
        "description": "Leave request approval flow",
        "nodes": [
            {"id": "start-1", "type": "start", "position": {"x": 100, "y": 150}, "data": {"label": "Start Leave Request"}},
            {"id": "task-1", "type": "task", "position": {"x": 350, "y": 150}, "data": {"label": "Review Request", "assignee": "HR Executive"}},
            {"id": "decision-1", "type": "decision", "position": {"x": 650, "y": 150}, "data": {"label": "Days > 5?", "conditionField": "leaveDays", "conditionOperator": ">", "conditionValue": "5"}},
            {"id": "approval-1", "type": "approval", "position": {"x": 950, "y": 80}, "data": {"label": "Director Approval", "approverRole": "Director"}},
            {"id": "automated-1", "type": "automated", "position": {"x": 950, "y": 240}, "data": {"label": "Notify Employee", "actionId": "send_email", "actionParams": {"to": "employee@company.com", "subject": "Leave Status"}}},
            {"id": "end-1", "type": "end", "position": {"x": 1250, "y": 160}, "data": {"label": "End Process", "endMessage": "Request completed"}},
        ],
        "edges": [
            {"id": "e1", "source": "start-1", "target": "task-1"},
            {"id": "e2", "source": "task-1", "target": "decision-1"},
            {"id": "e3", "source": "decision-1", "sourceHandle": "yes", "target": "approval-1"},
            {"id": "e4", "source": "decision-1", "sourceHandle": "no", "target": "automated-1"},
            {"id": "e5", "source": "approval-1", "target": "end-1"},
            {"id": "e6", "source": "automated-1", "target": "end-1"},
        ],
    },
]

class WorkflowPayload(BaseModel):
    name: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

class SimulationPayload(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS workflows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                nodes_json TEXT NOT NULL,
                edges_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.commit()


def serialize_workflow(row: sqlite3.Row) -> Dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "nodes": json.loads(row["nodes_json"]),
        "edges": json.loads(row["edges_json"]),
        "created_at": row["created_at"],
    }


def validate_workflow(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> List[str]:
    errors: List[str] = []
    start_nodes = [node for node in nodes if node.get("type") == "start"]
    end_nodes = [node for node in nodes if node.get("type") == "end"]

    if len(start_nodes) == 0:
        errors.append("Workflow must contain one Start node.")
    if len(start_nodes) > 1:
        errors.append("Workflow can contain only one Start node.")
    if len(end_nodes) == 0:
        errors.append("Workflow must contain at least one End node.")

    incoming = {node["id"]: 0 for node in nodes}
    outgoing = {node["id"]: 0 for node in nodes}

    for edge in edges:
        source = edge.get("source")
        target = edge.get("target")
        if source in outgoing:
            outgoing[source] += 1
        if target in incoming:
            incoming[target] += 1

    for node in nodes:
        node_id = node["id"]
        node_type = node.get("type")
        label = node.get("data", {}).get("label", node_id)

        if node_type == "start" and incoming[node_id] > 0:
            errors.append("Start node cannot have incoming edges.")
        if node_type == "end" and outgoing[node_id] > 0:
            errors.append("End node cannot have outgoing edges.")
        if node_type not in {"start", "end"} and incoming[node_id] == 0:
            errors.append(f"{label} is disconnected.")
        if node_type != "end" and outgoing[node_id] == 0:
            errors.append(f"{label} must connect to a next step.")
        if not node.get("data", {}).get("label", "").strip():
            errors.append(f"Node {node_id} is missing a title.")

    return errors


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/")
def root() -> Dict[str, str]:
    return {"message": "FlowHR AI backend running"}


@app.get("/automations")
def get_automations() -> List[Dict[str, Any]]:
    return AUTOMATIONS


@app.get("/templates")
def get_templates() -> List[Dict[str, Any]]:
    return [{"id": item["id"], "name": item["name"], "description": item["description"], "nodes": item["nodes"], "edges": item["edges"]} for item in TEMPLATES]


@app.get("/templates/{template_id}")
def get_template(template_id: int) -> Dict[str, Any]:
    for item in TEMPLATES:
        if item["id"] == template_id:
            return item
    raise HTTPException(status_code=404, detail="Template not found")


@app.get("/workflows")
def get_workflows() -> List[Dict[str, Any]]:
    with get_connection() as connection:
        rows = connection.execute("SELECT * FROM workflows ORDER BY id DESC").fetchall()
    return [serialize_workflow(row) for row in rows]


@app.get("/workflows/{workflow_id}")
def get_workflow(workflow_id: int) -> Dict[str, Any]:
    with get_connection() as connection:
        row = connection.execute("SELECT * FROM workflows WHERE id = ?", (workflow_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return serialize_workflow(row)


@app.post("/workflows")
def save_workflow(payload: WorkflowPayload) -> Dict[str, Any]:
    created_at = datetime.utcnow().isoformat()
    with get_connection() as connection:
        cursor = connection.execute(
            "INSERT INTO workflows (name, nodes_json, edges_json, created_at) VALUES (?, ?, ?, ?)",
            (payload.name, json.dumps(payload.nodes), json.dumps(payload.edges), created_at),
        )
        workflow_id = cursor.lastrowid
        connection.commit()

    return {
        "id": workflow_id,
        "name": payload.name,
        "nodes": payload.nodes,
        "edges": payload.edges,
        "created_at": created_at,
    }


@app.post("/validate")
def validate_endpoint(payload: SimulationPayload) -> Dict[str, Any]:
    errors = validate_workflow(payload.nodes, payload.edges)
    return {"valid": len(errors) == 0, "errors": errors}


@app.post("/simulate")
def simulate_workflow(payload: SimulationPayload) -> Dict[str, Any]:
    validation_errors = validate_workflow(payload.nodes, payload.edges)
    if validation_errors:
        return {"logs": ["Simulation blocked due to validation errors.", *validation_errors]}

    logs: List[str] = []
    node_lookup = {node["id"]: node for node in payload.nodes}
    current = next(node for node in payload.nodes if node.get("type") == "start")
    visited: set[str] = set()

    while current and current["id"] not in visited:
        visited.add(current["id"])
        node_type = current["type"]
        data = current.get("data", {})
        label = data.get("label", node_type)

        if node_type == "task":
            logs.append(f"Task assigned: {label} -> {data.get('assignee', 'Unassigned')}")
        elif node_type == "approval":
            logs.append(f"Approval requested: {label} -> {data.get('approverRole', 'Approver')}")
        elif node_type == "automated":
            logs.append(f"Automation executed: {label} -> {data.get('actionId', 'No action')}" )
        elif node_type == "decision":
            logs.append(
                f"Decision checked: {label} ({data.get('conditionField', 'field')} {data.get('conditionOperator', '==')} {data.get('conditionValue', 'value')})"
            )
        elif node_type == "end":
            logs.append(f"Workflow ended: {label}")
        else:
            logs.append(f"Workflow started: {label}")

        outgoing = [edge for edge in payload.edges if edge.get("source") == current["id"]]
        if not outgoing:
            break

        chosen_edge = outgoing[0]
        if current["type"] == "decision" and len(outgoing) > 1:
            chosen_edge = next((edge for edge in outgoing if edge.get("sourceHandle") == "yes"), outgoing[0])
        current = node_lookup.get(chosen_edge.get("target"))

    logs.append("Simulation completed.")
    return {"logs": logs}
