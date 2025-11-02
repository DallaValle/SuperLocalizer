using System;
using System.Collections.Generic;
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

    public Task<Company> GetByIdAsync(int id)
    {
        var allCompanies = _fusionCache.GetOrSet(CacheKeys.AllCompanies, _ => new Dictionary<int, Company>());

        allCompanies.TryGetValue(id, out var company);
        return Task.FromResult(company);
    }

    public Task<IEnumerable<Company>> GetAllAsync()
    {
        var allCompanies = _fusionCache.GetOrSet(CacheKeys.AllCompanies, _ => new Dictionary<int, Company>());

        return Task.FromResult<IEnumerable<Company>>(allCompanies.Values);
    }

    public Task<Company> CreateAsync(Company company)
    {
        var allCompanies = _fusionCache.GetOrSet(CacheKeys.AllCompanies, _ => new Dictionary<int, Company>());

        // generate new id (max existing id + 1)
        var newId = 1;
        if (allCompanies.Count > 0)
        {
            newId = 0;
            foreach (var k in allCompanies.Keys)
            {
                if (k > newId) newId = k;
            }
            newId += 1;
        }

        var now = DateTime.UtcNow;
        company.Id = newId;
        company.InsertDate = now;
        company.UpdateDate = now;

        allCompanies[company.Id] = company;
        _fusionCache.Set(CacheKeys.AllCompanies, allCompanies);
        return Task.FromResult(company);
    }

    public Task<Company> UpdateAsync(Company company)
    {
        var allCompanies = _fusionCache.GetOrSet(CacheKeys.AllCompanies, _ => new Dictionary<int, Company>());

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

    public Task<bool> DeleteAsync(int id)
    {
        var allCompanies = _fusionCache.GetOrSet(CacheKeys.AllCompanies, _ => new Dictionary<int, Company>());
        if (allCompanies.TryGetValue(id, out var existing))
        {
            var removed = allCompanies.Remove(id);
            _fusionCache.Set(CacheKeys.AllCompanies, allCompanies);
            return Task.FromResult(removed);
        }

        return Task.FromResult(false);
    }

    public Task<bool> ExistsAsync(int id)
    {
        var allCompanies = _fusionCache.GetOrSet(CacheKeys.AllCompanies, _ => new Dictionary<int, Company>());
        return Task.FromResult(allCompanies.ContainsKey(id));
    }
}