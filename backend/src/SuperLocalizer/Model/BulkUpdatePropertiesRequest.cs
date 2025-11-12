using SuperLocalizer.Model;

public class BulkUpdatePropertiesRequest
{
    public SearchPropertyRequest Query { get; set; }
    public bool? IsReviewed { get; set; }
    public bool? IsVerified { get; set; }
}
