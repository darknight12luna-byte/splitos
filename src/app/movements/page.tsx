import { movementTechniques } from "@/lib/training/catalog";
import { CatalogList } from "@/components/library/CatalogList";

export default function MovementLibraryPage() {
  const items = movementTechniques.map((t) => ({
    slug: t.slug,
    name: t.name,
    category: t.parentSystem,
    subtitle: t.techniqueType.replace(/_/g, " "),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Movement Library</h1>
        <p className="text-sm text-muted">
          {movementTechniques.length} Animal Flow / mobility techniques from your training system.
        </p>
      </div>
      <CatalogList items={items} basePath="/movements" />
    </div>
  );
}
