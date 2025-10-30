# SuperLocalizer - GitHub Copilot Instructions

## Project Overview

SuperLocalizer is a localization management web application built as a full-stack solution for managing translation properties across multiple languages. It provides a dashboard for viewing, searching, and managing localization data with commenting and verification capabilities.

**Primary Purpose**: Manage and review translation properties from JSON localization files, providing search, filtering, commenting, and verification features for translation teams.

## Tech Stack

### Backend (.NET 9.0)
- **Framework**: ASP.NET Core Web API
- **Target Framework**: .NET 9.0
- **Architecture**: MVC pattern with Controllers, Models, Services, and Repository layers
- **Testing**: NUnit framework with coverlet for code coverage
- **API Documentation**: Swagger/OpenAPI with XML documentation
- **JSON Handling**: Newtonsoft.Json
- **Authentication**: JWT Bearer & OpenID Connect (configured but not fully implemented)

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with TypeScript
- **UI Library**: React 18
- **Styling**: CSS modules with global CSS
- **State Management**: React Context (AuthContext)
- **Development**: ESLint for code quality

### Development Environment
- **Default Ports**: Backend (5000), Frontend (3000)
- **CORS**: Configured for localhost:3000 and localhost:3001
- **Build System**: .NET CLI for backend, npm for frontend

## Project Structure

```
SuperLocalizer/
├── backend/                         # .NET Core Web API
│   ├── SuperLocalizer.sln           # Solution file
│   ├── src/SuperLocalizer/          # Main application
│   │   ├── Controllers/             # API controllers (Property, Comment, History, Sync)
│   │   ├── Model/                   # Data models (Property, Value, Comment)
│   │   ├── Services/                # Business logic (PropertyReader)
│   │   ├── Repository/              # Data access layer
│   │   └── Properties/              # Launch settings
│   └── test/SuperLocalizer.Tests/   # Unit tests with sample localization data
├── frontend/                        # Next.js application
│   ├── app/                         # App router structure (Next.js 13+)
│   │   ├── login/                   # Login page
│   │   ├── properties/              # Properties management page
│   │   ├── contexts/                # React contexts
│   │   └── services/                # API service layer
│   └── components/                  # Shared React components
├── docs/                            # Documentation
│   └── requests/                    # HTTP request examples
└── docker-compose.yml               # Docker configuration (basic setup)
```

## Key Development Practices

### Backend (.NET)
- **Dependency Injection**: Services registered in `Startup.cs`
- **API Controllers**: Follow RESTful conventions with `[ApiController]` attribute
- **Documentation**: XML documentation enabled for Swagger generation
- **Configuration**: Uses `appsettings.json` and `appsettings.Development.json`
- **Data Loading**: Localization files loaded from `docs/SupertextLocalisation/`
- **Important Note**: Hard-coded file path in `Startup.cs` - needs update for production deployment

### Frontend (Next.js)
- **App Router**: Uses Next.js 13+ app directory structure
- **TypeScript**: Strict mode disabled, allowing flexible typing
- **Routing**: Root redirects to `/login` via `next.config.js`
- **Authentication**: Context-based auth state management
- **Styling**: CSS modules for component-specific styles

### Code Quality
- **Nullability**: Disabled in .NET project (`<Nullable>disable</Nullable>`)
- **Implicit Usings**: Disabled (`<ImplicitUsings>disable</ImplicitUsings>`)
- **ESLint**: Configured for frontend code quality

## Build & Run Commands

### Backend
```bash
# Build
dotnet build backend/src/SuperLocalizer/SuperLocalizer.csproj

# Run (development)
dotnet run --project backend/src/SuperLocalizer/SuperLocalizer.csproj

# Watch mode
dotnet watch run --project backend/src/SuperLocalizer/SuperLocalizer.csproj

# Tests
dotnet test backend/test/SuperLocalizer.Tests/SuperLocalizer.Tests.csproj

# Restore packages
dotnet restore backend/SuperLocalizer.sln
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## VS Code Tasks Available
- `build`: Build the main application
- `build-tests`: Build test project
- `watch`: Run backend in watch mode
- `run-tests`: Execute unit tests
- `frontend-install`: Install frontend dependencies
- `frontend-start`: Start frontend development server

## Important Configuration Files

### Backend
- `SuperLocalizer.csproj`: Main project file with .NET 9.0 target
- `appsettings.json` & `appsettings.Development.json`: Application configuration
- `launchSettings.json`: Development server settings (port 5000, Swagger launch)

### Frontend
- `package.json`: Dependencies and scripts
- `next.config.js`: Next.js configuration with redirect rules
- `tsconfig.json`: TypeScript configuration (strict mode disabled)

## Data Format
Localization data is stored in JSON format with nested structure:
```json
{
  "key": {
    "subkey": "Translation text",
    "nested": {
      "deepkey": "Deep translation"
    }
  }
}
```

## Development Gotchas & Workarounds

1. **Hard-coded Path**: The localization file path in `Startup.cs` is hard-coded and needs to be made configurable
2. **CORS Configuration**: Development CORS allows localhost:3000 and localhost:3001
3. **Authentication**: JWT/OpenID Connect packages are referenced but not fully implemented
4. **Port Conflicts**: Ensure ports 3000 (frontend) and 5000 (backend) are available
5. **Node.js Dependencies**: Run `npm install` in frontend directory before starting development

## Testing Strategy
- Backend tests use NUnit framework
- Sample localization data located in `docs/SupertextLocalisation/`
- Test data includes multiple languages: en, de-CH, de-DE, fr, it
- HTTP request examples available in `docs/requests/property.http`

## Performance Considerations
- Property data is loaded into memory as singleton service
- Large localization files (5000+ lines) are processed at startup
- Consider implementing caching for production deployments

## Security Notes
- Authentication framework is partially implemented but not enforced
- CORS is configured for development origins only
- No data validation middleware currently implemented
- Consider implementing rate limiting for production API