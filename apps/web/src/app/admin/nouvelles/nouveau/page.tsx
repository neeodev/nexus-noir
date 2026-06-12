import { AdminGuard } from "@/components/AdminGuard";
import { StoryEditorView } from "@/modules/editor/components/StoryEditorView";

export default function NewStoryPage() {
  return (
    <AdminGuard permission="stories.create">
      <StoryEditorView />
    </AdminGuard>
  );
}
