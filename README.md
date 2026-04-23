# FlowHR AI

A full-stack HR Workflow Designer built with React Flow and FastAPI.

## Features
- Drag-and-drop workflow builder
- Start, Task, Approval, Automated, Decision, and End nodes
- Right-side node configuration panel
- Save workflows to SQLite
- Load saved workflows
- Load starter templates
- Validate graph rules
- Run simulation sandbox
- Export workflow as JSON
- Delete selected nodes or edges with Delete key

## Project structure
- `frontend/` → React + Vite + TypeScript + React Flow + Tailwind
- `backend/` → FastAPI + SQLite

## Run backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs on `http://127.0.0.1:8000`.

## Run frontend
```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://127.0.0.1:5173`.

## Notes
- SQLite database file is created automatically as `backend/flowhr.db`.
- The simulation follows the first available outgoing edge. For decision nodes, it prefers the `yes` branch when present.
- This is a strong prototype for internship submission and can be extended with auth, run history, import, or versioning.
## Documentation

This repository includes a detailed project report for FlowHR AI.

- Project Report: [`docs/FlowHR_AI_Project_Report.docx`](docs/FlowHR_AI_Project_Report.docx)

The report covers:
- Abstract
- Introduction
- Objectives
- Technology Stack
- System Architecture
- Functional Modules
- API Endpoints
- Validation and Simulation Logic
- Strengths and Limitations
- Future Enhancements
- Conclusion
