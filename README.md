
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

## Development

### Prerequisites

- .NET 9.0 SDK
- Node.js (v18 or later)
- npm or yarn

### Available Tasks

Use VS Code's task runner or run these commands:

- `dotnet build` - Build the backend application
- `dotnet test` - Run unit tests
- `dotnet watch run` - Run backend in watch mode
- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production

### API Documentation

When running the backend, visit `http://localhost:5000/swagger` to access the interactive API documentation.

### Testing

The project includes comprehensive unit tests with sample localization data for multiple languages (en, de-CH, de-DE, fr, it).

```bash
# Run backend tests
dotnet test backend/test/SuperLocalizer.Tests/SuperLocalizer.Tests.csproj

# Run frontend tests (if available)
cd frontend && npm test
```

## Configuration

- Backend runs on port 5000 by default
- Frontend runs on port 3000 by default
- CORS is configured for development (localhost:3000, localhost:3001)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure everything works
5. Submit a pull request

## License

This project is for educational and development purposes.
