using System;

namespace SuperLocalizer.Configuration;

public static class CacheKeys
{
    public static string AllCompanies = "all_companies";
    public static string AllUsers = "all_users";
    public static string AllProjects(Guid companyId) => $"all_projects_{companyId}";
    public static string AllProperties(Guid projectId) => $"all_properties_{projectId}";
    // public static string AllValues(Guid propertyId) => $"all_values_{propertyId}";
    public static string AllComments(string valueKey) => $"all_comments_{valueKey}";
    public static string AllHistories(Guid projectId) => $"all_histories_{projectId}";
}