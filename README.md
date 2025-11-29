
# SuperLocalizer

A localization management web application built as a full-stack solution for managing translation properties across multiple languages. SuperLocalizer provides a dashboard for viewing, searching, and managing localization data with commenting and verification capabilities.

## Tech Stack

- **Backend**: .NET 9.0 ASP.NET Core Web API
- **Frontend**: Next.js 14 with TypeScript
- **Databases**:
  - Redis with FusionCache .net library: [FusionCache Step by Step Guide](https://github.com/ZiggyCreatures/FusionCache/blob/main/docs/StepByStep.md). (ready to use )
  - MySql

## Features

- 🌍 Multi-language localization management
- 🔍 Advanced search and filtering capabilities
- 💬 Commenting system for translation collaboration
- 📊 Translation verification and history tracking
- 🔄 Sync capabilities for localization data
- 📖 Swagger/OpenAPI documentation

## Project Structure

```
SuperLocalizer/
├── backend/                    # .NET Core Web API
│   ├── src/SuperLocalizer/     # Main application
│   └── test/                   # Unit tests with sample data
├── frontend/                   # Next.js application
│   ├── app/                    # App router structure
│   └── components/             # Shared React components
└── docs/                       # Documentation
```

## Run

First initialize secrets for FE and BE:

### FE

Create a .env.local file with:

```.env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

GOOGLE_CLIENT_ID=google_client_id
GOOGLE_CLIENT_SECRET=google_client_secret
```

### BE

Set Supertext ApiKey

```bash
dotnet user-secrets init
dotnet user-secrets set "Supertext:ApiKey" "xxx"
```

backend -> running on port 5000

```bash
dotnet run --project backend/src/SuperLocalizer/SuperLocalizer.csproj
```

frontend -> running on port 3000

```bash
cd frontend
npm install
npm run dev
```

## Docker

```bash
docker-compose up -d --build
```

### Prerequisites

- .NET 9.0 SDK
- Node.js (v18 or later)
- npm or yarn

### API Documentation

When running the backend, visit `http://localhost:5000/swagger` to access the interactive API documentation.
