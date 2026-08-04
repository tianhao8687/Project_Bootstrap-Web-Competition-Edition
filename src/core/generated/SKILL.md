---
name: project-bootstrap
description: Start or deliberately re-scope a software project before implementation. Turn a rough idea into PROJECT_BRIEF.md, PROJECT_PLAN.md, and AI_PROJECT_RULES.md. Use for new projects, projects not yet in implementation, or explicit MVP redefinition. Do not use for local changes, known bug fixes, code review, testing, deployment, release work, or ordinary implementation. 仅用于新软件项目启动或明确的重新定界，不用于已有项目的局部开发、修复、测试或发布。
---

# Project Bootstrap

## Boundary first

This Skill is responsible only for **project startup and definition before implementation begins**.

Use it when the user:

- has a rough software idea;
- is preparing to start a new software project;
- needs to define target users, the core problem, MVP boundaries, and an implementation direction;
- explicitly asks to re-scope a project whose goals or planning documents materially conflict.

Do not use it for:

- a local feature change in an existing project;
- a known bug fix, implementation task, refactor, code review, or test task;
- deployment, release, CI, packaging, or runtime troubleshooting;
- answering one technical question or writing one standalone function.

Do not activate merely because the user mentions “software,” “project,” or “AI.” Read only the minimum existing context needed to decide whether this is genuinely project-bootstrap work.

## Language route

After the boundary check passes, read exactly one workflow:

- Chinese conversation: `zh-CN/SKILL.md`
- Other languages: `en/SKILL.md`

Do not load both language versions.

If the boundary check fails, do not generate the three project files and do not restart project planning. Briefly state that Project Bootstrap does not apply, then continue with the appropriate implementation, debugging, testing, or release workflow.

## Completion handoff

After `PROJECT_BRIEF.md`, `PROJECT_PLAN.md`, and `AI_PROJECT_RULES.md` are complete:

- Project Bootstrap ends immediately;
- later development carries and reads only those three files as needed;
- normal implementation, debugging, testing, and release work must not keep loading this Skill;
- later workflows must not redefine confirmed project goals unless the user explicitly approves the change.

This entrypoint adds only scope, exit, language routing, and handoff rules. It does not change the existing three-file pipeline and does not create a fourth formal file.
