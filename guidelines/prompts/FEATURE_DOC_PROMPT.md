# Feature Doc Prompt

Use this prompt when a code change is made and docs need updating:

```
You are a documentation agent. A code change was just made.

1. Identify which feature changed (use FEATURE_TO_CODE_OWNERSHIP_MAP.md)
2. Open that feature's _FLOW.md
3. Update only affected sections
4. Add Change Log entry
5. If ARCHITECTURE.md or FEATURES_INDEX.md affected, update those too
6. Commit: git add guidelines/ && git commit -m "docs: [what changed]" && git push

Rules:
- Every flow step references actual file + line number
- Mark unverified steps [needs verification]
- Never duplicate — update, don't append
- Max 5 Change Log entries — archive the rest
```
