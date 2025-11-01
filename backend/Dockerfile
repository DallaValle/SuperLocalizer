# Use the official .NET 9 SDK image with Alpine for smallest build image
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files first for better layer caching
COPY ["src/SuperLocalizer/SuperLocalizer.csproj", "src/SuperLocalizer/"]
COPY . .

# Restore dependencies in a separate layer
RUN dotnet restore "src/SuperLocalizer/SuperLocalizer.csproj"

# Build and publish in one step with optimizations
WORKDIR "/src/src/SuperLocalizer"
RUN dotnet publish "SuperLocalizer.csproj" \
    -c Release \
    -o /app/publish

# Use the smallest possible runtime image (Alpine-based)
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory
WORKDIR /app

# Create directory for localization files with proper permissions
RUN chown -R appuser:appgroup /app

# Copy published app with correct ownership
COPY --from=build --chown=appuser:appgroup /app/publish .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Set environment variables for production
ENV ASPNETCORE_URLS=http://+:5000 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_RUNNING_IN_CONTAINER=true \
    DOTNET_USE_POLLING_FILE_WATCHER=true

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Use exec form for better signal handling
ENTRYPOINT ["dotnet", "SuperLocalizer.dll"]