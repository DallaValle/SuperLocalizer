
# SuperLocalizer

A localization management web application built as a full-stack solution for managing translation properties across multiple languages. SuperLocalizer provides a dashboard for viewing, searching, and managing localization data with commenting and verification capabilities.

## Tech Stack

- **Backend**: .NET 9.0 ASP.NET Core Web API
- **Frontend**: Next.js 14 with TypeScript
- **Architecture**: MVC pattern with Controllers, Models, Services, and Repository layers
- **Testing**: NUnit framework with coverlet for code coverage

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
