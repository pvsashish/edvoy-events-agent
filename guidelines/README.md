# Edvoy Events Agent — Guidelines Index

**Last updated:** 2026-06-08

## Project Docs
| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](project/ARCHITECTURE.md) | System overview, stack, file map, DB schema, env vars |
| [OPERATIONS.md](project/OPERATIONS.md) | Run locally, deploy, Neon setup, troubleshoot |

## Feature Registry
| Doc | Purpose |
|-----|---------|
| [FEATURES_INDEX.md](features/FEATURES_INDEX.md) | All features, status, links to flow docs |
| [FEATURE_TO_CODE_OWNERSHIP_MAP.md](features/FEATURE_TO_CODE_OWNERSHIP_MAP.md) | Every file → feature mapping |

## Feature Flow Docs
| Feature | Doc |
|---------|-----|
| Groq Vision Analysis | [features/groq_analysis/GROQ_ANALYSIS_FLOW.md](features/groq_analysis/GROQ_ANALYSIS_FLOW.md) |
| Specs History (Neon DB) | [features/specs_history/SPECS_HISTORY_FLOW.md](features/specs_history/SPECS_HISTORY_FLOW.md) |
| Upload + Video Frames | [features/upload/UPLOAD_FLOW.md](features/upload/UPLOAD_FLOW.md) |
| Naming Converter Tab | [features/naming_converter/NAMING_CONVERTER_FLOW.md](features/naming_converter/NAMING_CONVERTER_FLOW.md) |

## Reference
| Doc | Purpose |
|-----|---------|
| [FEATURE_DOC_PROMPT.md](prompts/FEATURE_DOC_PROMPT.md) | Prompt for updating feature docs after a code change |
| [FEATURE_GUIDELINE_TEMPLATE.md](templates/FEATURE_GUIDELINE_TEMPLATE.md) | Blank template for new feature flow docs |

## Naming Conventions
- Feature flow docs: `guidelines/features/<name>/<NAME>_FLOW.md`
- Git commit prefixes: `docs:` for guideline updates · `feat:` for features · `fix:` for bugs · `refactor:` for refactors
- SESSION.md: local only, never committed
