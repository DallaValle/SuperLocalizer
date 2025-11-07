namespace SuperLocalizer.Model;

public class CurrentUser
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public int? CompanyId { get; set; }
    public string CompanyName { get; set; }
    public int? MainProjectId { get; set; }
    public string MainProjectName { get; set; }
}

public static class UserProfileExtensions
{
    public static User ToUser(this CurrentUser currentUser)
    {
        return new User
        {
            Id = currentUser.Id,
            Username = currentUser.Username,
            CompanyId = currentUser.CompanyId,
            CompanyName = currentUser.CompanyName,
            MainProjectId = currentUser.MainProjectId,
            MainProjectName = currentUser.MainProjectName,
        };
    }
}