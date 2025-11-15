using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SuperLocalizer.Configuration;
using SuperLocalizer.Model;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Repository;

public class UserRepositoryInMemory : IUserRepository
{
    private readonly IFusionCache _fusionCache;

    public UserRepositoryInMemory(IFusionCache fusionCache)
    {
        _fusionCache = fusionCache;
    }

    public Task<User> Read(Guid id)
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.AllUsers, _ => new List<User>());
        return Task.FromResult(allUser.Find(u => u.Id == id));
    }

    public Task<User> GetByUsername(string username)
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.AllUsers, _ => new List<User>());
        if (string.IsNullOrEmpty(username)) return Task.FromResult<User>(null);

        var found = allUser.Find(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase)
                                      || string.Equals(u.Email, username, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(found);
    }

    public Task<IEnumerable<User>> GetByCompanyId(Guid companyId)
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.AllUsers, _ => new List<User>());
        return Task.FromResult(allUser.Where(u => u.CompanyId == companyId));
    }

    public Task<User> Create(User user)
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.AllUsers, _ => new List<User>());
        user.Username = user.Username ?? user.Email;
        user.Id = Guid.NewGuid();
        allUser.Add(user);
        _fusionCache.Set(CacheKeys.AllUsers, allUser);

        return Task.FromResult(user);
    }

    public Task<User> Update(User user)
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.AllUsers, _ => new List<User>());

        var idx = allUser.FindIndex(u => u.Id == user.Id);
        if (idx >= 0)
        {
            // Merge non-null / provided fields into the existing user (partial update)
            var existing = allUser[idx];

            if (user.Username != null) existing.Username = user.Username;
            if (user.Email != null) existing.Email = user.Email;
            if (user.PasswordHash != null) existing.PasswordHash = user.PasswordHash;
            if (user.CompanyId.HasValue) existing.CompanyId = user.CompanyId;
            if (user.CompanyName != null) existing.CompanyName = user.CompanyName;
            if (user.MainProjectId.HasValue) existing.MainProjectId = user.MainProjectId;
            if (user.MainProjectName != null) existing.MainProjectName = user.MainProjectName;

            allUser[idx] = existing;
            _fusionCache.Set(CacheKeys.AllUsers, allUser);
            return Task.FromResult(existing);
        }

        return Task.FromResult<User>(null);
    }

    public Task<bool> Delete(Guid id)
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.AllUsers, _ => new List<User>());
        var existing = allUser.Find(u => u.Id == id);
        if (existing != null)
        {
            var removed = allUser.Remove(existing);
            _fusionCache.Set(CacheKeys.AllUsers, allUser);
            return Task.FromResult(removed);
        }

        return Task.FromResult(false);
    }

    public Task<bool> Exists(Guid id)
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.AllUsers, _ => new List<User>());
        return Task.FromResult(allUser.Exists(u => u.Id == id));
    }
}