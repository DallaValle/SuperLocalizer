using System;
using System.Collections.Generic;
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

    public Task<User> GetByIdAsync(int id)
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.Users, _ => new List<User>());
        return Task.FromResult(allUser.Find(u => u.Id == id));
    }

    public Task<User> GetByUsername(string username)
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.Users, _ => new List<User>());
        if (string.IsNullOrEmpty(username)) return Task.FromResult<User>(null);

        var found = allUser.Find(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase)
                                      || string.Equals(u.Email, username, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(found);
    }

    public Task<User> GetByUserAndPasswordAsync(string username, string passwordHash)
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.Users, _ => new List<User>());
        if (string.IsNullOrEmpty(username) || passwordHash == null) return Task.FromResult<User>(null);

        var found = allUser.Find(u => (string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase)
                                       || string.Equals(u.Email, username, StringComparison.OrdinalIgnoreCase))
                                      && u.PasswordHash == passwordHash);
        return Task.FromResult(found);
    }

    public Task<IEnumerable<User>> GetAllAsync()
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.Users, _ => new List<User>());
        return Task.FromResult<IEnumerable<User>>(allUser);
    }

    public Task<User> CreateAsync(User user)
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.Users, _ => new List<User>());

        // generate new id (max existing id + 1)
        var newId = 1;
        if (allUser.Count > 0)
        {
            newId = 0;
            foreach (var u in allUser)
            {
                if (u.Id > newId) newId = u.Id;
            }
            newId += 1;
        }

        user.Id = newId;
        allUser.Add(user);
        _fusionCache.Set(CacheKeys.Users, allUser);

        return Task.FromResult(user);
    }

    public Task<User> PartialUpdateAsync(User user)
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.Users, _ => new List<User>());

        var idx = allUser.FindIndex(u => u.Id == user.Id);
        if (idx >= 0)
        {
            // Merge non-null / provided fields into the existing user (partial update)
            var existing = allUser[idx];

            if (user.Username != null) existing.Username = user.Username;
            if (user.Email != null) existing.Email = user.Email;
            if (user.PasswordHash != null) existing.PasswordHash = user.PasswordHash;
            if (user.CompanyId.HasValue) existing.CompanyId = user.CompanyId;
            if (user.MainProjectId.HasValue) existing.MainProjectId = user.MainProjectId;

            allUser[idx] = existing;
            _fusionCache.Set(CacheKeys.Users, allUser);
            return Task.FromResult(existing);
        }

        return Task.FromResult<User>(null);
    }

    public Task<bool> DeleteAsync(int id)
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.Users, _ => new List<User>());
        var existing = allUser.Find(u => u.Id == id);
        if (existing != null)
        {
            var removed = allUser.Remove(existing);
            _fusionCache.Set(CacheKeys.Users, allUser);
            return Task.FromResult(removed);
        }

        return Task.FromResult(false);
    }

    public Task<bool> ExistsAsync(int id)
    {
        var allUser = _fusionCache.GetOrSet(CacheKeys.Users, _ => new List<User>());
        return Task.FromResult(allUser.Exists(u => u.Id == id));
    }
}