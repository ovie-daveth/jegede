import { z } from "zod";
export const MAX_FILE_SIZE = 250 * 1024 * 1024;
export const categories = [
  "3D modelling",
  "CAD drafting",
  "Plant design",
  "Engineering projects",
] as const;
export const projectSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(150),
  year: z
    .string()
    .regex(/^\d{4}$/)
    .refine(
      (v) => Number(v) >= 1900 && Number(v) <= new Date().getFullYear() + 1,
    ),
  tools: z.string().trim().min(1).max(500),
  category: z.enum(categories),
  description: z.string().trim().min(1).max(10000),
  published: z.boolean(),
});
const allowed = new Set([
  "mp4",
  "webm",
  "mov",
  "m4v",
  "avi",
  "mkv",
  "mp3",
  "wav",
  "ogg",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "pdf",
  "dwg",
  "dxf",
  "step",
  "stp",
  "stl",
  "obj",
  "iges",
  "igs",
  "sldprt",
  "sldasm",
  "zip",
  "7z",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xlsx",
  "csv",
  "txt",
]);
export const uploadSchema = z.object({
  projectId: z.string().uuid(),
  name: z
    .string()
    .min(1)
    .max(250)
    .refine(
      (v) =>
        !/[\r\n\0]/.test(v) &&
        allowed.has(v.split(".").pop()?.toLowerCase() || ""),
    ),
  size: z.number().int().positive().max(MAX_FILE_SIZE),
});
export function fileMime(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return (
    (
      {
        mp4: "video/mp4",
        webm: "video/webm",
        mov: "video/quicktime",
        m4v: "video/mp4",
        mp3: "audio/mpeg",
        wav: "audio/wav",
        ogg: "audio/ogg",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        webp: "image/webp",
        gif: "image/gif",
        pdf: "application/pdf",
      } as Record<string, string>
    )[ext] || "application/octet-stream"
  );
}
export function uploadMatches(
  expected: { size: number; mime: string },
  actual: { ContentLength?: number; ContentType?: string },
) {
  return (
    expected.size === actual.ContentLength &&
    expected.mime === actual.ContentType
  );
}
