using System;
using System.IO;
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using SuperLocalizer.Clients;
using SuperLocalizer.Repository;
using SuperLocalizer.Services;
using ZiggyCreatures.Caching.Fusion;
using ZiggyCreatures.Caching.Fusion.Serialization.SystemTextJson;

namespace SuperLocalizer
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add CORS services
            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend",
                    builder =>
                    {
                        var allowedOrigins = Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
                        builder.WithOrigins(allowedOrigins ?? new[] { "http://localhost:3000" })
                               .AllowAnyHeader()
                               .AllowAnyMethod();
                    });
            });

            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });

            services.AddHttpContextAccessor();

            // Configure JWT Authentication
            var jwtKey = Configuration["Jwt:Key"] ?? "supersecretkey12345678901234567890123456789";
            var key = Encoding.UTF8.GetBytes(jwtKey);

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = Configuration["Jwt:Issuer"] ?? "MyIssuer",
                        ValidAudience = Configuration["Jwt:Audience"] ?? "MyAudience",
                        IssuerSigningKey = new SymmetricSecurityKey(key)
                    };
                });

            // Register the Swagger generator, defining 1 or more Swagger documents
            services.AddSwaggerGen(c =>
            {
                // Set the comments path for the Swagger JSON and UI if the XML file exists.
                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                {
                    c.IncludeXmlComments(xmlPath);
                }

                // Add JWT bearer definition so Swagger can accept a token.
                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'",
                    Name = "Authorization",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });
            });

            var distributedCacheConnection = Configuration["ConnectionStrings:DistributedCache"];

            if (string.IsNullOrEmpty(distributedCacheConnection))
            {
                services.AddFusionCache()
                    .WithDefaultEntryOptions(new FusionCacheEntryOptions
                    {
                        Duration = TimeSpan.FromMinutes(int.MaxValue),
                    });
            }
            else
            {
                services.AddFusionCache()
                    .WithDefaultEntryOptions(new FusionCacheEntryOptions
                    {
                        Duration = TimeSpan.FromMinutes(int.MaxValue),
                        IsFailSafeEnabled = true,
                        FailSafeMaxDuration = TimeSpan.FromHours(2),
                        FailSafeThrottleDuration = TimeSpan.FromSeconds(30),
                        EagerRefreshThreshold = 0.9f,
                        FactorySoftTimeout = TimeSpan.FromMilliseconds(100),
                        FactoryHardTimeout = TimeSpan.FromMilliseconds(1500)
                    })
                    .WithSerializer(
                        new FusionCacheSystemTextJsonSerializer()
                    )
                    .WithDistributedCache(
                        new RedisCache(new RedisCacheOptions() { Configuration = distributedCacheConnection })
                    );
            }

            services.AddSingleton<IPropertyReaderService, PropertyReaderService>();
            services.AddSingleton<ISettingService, SettingService>();
            services.AddSingleton<ISnapshotRepository, SnapshotRepository>();
            services.AddSingleton<FileService>();
            services.AddSingleton<IPasswordHasher, PasswordHasher>();
            services.AddScoped<IUserProfile, UserProfile>();
            services.AddSingleton<IInvitationService, InvitationService>();

            services.AddHttpClient();
            services.AddScoped<IAITranslationClient, AITranslationClient>();
            services.AddScoped<ILanguageService, LanguageService>();

            if (Configuration.GetValue<bool?>("UseDatabase") == true)
            {
                services.AddSingleton<ICompanyRepository, CompanyRepository>();
                services.AddSingleton<IProjectRepository, ProjectRepository>();
                services.AddSingleton<IUserRepository, UserRepository>();
                services.AddSingleton<IHistoryRepository, HistoryRepository>();
                services.AddSingleton<IPropertyRepository, PropertyRepository>();
                services.AddSingleton<ICommentRepository, CommentRepository>();
            }
            else
            {
                services.AddSingleton<ICompanyRepository, CompanyRepositoryInMemory>();
                services.AddSingleton<IProjectRepository, ProjectRepositoryInMemory>();
                services.AddSingleton<IUserRepository, UserRepositoryInMemory>();
                services.AddSingleton<IHistoryRepository, HistoryRepositoryInMemory>();
                services.AddSingleton<IPropertyRepository, PropertyRepositoryInMemory>();
                services.AddSingleton<ICommentRepository, CommentRepositoryInMemory>();
            }
        }


        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // Use developer exception page in development
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            // Enable middleware to serve generated Swagger as a JSON endpoint and UI in all environments
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "SuperLocalizer v1");
            });

            // Use CORS
            app.UseCors("AllowFrontend");

            app.UseRouting();

            // Add Authentication & Authorization middleware
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}