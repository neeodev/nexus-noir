import { AdminGuard } from "@/components/AdminGuard";
import { StoryEditorView } from "@/modules/editor/components/StoryEditorView";

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminGuard permission="stories.view">
      <StoryEditorView storyId={Number(id)} />
    </AdminGuard>
  );
}
