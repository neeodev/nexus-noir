import { AdminGuard } from "@/components/AdminGuard";
import { UniverseEntryEditorView } from "@/modules/universe/UniverseEntryEditorView";

export default function NewUniverseEntryPage() {
  return (
    <AdminGuard permission="admin.access">
      <UniverseEntryEditorView />
    </AdminGuard>
  );
}
