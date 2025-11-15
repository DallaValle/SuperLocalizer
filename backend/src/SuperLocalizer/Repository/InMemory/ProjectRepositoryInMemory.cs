using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SuperLocalizer.Configuration;
using SuperLocalizer.Model;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Repository;

public class ProjectRepositoryInMemory : IProjectRepository
{
    private readonly IFusionCache _fusionCache;

    public ProjectRepositoryInMemory(IFusionCache fusionCache)
    {
        _fusionCache = fusionCache;
    }

    public Task<Project> Create(Project project)
    {
        var allProjects = _fusionCache.GetOrSet(CacheKeys.AllProjects(project.CompanyId), _ => GetFromDb());

        var now = DateTime.UtcNow;
        project.Id = Guid.NewGuid();
        project.InsertDate = now;
        project.UpdateDate = now;

        allProjects[project.Id] = project;
        _fusionCache.Set(CacheKeys.AllProjects(project.CompanyId), allProjects);

        return Task.FromResult(project);
    }

    public Task<bool> Delete(Guid companyId, Guid id)
    {
        var allProjects = _fusionCache.GetOrSet(CacheKeys.AllProjects(companyId), _ => GetFromDb());
        if (allProjects.TryGetValue(id, out var existing) && existing.CompanyId == companyId)
        {
            var removed = allProjects.Remove(id);
            _fusionCache.Set(CacheKeys.AllProjects(companyId), allProjects);
            return Task.FromResult(removed);
        }

        return Task.FromResult(false);
    }

    public Task<bool> Exists(Guid companyId, Guid id)
    {
        var allProjects = _fusionCache.GetOrSet(CacheKeys.AllProjects(companyId), _ => GetFromDb());
        if (allProjects.TryGetValue(id, out var existing))
        {
            return Task.FromResult(existing.CompanyId == companyId);
        }

        return Task.FromResult(false);
    }

    public Task<IEnumerable<Project>> GetByCompanyId(Guid companyId)
    {
        var allProjects = _fusionCache.GetOrSet(CacheKeys.AllProjects(companyId), _ => GetFromDb());
        return Task.FromResult<IEnumerable<Project>>(allProjects.Values);
    }

    public Task<Project> Read(Guid companyId, Guid id)
    {
        var allProjects = _fusionCache.GetOrSet(CacheKeys.AllProjects(companyId), _ => GetFromDb());
        if (allProjects.TryGetValue(id, out var project) && project.CompanyId == companyId)
        {
            return Task.FromResult(project);
        }

        return Task.FromResult<Project>(null);
    }

    public Task<Project> Update(Project project)
    {
        var allProjects = _fusionCache.GetOrSet(CacheKeys.AllProjects(project.CompanyId), _ => GetFromDb());

        if (!allProjects.TryGetValue(project.Id, out var existing) || existing.CompanyId != project.CompanyId)
        {
            return Task.FromResult<Project>(null);
        }

        // update fields
        existing.Name = project.Name;
        existing.Description = project.Description;
        existing.UpdateDate = DateTime.UtcNow;

        allProjects[existing.Id] = existing;
        _fusionCache.Set(CacheKeys.AllProjects(project.CompanyId), allProjects);

        return Task.FromResult(existing);
    }

    private static Dictionary<Guid, Project> GetFromDb() => new Dictionary<Guid, Project>();
}