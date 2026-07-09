export interface CategoryTheme {
  color: string;
  emoji: string;
}

const THEMES: Record<string, CategoryTheme> = {
  upper_body: { color: "var(--accent-blue)", emoji: "💪" },
  lower_body: { color: "var(--accent-green)", emoji: "🦵" },
  animal_flow: { color: "var(--accent-purple)", emoji: "🐆" },
  mixed: { color: "var(--accent-orange)", emoji: "🔀" },
};

const DEFAULT_THEME: CategoryTheme = { color: "var(--accent-lime)", emoji: "🏋️" };

export function getCategoryTheme(category: string): CategoryTheme {
  return THEMES[category] ?? DEFAULT_THEME;
}

/** Exercise catalog categories (strength/warmup/core/...) use a different taxonomy than the
 * 4 split-day categories above, but reuse the same accent palette for visual consistency. */
const EXERCISE_CATEGORY_COLORS: Record<string, string> = {
  strength: "var(--accent-blue)",
  machine_strength: "var(--accent-blue)",
  accessory: "var(--accent-purple)",
  core: "var(--accent-orange)",
  conditioning: "var(--accent-green)",
  warmup: "var(--accent-lime)",
  mobility: "var(--accent-lime)",
  animal_flow_prep: "var(--accent-purple)",
  recovery: "var(--accent-green)",
};

export function getExerciseCategoryColor(category: string): string {
  return EXERCISE_CATEGORY_COLORS[category] ?? "var(--accent-lime)";
}

const EXERCISE_CATEGORY_ICONS: Record<string, string> = {
  strength: "🏋️",
  machine_strength: "🏋️",
  accessory: "💪",
  core: "🧘",
  conditioning: "🏃",
  warmup: "🔥",
  mobility: "🤸",
  animal_flow_prep: "🐆",
  recovery: "🚶",
};

export function getExerciseCategoryIcon(category: string): string {
  return EXERCISE_CATEGORY_ICONS[category] ?? "🏋️";
}

const PARENT_SYSTEM_THEME: Record<string, CategoryTheme> = {
  animal_flow: { color: "var(--accent-purple)", emoji: "🐆" },
  primal_movement: { color: "var(--accent-orange)", emoji: "🦍" },
  shoulder_prep: { color: "var(--accent-blue)", emoji: "🔧" },
  lower_mobility: { color: "var(--accent-green)", emoji: "🤸" },
};

export function getParentSystemTheme(parentSystem: string): CategoryTheme {
  return PARENT_SYSTEM_THEME[parentSystem] ?? DEFAULT_THEME;
}
