# Developer Platform - Sandbox, Marketplace & Desktop Environment

A comprehensive developer platform featuring a sandbox environment for creating apps, a marketplace for discovering and installing apps, and a virtual desktop environment (myAppDesktop) for running apps. Built with React, TypeScript, Node.js, and Express.

## Core Features

- 🧪 **Developer Sandbox**: Create, test, and publish apps with support for Python, JavaScript, TypeScript, HTML, and CSS
- 🛒 **Marketplace**: Discover, install, and manage apps - all apps are free
- 🖥️ **myAppDesktop**: Virtual desktop environment with window manager, taskbar, and app launcher
- 💻 **Code Editor**: Monaco Editor with syntax highlighting and IntelliSense
- 🐍 **Code Execution**: Execute Python, JavaScript, and TypeScript code
- 📁 **File Management**: Create, edit, delete, and organize files
- 🔄 **Real-time Output**: See execution results in real-time
- 📨 **Messaging System**: Inter-app communication and inbox system
- 🗺️ **Live Project Map**: Real-time construction project tracking with dual map views
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

### Developer Sandbox & Marketplace
- `GET /api/marketplace/apps` - List marketplace apps
- `GET /api/marketplace/apps/:appId` - Get app details
- `POST /api/marketplace/apps` - Publish app to marketplace
- `POST /api/marketplace/apps/:appId/install` - Install app
- `DELETE /api/marketplace/apps/:appId/install` - Uninstall app
- `GET /api/marketplace/installed` - Get installed apps
- `GET /api/marketplace/my-apps` - Get my published apps

### Desktop Environment
- `GET /api/desktop/apps` - Get installed desktop apps
- `POST /api/desktop/apps/install` - Install app to desktop
- `DELETE /api/desktop/apps/:appId` - Uninstall app from desktop
- `PUT /api/desktop/apps/:appId/window` - Update window state
- `POST /api/desktop/apps/:appId/execute` - Execute app
- `GET /api/desktop/messages` - Get desktop messages
- `POST /api/desktop/messages` - Send message
- `PUT /api/desktop/messages/:messageId/read` - Mark message as read

### File Management
- `GET /api/files` - List files
- `GET /api/files/content?path=<path>` - Get file content
- `GET /api/files/stats` - Get file statistics
- `POST /api/files` - Create file
- `PUT /api/files` - Update file
- `DELETE /api/files?path=<path>` - Delete file
- `POST /api/files/upload` - Upload file

### Code Execution
- `POST /api/execute` - Execute code
- `POST /api/execute/stop` - Stop execution
- `GET /api/execution-history` - Get execution history
- `DELETE /api/execution-history` - Clear execution history

### Projects & Location
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:projectId` - Get project
- `PUT /api/projects/:projectId` - Update project
- `DELETE /api/projects/:projectId` - Delete project
- `POST /api/location/update` - Update user location
- `GET /api/location/active-users` - Get active users
- `POST /api/maps/upload-drawing` - Upload PDF drawing
- `GET /api/maps/drawing/:projectId` - Get drawing map

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

