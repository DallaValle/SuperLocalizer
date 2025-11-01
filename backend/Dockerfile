# Use the official .NET 9 SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy the solution file
COPY SuperLocalizer.sln ./

# Copy project files
COPY src/SuperLocalizer/SuperLocalizer.csproj ./src/SuperLocalizer/
COPY test/SuperLocalizer.Tests/SuperLocalizer.Tests.csproj ./test/SuperLocalizer.Tests/

# Restore dependencies
RUN dotnet restore

# Copy the rest of the application code
COPY . .

# Build the application
RUN dotnet build src/SuperLocalizer/SuperLocalizer.csproj -c Release --no-restore

# Publish the application
RUN dotnet publish src/SuperLocalizer/SuperLocalizer.csproj -c Release --no-restore -o /app/publish

# Use the official .NET 9 runtime image for the final stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy the published application from the build stage
COPY --from=build /app/publish .

# Create directory for localization files
RUN mkdir -p /app/docs/SupertextLocalisation

# Expose the port the app runs on
EXPOSE 5000

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Start the application
ENTRYPOINT ["dotnet", "SuperLocalizer.dll"]