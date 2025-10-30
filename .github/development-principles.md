# Development Principles & Guidelines

This document outlines the core development principles for SuperLocalizer, prioritizing simplicity and maintainability.

## Core Philosophy: KIS - Keep It Simple

**Simplicity is the ultimate sophistication.** Before applying any complex pattern or principle, ask yourself:

- Is this the simplest solution that works?
- Will this be easy to understand in 6 months?
- Am I solving a real problem or creating complexity?

### KIS Guidelines

1. **Use Explicit Names Over Short Names**

   ```csharp
   // Good
   public async Task<List<Property>> GetPropertiesByLanguageAsync(string languageCode)

   // Avoid
   public async Task<List<Property>> GetPropsByLangAsync(string lang)
   ```

2. **Prefer Composition Over Inheritance**
   - Use dependency injection over complex inheritance hierarchies
   - Favor interfaces for contracts

3. **Keep Methods Small and Focused**
   - One responsibility per method
   - Maximum 20-30 lines per method
   - If you need comments to explain sections, split the method

## SOLID Principles

Apply SOLID principles **only when they simplify the code**, not as dogma.

### 1. Single Responsibility Principle (SRP)

Each class should have one reason to change.

```csharp
// Good: Separate concerns
public class PropertyReader
{
    public List<Property> Load(JObject json, string language) { }
}

public class PropertyValidator
{
    public ValidationResult Validate(Property property) { }
}

// Avoid: Multiple responsibilities
public class PropertyManager
{
    public List<Property> Load(JObject json, string language) { }
    public ValidationResult Validate(Property property) { }
    public void SendEmail(Property property) { }
}
```

### 2. Open/Closed Principle (OCP)

Open for extension, closed for modification.

```csharp
// Good: Extensible through interfaces
public interface IPropertyProcessor
{
    void Process(Property property);
}

public class PropertyController
{
    private readonly IEnumerable<IPropertyProcessor> _processors;

    public PropertyController(IEnumerable<IPropertyProcessor> processors)
    {
        _processors = processors;
    }
}
```

### 3. Liskov Substitution Principle (LSP)

Derived classes must be substitutable for their base classes.

```csharp
// Good: Maintains contract
public abstract class PropertyFilter
{
    public abstract IEnumerable<Property> Filter(IEnumerable<Property> properties);
}

public class LanguageFilter : PropertyFilter
{
    public override IEnumerable<Property> Filter(IEnumerable<Property> properties)
    {
        // Implementation that respects the base contract
    }
}
```

### 4. Interface Segregation Principle (ISP)

Don't force clients to depend on interfaces they don't use.

```csharp
// Good: Focused interfaces
public interface IPropertyReader
{
    List<Property> Load(JObject json, string language);
}

public interface IPropertyWriter
{
    void Save(List<Property> properties, string filePath);
}

// Avoid: Fat interface
public interface IPropertyManager
{
    List<Property> Load(JObject json, string language);
    void Save(List<Property> properties, string filePath);
    void Validate(Property property);
    void SendNotification(Property property);
}
```

### 5. Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions.

```csharp
// Good: Depends on abstraction
public class PropertyController : ControllerBase
{
    private readonly IPropertyService _propertyService;

    public PropertyController(IPropertyService propertyService)
    {
        _propertyService = propertyService;
    }
}

// Avoid: Depends on concrete implementation
public class PropertyController : ControllerBase
{
    private readonly PropertyReader _propertyReader = new PropertyReader();
}
```

## Clean Code Practices

### Naming Conventions

1. **Use Intention-Revealing Names**

   ```csharp
   // Good
   public class TranslationProperty
   public string LanguageCode { get; set; }
   public DateTime LastModificationDate { get; set; }

   // Avoid
   public class Prop
   public string Lang { get; set; }
   public DateTime Dt { get; set; }
   ```

2. **Avoid Mental Mapping**

   ```csharp
   // Good
   foreach (var property in properties)
   {
       if (property.IsVerified)
       {
           verifiedProperties.Add(property);
       }
   }

   // Avoid
   foreach (var p in props)
   {
       if (p.IsVer)
       {
           vProps.Add(p);
       }
   }
   ```

### Method Guidelines

1. **Functions Should Do One Thing**

   ```csharp
   // Good: Single responsibility
   public List<Property> FilterByLanguage(List<Property> properties, string language)
   {
       return properties.Where(p => p.Values.Any(v => v.Language == language)).ToList();
   }
   
   public List<Property> SortByKey(List<Property> properties)
   {
       return properties.OrderBy(p => p.Key).ToList();
   }
   
   // Avoid: Multiple responsibilities
   public List<Property> FilterAndSort(List<Property> properties, string language)
   {
       var filtered = properties.Where(p => p.Values.Any(v => v.Language == language));
       return filtered.OrderBy(p => p.Key).ToList();
   }
   ```

