import { AdminGuard } from "@/components/AdminGuard";
import { AdminStoriesList } from "@/modules/editor/components/AdminStoriesList";

export default function AdminStoriesPage() {
  return (
    <AdminGuard permission="stories.view">
      <AdminStoriesList />
    </AdminGuard>
  );
}
