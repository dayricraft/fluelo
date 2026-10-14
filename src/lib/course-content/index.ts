import { DAILY_ROUTINE_CONTENT } from "./daily-routine";
import { INTRODUCE_YOURSELF_CONTENT } from "./introduce-yourself";
import { PAST_ACTIVITIES_CONTENT } from "./past-activities";
import type { LessonContent, UnitContent } from "./types";

export * from "./types";

export const FOUNDATION_CONTENT: readonly UnitContent[] = [
  INTRODUCE_YOURSELF_CONTENT,
  DAILY_ROUTINE_CONTENT,
  PAST_ACTIVITIES_CONTENT,
];

function uniqueMap<T>(
  items: readonly T[],
  idFor: (item: T) => string,
  label: string,
): Map<string, T> {
  const result = new Map<string, T>();
  for (const item of items) {
    const id = idFor(item);
    if (result.has(id)) {
      throw new Error(`Duplicate ${label} ID: ${id}`);
    }
    result.set(id, item);
  }
  return result;
}

const UNIT_CONTENT = uniqueMap(
  FOUNDATION_CONTENT,
  (unit) => unit.unitId,
  "unit content",
);

const ALL_LESSON_CONTENT: readonly LessonContent[] =
  FOUNDATION_CONTENT.flatMap((unit) =>
    unit.lessons.map((lesson) => lesson),
  );

const LESSON_CONTENT = uniqueMap(
  ALL_LESSON_CONTENT,
  (lesson) => lesson.lessonId,
  "lesson content",
);

export function getUnitContent(unitId: string): UnitContent | undefined {
  return UNIT_CONTENT.get(unitId);
}

export function getLessonContent(lessonId: string): LessonContent | undefined {
  return LESSON_CONTENT.get(lessonId);
}
