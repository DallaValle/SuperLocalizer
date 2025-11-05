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

    public Task<Project> CreateAsync(Project project)
    {
        var allProjects = _fusionCache.GetOrSet(CacheKeys.AllProjects(project.CompanyId), _ => new Dictionary<int, Project>());

        // generate new id (max existing id + 1)
        var newId = 1;
        if (allProjects.Count > 0)
        {
            newId = 0;
            foreach (var k in allProjects.Keys)
            {
                if (k > newId) newId = k;
            }
            newId += 1;
        }

        var now = DateTime.UtcNow;
        project.Id = newId;
        project.InsertDate = now;
        project.UpdateDate = now;

        allProjects[project.Id] = project;
        _fusionCache.Set(CacheKeys.AllProjects(project.CompanyId), allProjects);

        return Task.FromResult(project);
    }

    public Task<bool> DeleteAsync(int companyId, int id)
    {
        var allProjects = _fusionCache.GetOrSet(CacheKeys.AllProjects(companyId), _ => new Dictionary<int, Project>());
        if (allProjects.TryGetValue(id, out var existing) && existing.CompanyId == companyId)
        {
            var removed = allProjects.Remove(id);
            _fusionCache.Set(CacheKeys.AllProjects(companyId), allProjects);
            return Task.FromResult(removed);
        }

        return Task.FromResult(false);
    }

    public Task<bool> ExistsAsync(int companyId, int id)
    {
        var allProjects = _fusionCache.GetOrSet(CacheKeys.AllProjects(companyId), _ => new Dictionary<int, Project>());
        if (allProjects.TryGetValue(id, out var existing))
        {
            return Task.FromResult(existing.CompanyId == companyId);
        }

        return Task.FromResult(false);
    }

    public Task<IEnumerable<Project>> GetAllAsync(int companyId)
    {
        var allProjects = _fusionCache.GetOrSet(CacheKeys.AllProjects(companyId), _ => new Dictionary<int, Project>());
        return Task.FromResult<IEnumerable<Project>>(allProjects.Values);
    }

    public Task<Project> GetByIdAsync(int companyId, int id)
    {
        var allProjects = _fusionCache.GetOrSet(CacheKeys.AllProjects(companyId), _ => new Dictionary<int, Project>());
        if (allProjects.TryGetValue(id, out var project) && project.CompanyId == companyId)
        {
            return Task.FromResult(project);
        }

        return Task.FromResult<Project>(null);
    }

    public Task<Project> UpdateAsync(Project project)
    {
        var allProjects = _fusionCache.GetOrSet(CacheKeys.AllProjects(project.CompanyId), _ => new Dictionary<int, Project>());

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
}