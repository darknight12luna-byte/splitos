import { exercises } from "@/lib/training/catalog";
import { getExerciseCategoryColor, getExerciseCategoryIcon } from "@/lib/training/category-theme";
import { CatalogList } from "@/components/library/CatalogList";

export default function ExerciseLibraryPage() {
  const items = exercises.map((e) => ({
    slug: e.slug,
    name: e.name,
    category: e.category,
    subtitle: [e.defaultSets, e.defaultReps].filter(Boolean).join(" x ") || e.movementPattern,
    color: getExerciseCategoryColor(e.category),
    icon: getExerciseCategoryIcon(e.category),
    difficulty: e.difficulty,
    hasVideo: Boolean(e.mediaReference?.url),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exercise Library</h1>
        <p className="text-sm text-muted">{exercises.length} exercises from your training system.</p>
      </div>
      <CatalogList items={items} basePath="/exercises" />
    </div>
  );
}
