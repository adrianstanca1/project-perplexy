# Project Summary

## Code Interpreter Web Application

A full-featured code interpreter web application with file management capabilities, built with modern web technologies.

## What Was Built

### Frontend (React + TypeScript + Vite)
- **Main Layout**: Sidebar navigation with routing
- **Code Interpreter Page**: 
  - Monaco Editor for code editing
  - File explorer sidebar
  - Output panel for execution results
  - Run/Stop/Clear controls
- **File Manager Page**: File browser and management
- **Components**:
  - CodeEditor (Monaco Editor wrapper)
  - OutputPanel (Terminal-like output display)
  - FileExplorer (File tree browser)
  - MainLayout (Application shell)
- **Services**:
  - fileService (File CRUD operations)
  - codeService (Code execution)
- **Hooks**:
  - useCodeExecution (Code execution state management)

### Backend (Node.js + Express + TypeScript)
- **API Routes**:
  - `/api/files` - File management endpoints
  - `/api/execute` - Code execution endpoints
- **Controllers**:
  - fileController (File operations)
  - executeController (Code execution)
- **Services**:
  - fileService (File system operations)
  - codeExecutionService (Python/JavaScript execution)
- **Middleware**:
  - errorHandler (Error handling)
  - validateRequest (Request validation with Zod)

### Shared Package
- TypeScript types and interfaces
- Shared utilities

### Infrastructure
- Docker Compose configuration
- Dockerfiles for frontend and backend
- Environment configuration
- Build scripts
- ESLint configuration

## Features

✅ **Code Execution**
- Execute Python code
- Execute JavaScript/TypeScript code
- Real-time output display
- Error handling
- Execution timeout (30 seconds)

✅ **File Management**
- Create files
- Read files
- Update files
- Delete files
- Upload files
- List files and directories
- File explorer UI

✅ **User Interface**
- Modern, responsive design
- Dark theme
- Code syntax highlighting
- File tree navigation
- Real-time output display
- Toast notifications

✅ **Development Tools**
- Hot module replacement (HMR)
- TypeScript type checking
- ESLint linting
- Docker support
- Environment variables

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Monaco Editor
- React Router
- Axios
- React Hot Toast
- Lucide React

### Backend
- Node.js
- Express
- TypeScript
- Zod (Validation)
- Multer (File uploads)
- File System API

### Development
- pnpm (Package manager)
- Docker & Docker Compose
- ESLint
- TypeScript

## Project Structure

```
project perplexy/
├── packages/
│   ├── frontend/          # React frontend
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── pages/         # Page components
│   │   │   ├── services/      # API services
│   │   │   ├── hooks/         # Custom hooks
│   │   │   └── styles/        # CSS styles
│   │   └── package.json
│   ├── backend/           # Express backend
│   │   ├── src/
│   │   │   ├── controllers/   # Request handlers
│   │   │   ├── services/      # Business logic
│   │   │   ├── routes/        # API routes
│   │   │   ├── middleware/    # Express middleware
│   │   │   └── utils/         # Utility functions
│   │   └── package.json
│   └── shared/            # Shared types
│       ├── src/
│       │   └── types/         # TypeScript types
│       └── package.json
├── docker-compose.yml     # Docker configuration
├── package.json           # Root package.json
├── README.md              # Documentation
├── QUICKSTART.md          # Quick start guide
└── build.sh               # Build script
```

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Start development servers**
   ```bash
   pnpm dev
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## API Endpoints

### File Management
- `GET /api/files` - List files
- `GET /api/files/content?path=<path>` - Get file content
- `POST /api/files` - Create file
- `PUT /api/files` - Update file
- `DELETE /api/files?path=<path>` - Delete file
- `POST /api/files/upload` - Upload file

### Code Execution
- `POST /api/execute` - Execute code
- `POST /api/execute/stop` - Stop execution

## Next Steps

- Add authentication and user management
- Add database for persistent storage
- Add more language support
- Add code sharing features
- Add real-time collaboration
- Add code formatting and linting
- Add terminal emulator
- Add file versioning
- Add project templates
- Add export/import functionality

## Notes

- Python 3 is required for Python code execution
- Files are stored in the `storage` directory
- Temporary files for execution are stored in the system temp directory
- Code execution has a 30-second timeout
- Maximum file size is 10MB (configurable)

## License

MIT

