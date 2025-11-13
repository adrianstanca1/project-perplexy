# Quick Start Guide

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- pnpm 8+ ([Install](https://pnpm.io/installation))
- Python 3 (for Python code execution)

## Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd "project perplexy"
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (optional for development)
   ```

4. **Create storage directory**
   ```bash
   mkdir -p storage
   ```

## Running the Application

### Development Mode

Start both frontend and backend:
```bash
pnpm dev
```

Or start them separately:
```bash
# Terminal 1 - Backend
pnpm dev:backend

# Terminal 2 - Frontend
pnpm dev:frontend
```

### Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Testing Code Execution

1. Open http://localhost:3000 in your browser
2. Enter Python code in the editor, for example:
   ```python
   print("Hello, World!")
   for i in range(5):
       print(f"Number: {i}")
   ```
3. Click the "Run" button
4. View the output in the output panel

## File Management

1. Click on "Files" in the sidebar
2. Create a new file by clicking the "+" button
3. Select a file to view/edit it
4. Delete files using the trash icon

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

## Troubleshooting

### Python not found
- Make sure Python 3 is installed and in your PATH
- On macOS: `brew install python3`
- On Linux: `sudo apt-get install python3`
- On Windows: Download from [python.org](https://www.python.org/)

### Port already in use
- Change the port in `.env` file:
  - `PORT=3001` (backend)
  - Frontend port is configured in `packages/frontend/vite.config.ts`

### File permissions
- Make sure the `storage` directory has write permissions
- On Linux/Mac: `chmod -R 755 storage`

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the API endpoints in the backend
- Customize the UI in the frontend
- Add more language support in the backend

