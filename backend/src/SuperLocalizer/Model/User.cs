using System;

namespace SuperLocalizer.Model;

public class SessionUser
{
    public Guid Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public Guid? CompanyId { get; set; }
    public string CompanyName { get; set; }
    public Guid? MainProjectId { get; set; }
    public string MainProjectName { get; set; }
}

public class User : SessionUser
{
    public string PasswordHash { get; set; }
}