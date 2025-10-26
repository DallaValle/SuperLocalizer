using ZiggyCreatures.Caching.Fusion;

namespace SuperLocalizer.Repository;

public interface IHistoryRepository
{
}

public class HistoryRepositoryMemory : IHistoryRepository
{
    private readonly IFusionCache _fusionCache;

    public HistoryRepositoryMemory(IFusionCache fusionCache)
    {
        _fusionCache = fusionCache;
    }
}