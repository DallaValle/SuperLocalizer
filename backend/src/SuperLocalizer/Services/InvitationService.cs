using System;
using System.Threading.Tasks;
using SuperLocalizer.Model;
using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Services;

public interface IInvitationService
{
    Task<User> GetInvitationByTokenAsync(string invitationToken);
    Task<string> CreateInvitationAsync(User user);
    Task InvalidateInvitationAsync(string invitationToken);
}

public class InvitationService : IInvitationService
{
    private IFusionCache _fusionCache;

    public InvitationService(IFusionCache fusionCache)
    {
        _fusionCache = fusionCache;
    }

    public Task<User> GetInvitationByTokenAsync(string invitationToken)
    {
        var invitation = _fusionCache.GetOrDefault<User>($"invitation_{invitationToken}");
        return Task.FromResult(invitation);
    }

    public Task<string> CreateInvitationAsync(User user)
    {
        var token = Guid.NewGuid().ToString();
        _fusionCache.Set($"invitation_{token}", user);
        return Task.FromResult(token);
    }

    public Task InvalidateInvitationAsync(string invitationToken)
    {
        _fusionCache.Remove($"invitation_{invitationToken}");
        return Task.CompletedTask;
    }
}