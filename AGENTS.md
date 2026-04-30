<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Agent Command

- Prefer use rtk read instead powershell Get-Content, it does the same thing.

## Working Rules

- Always analyze the existing codebase before making any changes.
- Before execution, inspect related pages, components, and files to understand current patterns and architecture.
- Use other pages or existing modules as references whenever possible to keep consistency.

## Code Standards

- Write clean, readable, and maintainable code.
- Follow best practices for the language, framework, and project structure already used in this repository.
- Keep logic modular and separated by responsibility.
- Avoid putting long or complex logic inside a single component or file.
- Prefer small, focused, reusable components and functions.
- Use alias @ import style when import from src directory

## Component Organization

- Put globally reusable components inside the shared `components` directory.
- Put page-specific components inside the same page directory in separate files.
- Do not mix global reusable components with page-only components.
- Extract repeated UI or logic into reusable modules when appropriate.

## Implementation Expectations

- Match the existing coding style and patterns already used in the project.
- Do not introduce unnecessary abstractions.
- Keep solutions scalable, structured, and easy to extend.
- Prioritize clarity over cleverness.

## Check

- Use 'rtk yarn typecheck' to check type errors
- No need to build
- Use 'rtk yarn lint' to check lint errors
