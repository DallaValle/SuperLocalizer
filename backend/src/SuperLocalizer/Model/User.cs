namespace SuperLocalizer.Model;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public int? CompanyId { get; set; }
    public int? MainProjectId { get; set; }
}