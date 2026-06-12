import { apiUpload } from "@/lib/http";

export type UploadedMedia = { id: number; url: string; alt: string | null };

export const mediaApi = {
  async upload(file: File, alt?: string): Promise<UploadedMedia> {
    const form = new FormData();
    form.append("file", file);
    if (alt) form.append("alt", alt);
    const res = await apiUpload<{ data: UploadedMedia }>("/admin/media", form);
    return res.data;
  },
};
