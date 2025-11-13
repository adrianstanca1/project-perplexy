# Quick Start - Local Testing

Get the Code Interpreter application with Live Project Map running locally in minutes.

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Start Development Servers

```bash
pnpm dev
```

### Step 3: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📋 Available Pages

Once the application is running, you can access:

1. **Code Interpreter** - http://localhost:3000/
   - Write and execute Python/JavaScript code
   - View output in real-time
   - Save and load files

2. **File Manager** - http://localhost:3000/files
   - Create, edit, and delete files
   - Organize files in folders
   - Save changes with Monaco Editor

3. **Live Project Map** - http://localhost:3000/map
   - Upload construction drawing PDFs
   - View virtual map (from drawings)
   - View real map (from GPS)
   - Toggle between map views
   - See active users with role-based colors
   - Track user locations in real-time
   - Select UK regions
   - View weather conditions
   - Create and select projects

## 🔧 Prerequisites

- **Node.js 18+**
- **pnpm 8+**
- **Python 3** (for code execution)

### Verify Installation

```bash
node --version    # Should be v18.0.0 or higher
pnpm --version    # Should be 8.0.0 or higher
python3 --version # Should be 3.x.x
```

## 🐳 Docker Quick Start

If you prefer Docker:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📝 Environment Variables (Optional)

For development, environment variables are optional. Default values are used.

### Backend (packages/backend/.env)

```env
NODE_ENV=development
PORT=3001
FILE_STORAGE_PATH=./storage
```

### Frontend (packages/frontend/.env)

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001/ws
```

## 🧪 Testing Features

### Test Code Execution

1. Navigate to http://localhost:3000/
2. Write Python code: `print("Hello, World!")`
3. Click "Run"
4. View output in the output panel

### Test File Management

1. Navigate to http://localhost:3000/files
2. Create a new file
3. Write some code
4. Save the file
5. Verify the file is saved

### Test Live Map

1. Navigate to http://localhost:3000/map
2. Select your role (Manager, Foreman, or Labour)
3. Allow location access when prompted
4. Upload a PDF drawing (optional)
5. View your location on the map
6. Toggle between virtual and real map views

## 🛠️ Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Python Not Found

```bash
# macOS
brew install python3

# Linux
sudo apt-get install python3
```

### Build Errors

```bash
# Clean and reinstall
rm -rf node_modules packages/*/node_modules
pnpm install
```

## 📚 Next Steps

- Read [BUILD_AND_DEPLOY_LOCAL.md](./BUILD_AND_DEPLOY_LOCAL.md) for detailed deployment guide
- Read [COMPLETE_IMPLEMENTATION.md](./COMPLETE_IMPLEMENTATION.md) for implementation details
- Read [README.md](./README.md) for project overview

## 🎉 Success!

Your application is now running locally and ready for testing!

For more information, see the complete documentation in the project root.

