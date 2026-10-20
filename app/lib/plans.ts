import type { PlanTodo } from "@/app/lib/db";

export const PLAN_STATUSES = ["idea", "planned", "in progress", "paused"] as const;

export function parsePlanKeywords(value: unknown): string[] | null {
  if (typeof value !== "string") return null;
  const keywords = value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  if (keywords.length > 20 || keywords.some((keyword) => keyword.length > 40)) return null;
  return [...new Set(keywords)];
}

export function parsePlanTodos(value: unknown): PlanTodo[] | null {
  if (typeof value !== "string") return null;
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length > 100) return null;
  const todos: PlanTodo[] = [];
  for (const line of lines) {
    const checked = line.match(/^(?:[-*]\s*)?\[([ xX])\]\s*(.+)$/);
    const text = (checked ? checked[2] : line.replace(/^[-*]\s+/, "")).trim();
    if (!text || text.length > 300) return null;
    todos.push({ text, done: Boolean(checked && checked[1].toLowerCase() === "x") });
  }
  return todos;
}
