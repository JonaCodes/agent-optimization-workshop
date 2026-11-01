# Coding-agent guardrails

- Requires Node.js 24+ and Git. Start coding-agent sessions on `main`.
- Codex: trust this project, then use `/hooks` to review and trust its hook.
- Claude Code 2.1.295+: accept workspace trust and use `/hooks` to verify the hook.
- Hooks restrict supported tools only; they do not enforce filesystem or network isolation. Codex hosted web search is outside hook coverage.
- Check the policy: `node --test .workshop/hooks/guard.test.mjs`.
