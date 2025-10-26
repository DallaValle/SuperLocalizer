# Response Optimization Instructions

## Synthetic Response Guidelines

### Core Principles
- **Conciseness First**: Provide direct, actionable answers without unnecessary elaboration
- **Context Efficiency**: Read only the minimum necessary files to understand and complete the task
- **Batch Operations**: When multiple files need to be read, read them in parallel rather than sequentially
- **Smart Inference**: Use project structure and naming conventions to make educated assumptions before reading files

### Response Style
- **Synthetic Summaries**: Provide condensed, essential information rather than verbose explanations
- **Action-Oriented**: Focus on what needs to be done rather than explaining why at length
- **Code-First**: Show solutions through code examples rather than lengthy descriptions
- **Minimal Acknowledgments**: Skip unnecessary confirmations and get straight to the solution

## File Reading Optimization

### Reading Strategy
1. **Start with Structure**: Use `list_dir` and `file_search` to understand project layout before reading content
2. **Target Specific Sections**: Use `read_file` with precise line ranges rather than reading entire files
3. **Leverage Search Tools**: Use `grep_search` and `semantic_search` to locate specific content quickly
4. **Parallel Reading**: Read multiple related files simultaneously when context requires it
5. **Large Chunks**: When reading is necessary, read meaningful chunks (50-200 lines) rather than small sections

### File Reading Priorities
1. **Configuration Files**: Read sparingly, focus on relevant sections only
2. **Core Logic**: Target specific functions/classes rather than entire files
3. **Documentation**: Scan for relevant sections, don't read comprehensively
4. **Test Files**: Read only when understanding implementation details is critical

### Avoid Over-Reading
- Don't read files if the task can be completed with existing context
- Don't read multiple similar files when one example provides sufficient understanding
- Don't read implementation details when interface/API information is sufficient
- Don't read entire file histories when current state is adequate

### Smart Context Building
- Use file extensions and naming patterns to infer content and structure
- Leverage project documentation (README, package.json, etc.) to understand architecture
- Use existing conversation context to avoid re-reading previously examined files
- Apply knowledge of common frameworks and patterns to minimize exploration

## Implementation Examples

### Good: Targeted File Reading
```
1. Check project structure with list_dir
2. Search for specific functionality with grep_search
3. Read only the relevant function/class with precise line ranges
4. Provide solution with minimal context explanation
```

### Avoid: Excessive File Reading
```
1. Reading entire files to understand small changes
2. Reading multiple similar files for pattern recognition
3. Reading documentation files cover-to-cover
4. Sequential reading when parallel reading is possible
```

## Response Format

### Preferred Structure
1. **Direct Answer/Solution** (if possible without reading)
2. **Minimal Context Gathering** (targeted file reading)
3. **Synthetic Summary** (condensed findings)
4. **Action Items** (what to do next)

### Avoid
- Long explanations of what you're about to do
- Detailed reasoning for each file reading decision
- Comprehensive project analysis when specific answers are needed
- Verbose confirmations and status updates

## Context Management

### Memory Efficiency
- Reference previously read content rather than re-reading
- Build understanding incrementally rather than comprehensively
- Focus on changed/relevant sections in subsequent reads
- Use conversation history to maintain context across interactions

### Smart Assumptions
- Leverage SuperLocalizer project knowledge from copilot-instructions.md
- Apply standard .NET/Next.js patterns and conventions
- Use file naming and structure to infer functionality
- Trust established project architecture rather than verifying every detail

## Quality Assurance

### Validation Strategy
- Verify critical changes with minimal targeted reading
- Use existing test files to understand expected behavior
- Leverage type definitions and interfaces over implementation reading
- Focus on integration points rather than internal implementation details

### Error Prevention
- Read configuration files when making environment changes
- Verify API contracts when modifying interfaces
- Check dependency files when adding new packages
- Review related test files when modifying core logic

This instruction set prioritizes efficiency and directness while maintaining accuracy and completeness in responses.