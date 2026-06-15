import { AdminGuard } from "@/components/AdminGuard";
import { SeriesEditorView } from "@/modules/series/SeriesEditorView";

export default function NouvelleSeriesPage() {
  return (
    <AdminGuard permission="stories.create">
      <SeriesEditorView />
    </AdminGuard>
  );
}
