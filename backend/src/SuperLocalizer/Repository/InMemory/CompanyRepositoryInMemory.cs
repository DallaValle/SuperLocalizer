using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SuperLocalizer.Configuration;
using SuperLocalizer.Model;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Repository;

public class CompanyRepositoryInMemory : ICompanyRepository
{
    private readonly IFusionCache _fusionCache;

    public CompanyRepositoryInMemory(IFusionCache fusionCache)
    {
        _fusionCache = fusionCache;
    }

    public Task<Company> Read(Guid id)
    {
        var allCompanies = _fusionCache.GetOrSet(CacheKeys.AllCompanies, _ => GetFromDb());

        allCompanies.TryGetValue(id, out var company);
        return Task.FromResult(company);
    }

    public Task<Company> GetCompanyByUserId(Guid userId)
    {
        var allCompanies = _fusionCache.GetOrSet(CacheKeys.AllCompanies, _ => GetFromDb());
        var allUsers = _fusionCache.GetOrSet(CacheKeys.AllUsers, _ => new Dictionary<Guid, User>());
        var companyId = allUsers.Values.FirstOrDefault(u => u.Id == userId)?.CompanyId;
        if (companyId.HasValue)
        {
            allCompanies.TryGetValue(companyId.Value, out var company);
            return Task.FromResult(company);
        }
        return Task.FromResult<Company>(null);
    }

    public Task<Company> Create(Company company)
    {
        var allCompanies = _fusionCache.GetOrSet(CacheKeys.AllCompanies, _ => GetFromDb());

        var now = DateTime.UtcNow;
        company.Id = Guid.NewGuid();
        company.InsertDate = now;
        company.UpdateDate = now;

        allCompanies[company.Id] = company;
        _fusionCache.Set(CacheKeys.AllCompanies, allCompanies);
        return Task.FromResult(company);
    }

    public Task<Company> Update(Company company)
    {
        var allCompanies = _fusionCache.GetOrSet(CacheKeys.AllCompanies, _ => GetFromDb());

        if (allCompanies.TryGetValue(company.Id, out var existing))
        {
            company.InsertDate = existing.InsertDate;
            company.UpdateDate = DateTime.UtcNow;

            allCompanies[company.Id] = company;
            _fusionCache.Set(CacheKeys.AllCompanies, allCompanies);
            return Task.FromResult(company);
        }

        return Task.FromResult<Company>(null);
    }

    public Task<bool> Delete(Guid id)
    {
        var allCompanies = _fusionCache.GetOrSet(CacheKeys.AllCompanies, _ => GetFromDb());
        if (allCompanies.TryGetValue(id, out var existing))
        {
            var removed = allCompanies.Remove(id);
            _fusionCache.Set(CacheKeys.AllCompanies, allCompanies);
            return Task.FromResult(removed);
        }

        return Task.FromResult(false);
    }

    public Task<bool> Exists(Guid id)
    {
        var allCompanies = _fusionCache.GetOrSet(CacheKeys.AllCompanies, _ => GetFromDb());
        return Task.FromResult(allCompanies.ContainsKey(id));
    }

    private static Dictionary<Guid, Company> GetFromDb() => new();
}