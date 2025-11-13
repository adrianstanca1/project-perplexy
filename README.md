# Code Interpreter Web Application

A full-featured code interpreter web application with file management capabilities, built with React, TypeScript, Node.js, and Express.

## Features

- 🎨 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- 💻 **Code Editor**: Monaco Editor with syntax highlighting and IntelliSense
- 🐍 **Code Execution**: Execute Python and JavaScript code
- 📁 **File Management**: Create, edit, delete, and organize files
- 🔄 **Real-time Output**: See execution results in real-time
- 🐳 **Docker Support**: Easy deployment with Docker Compose
- 📦 **Monorepo Structure**: Organized with pnpm workspaces

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Monaco Editor
- React Router
- Axios
- Zustand (State Management)

### Backend
- Node.js
- Express
- TypeScript
- Python Shell (for Python execution)
- File System API
- Multer (file uploads)

## Prerequisites

- Node.js 18+ 
- pnpm 8+
- Python 3 (for Python code execution)
- Docker (optional, for containerized deployment)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "project perplexy"
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Create storage directory**
   ```bash
   mkdir -p storage
   ```

## Development

1. **Start development servers**
   ```bash
   pnpm dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

2. **Or start services individually**
   ```bash
   pnpm dev:frontend  # Start frontend only
   pnpm dev:backend   # Start backend only
   ```

## Building

Build all packages:
```bash
pnpm build
```

## Docker Deployment

1. **Build and start services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## Project Structure

```
project perplexy/
├── packages/
│   ├── frontend/          # React frontend application
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── pages/         # Page components
│   │   │   ├── services/      # API services
│   │   │   ├── hooks/         # Custom hooks
│   │   │   └── styles/        # CSS styles
│   │   └── package.json
│   ├── backend/           # Express backend API
│   │   ├── src/
│   │   │   ├── controllers/   # Request handlers
│   │   │   ├── services/      # Business logic
│   │   │   ├── routes/        # API routes
│   │   │   ├── middleware/    # Express middleware
│   │   │   └── utils/         # Utility functions
│   │   └── package.json
│   └── shared/            # Shared types and utilities
│       ├── src/
│       │   └── types/         # TypeScript types
│       └── package.json
├── docker-compose.yml     # Docker configuration
├── package.json          # Root package.json
└── README.md            # This file
```

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

## Environment Variables

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/codeinterpreter
REDIS_URL=redis://localhost:6379
JWT_SECRET=change_this_in_production
JWT_REFRESH_SECRET=change_this_in_production_too
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
FILE_STORAGE_PATH=./storage
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=py,js,ts,jsx,tsx,json,csv,txt,md
```

## Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm type-check` - Type check all packages
- `pnpm lint` - Lint all packages
- `pnpm test:unit` - Run unit tests
- `pnpm clean` - Clean all build artifacts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

