<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Operational Rules for AI Agents & Models

> [!IMPORTANT]
> **MANDATORY RULES FOR ALL AGENTS AND CHATS:**
> 1. **Do not do anything extra**: Execute only what is explicitly requested by the user.
> 2. **Discuss prerequisites first**: If anything additional or preparatory is needed for a task, discuss and confirm with the user before proceeding.
> 3. **Always ask before writing or changing**: NEVER create, modify, or delete any file without asking for and receiving explicit confirmation by telling all the changes that are to be made to the user first.
> 4. **Synchronize Documentation on File/Directory Changes**: If you notice any changes, additions, deletions, or structural updates across files or directories, you MUST update the architecture, directory tree, and file map in `summary.md` to keep the documentation completely accurate and in sync.
> 5. **Update the Changelog in `summary.md` on every change**: Whenever you add, modify, or fix features/files, you MUST document a concise summary under the **"Project Changelog & Recent Updates"** section in `summary.md` so future models and chats do not need to re-analyze the codebase.
> 6. **Always Read `summary.md` along with `AGENTS.md`**: Whenever an agent or model reads or references `AGENTS.md`, you MUST also read `summary.md` to load the current architecture, workflow, data contracts, and changelog into your context.

---

## Project Documentation Reference
For the complete project overview, directory structure, site map, workflow diagram, data contracts, and changelog, refer directly to:
👉 [summary.md](summary.md)
