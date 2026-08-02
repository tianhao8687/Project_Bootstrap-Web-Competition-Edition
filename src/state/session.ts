import { ProjectSessionSchema, type Locale, type ProjectSession } from "../types/domain";

export const SESSION_STORAGE_KEY = "project-bootstrap-web/session/v1";

const now = () => new Date().toISOString();

export function createSession(locale: Locale = "zh-CN"): ProjectSession {
  return {
    id: crypto.randomUUID(),
    locale,
    mode: "demo",
    stage: "idea_input",
    idea: "",
    messages: [],
    acceptedResearchChanges: [],
    warningShown: false,
    updatedAt: now(),
  };
}

export function loadSession(): ProjectSession {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return createSession();
    return ProjectSessionSchema.parse(JSON.parse(stored));
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return createSession();
  }
}

export function saveSession(session: ProjectSession): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
