namespace SuperLocalizer.Configuration;

public static class CacheKeys
{
    public static string AllCompanies = "all_companies";
    public static string AllUsers = "all_users";
    public static string AllProjects(int companyId) => $"all_projects_{companyId}";
    public static string AllProperties(int projectId) => $"all_properties_{projectId}";
    // public static string AllValues(int propertyId) => $"all_values_{propertyId}";
    public static string AllComments(string valueKey) => $"all_comments_{valueKey}";
}