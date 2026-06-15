import { AdminGuard } from "@/components/AdminGuard";
import { SeriesEditorView } from "@/modules/series/SeriesEditorView";

type Props = { params: Promise<{ id: string }> };

export default async function EditSeriesPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminGuard permission="stories.update">
      <SeriesEditorView seriesId={Number(id)} />
    </AdminGuard>
  );
}