2. **Use Descriptive Parameter Names**

   ```csharp
   // Good
   public Property UpdatePropertyValue(string propertyKey, string languageCode, string newText)
   
   // Avoid
   public Property Update(string key, string lang, string text)
   ```

### Error Handling

1. **Fail Fast**

   ```csharp
   public void UpdateProperty(Property property)
   {
       if (property == null)
           throw new ArgumentNullException(nameof(property));

       if (string.IsNullOrEmpty(property.Key))
           throw new ArgumentException("Property key cannot be empty", nameof(property));

       // Continue with business logic
   }
   ```

2. **Use Specific Exceptions**

   ```csharp
   // Good
   throw new PropertyNotFoundException($"Property with key '{key}' not found");

   // Avoid
   throw new Exception("Error occurred");
   ```

### Comments and Documentation

1. **Code Should Be Self-Documenting**

   ```csharp
   // Good: No comment needed
   public bool IsPropertyFullyTranslated(Property property, List<string> requiredLanguages)
   {
       return requiredLanguages.All(lang => 
           property.Values.Any(v => v.Language == lang && !string.IsNullOrEmpty(v.Text)));
   }

   // Avoid: Comment explaining what code does
   // Checks if property has translations for all required languages
   public bool Check(Property prop, List<string> langs)
   {
       return langs.All(l => prop.Values.Any(v => v.Language == l && !string.IsNullOrEmpty(v.Text)));
   }
   ```

2. **Use XML Documentation for Public APIs**

   ```csharp
   /// <summary>
   /// Searches for properties based on the provided criteria.
   /// </summary>
   /// <param name="request">The search criteria including filters and pagination.</param>
   /// <returns>A paginated list of properties matching the search criteria.</returns>
   [HttpPost("search")]
   public ActionResult<SearchResponse> Search([FromBody] SearchRequest request)
   ```

3. **Write Tests That Express Intent**

   ```csharp
   [Test]
   public void PropertyReader_WhenLoadingValidJson_ShouldReturnPropertiesWithCorrectLanguage()
   {
       // Arrange
       var json = JObject.Parse("""{"key": "value"}""");
       var reader = new PropertyReader();

       // Act
       var properties = reader.Load(json, "en");

       // Assert
       Assert.That(properties.All(p => p.Values.Any(v => v.Language == "en")), Is.True);
   }
   ```

4. **Test Behavior, Not Implementation**

   ```csharp
   // Good: Testing behavior
   [Test]
   public void Search_WhenFilteringByLanguage_ShouldReturnOnlyPropertiesWithThatLanguage()

   // Avoid: Testing implementation
   [Test]
   public void Search_ShouldCallWhereMethodOnList()
   ```

## Frontend-Specific Guidelines (React/TypeScript)

### Component Design

1. **Keep Components Small and Focused**

   ```tsx
   // Good: Single responsibility
   const PropertyRow = ({ property, onEdit }: PropertyRowProps) => {
       return (
           <tr>
               <td>{property.key}</td>
               <td>{property.values.length}</td>
               <td>
                   <button onClick={() => onEdit(property)}>Edit</button>
               </td>
           </tr>
       );
   };

   // Avoid: Multiple responsibilities
   const PropertyManager = () => {
       // Handles fetching, filtering, sorting, editing, deleting...
   };
   ```

2. **Use TypeScript Properly**

   ```tsx
   // Good: Explicit types
   interface PropertyRowProps {
       property: Property;
       onEdit: (property: Property) => void;
       isReadOnly?: boolean;
   }

   // Avoid: Any types
   const PropertyRow = ({ property, onEdit }: any) => {
   ```

### State Management

1. **Keep State Close to Where It's Used**

   ```tsx
   // Good: Local state for local concerns
   const CommentsModal = ({ propertyId }: { propertyId: string }) => {
       const [comments, setComments] = useState<Comment[]>([]);
       const [isLoading, setIsLoading] = useState(false);
   };

   // Global state only for truly global data
   const AuthProvider = ({ children }: { children: ReactNode }) => {
       const [user, setUser] = useState<User | null>(null);
   };
   ```

## Code Review Checklist

Before submitting code, ensure:

- [ ] **KIS**: Is this the simplest solution that works?
- [ ] **Single Responsibility**: Does each class/method have one clear purpose?
- [ ] **Naming**: Are names clear and intention-revealing?
- [ ] **Method Size**: Are methods focused and reasonably sized?
- [ ] **Error Handling**: Are errors handled appropriately?
- [ ] **Tests**: Do tests express the intended behavior?
- [ ] **Documentation**: Is public API documented?
- [ ] **Dependencies**: Are dependencies injected rather than hard-coded?

Remember: **Perfect is the enemy of good.** Ship working, simple solutions over complex, theoretical perfection.
