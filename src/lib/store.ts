import { useEffect, useState, useSyncExternalStore } from "react";
import type { MatchAnalysis } from "./matcher";
import type { Roadmap } from "./roadmap";

const KEYS = {
  analyses: "gradion.analyses.v1",
  roadmaps: "gradion.roadmaps.v1",
  tasks: "gradion.taskStatus.v1",
  bookmarks: "gradion.bookmarks.v1",
} as const;

export type TaskStatus = "not_started" | "in_progress" | "completed";

// --- tiny external store so all pages stay in sync ---
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
let version = 0;
function getSnapshot() {
  return version;
}
export function useStoreVersion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

/** True only after client mount — gates localStorage-dependent renders so SSR and first client render match. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — app keeps working in-memory
  }
  version++;
  emit();
}

// --- Analyses ---
export function loadAnalyses(): MatchAnalysis[] {
  return read<MatchAnalysis[]>(KEYS.analyses, []);
}

export function saveAnalysis(a: MatchAnalysis) {
  const all = loadAnalyses().filter((x) => x.id !== a.id);
  all.unshift(a);
  write(KEYS.analyses, all.slice(0, 20));
}

export function getAnalysis(id: string | null | undefined): MatchAnalysis | null {
  if (!id) return loadAnalyses()[0] ?? null;
  return loadAnalyses().find((a) => a.id === id) ?? null;
}

// --- Roadmaps ---
export function saveRoadmap(r: Roadmap) {
  const all = read<Record<string, Roadmap>>(KEYS.roadmaps, {});
  all[r.analysisId] = r;
  write(KEYS.roadmaps, all);
}

export function getRoadmap(analysisId: string | null | undefined): Roadmap | null {
  if (!analysisId) return null;
  return read<Record<string, Roadmap>>(KEYS.roadmaps, {})[analysisId] ?? null;
}

// --- Task status ---
export function getTaskStatuses(): Record<string, TaskStatus> {
  return read<Record<string, TaskStatus>>(KEYS.tasks, {});
}

export function setTaskStatus(taskId: string, status: TaskStatus) {
  const all = getTaskStatuses();
  all[taskId] = status;
  write(KEYS.tasks, all);
}

// --- Bookmarks ---
export function getBookmarks(): string[] {
  return read<string[]>(KEYS.bookmarks, []);
}

export function toggleBookmark(id: string) {
  const all = getBookmarks();
  const next = all.includes(id) ? all.filter((b) => b !== id) : [...all, id];
  write(KEYS.bookmarks, next);
}

// --- Readiness score ---
/**
 * Readiness = demonstrable preparation toward the role.
 * Distinct from match score: it grows as the user completes roadmap tasks
 * and already counts demonstrated skills, projects and certifications.
 */
export function computeReadiness(analysis: MatchAnalysis | null, roadmap: Roadmap | null): { score: number; factors: { label: string; points: number; max: number }[] } {
  if (!analysis) return { score: 0, factors: [] };
  const factors: { label: string; points: number; max: number }[] = [];

  const demonstrated = analysis.matched.filter((m) => m.evidence === "demonstrated").length;
  const totalJdSkills = analysis.matched.length + analysis.partial.length + analysis.missing.length;
  const skillPts = totalJdSkills ? Math.round((demonstrated / totalJdSkills) * 30) : 0;
  factors.push({ label: "Verified relevant skills", points: skillPts, max: 30 });

  const projectPts = Math.min(analysis.subscores.projects, 100) / 100;
  factors.push({ label: "Practical projects", points: Math.round(projectPts * 20), max: 20 });

  const hasCert = /certificat|certified|course|specialization/i.test(analysis.resumeText);
  factors.push({ label: "Certifications", points: hasCert ? 10 : 0, max: 10 });

  const hasPortfolio = /github|portfolio|kaggle|behance/i.test(analysis.resumeText);
  factors.push({ label: "Portfolio evidence", points: hasPortfolio ? 10 : Math.round(projectPts * 10), max: 10 });

  factors.push({ label: "Relevant experience", points: Math.round((analysis.subscores.experience / 100) * 15), max: 15 });

  let taskPts = 0;
  if (roadmap) {
    const statuses = getTaskStatuses();
    const tasks = roadmap.phases.flatMap((p) => p.tasks);
    const done = tasks.filter((t) => statuses[t.id] === "completed").length;
    taskPts = tasks.length ? Math.round((done / tasks.length) * 15) : 0;
  }
  factors.push({ label: "Roadmap milestones completed", points: taskPts, max: 15 });

  const score = Math.min(100, factors.reduce((a, f) => a + f.points, 0));
  return { score, factors };
}
