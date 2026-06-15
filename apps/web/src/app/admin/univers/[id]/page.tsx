import { AdminGuard } from "@/components/AdminGuard";
import { UniverseEntryEditorView } from "@/modules/universe/UniverseEntryEditorView";

type Params = { id: string };

export default async function EditUniverseEntryPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return (
    <AdminGuard permission="admin.access">
      <UniverseEntryEditorView entryId={Number(id)} />
    </AdminGuard>
  );
}
