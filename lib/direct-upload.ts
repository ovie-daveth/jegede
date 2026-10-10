export async function directUpload(
  projectId: string,
  file: File,
  onProgress: (percentage: number) => void,
) {
  let uploadId: string | undefined;
  try {
    const request = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, name: file.name, size: file.size }),
    });
    const data = await request.json();
    if (!request.ok) throw Error(data.error || "Could not start upload.");
    uploadId = data.id;
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", data.url);
      xhr.setRequestHeader("Content-Type", data.mime);
      xhr.timeout = 15 * 60 * 1000;
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable)
          onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(
              Error(
                "R2 rejected the upload. Check bucket credentials and CORS settings.",
              ),
            );
      xhr.onerror = () =>
        reject(
          Error("Upload failed. Check your connection and R2 CORS settings."),
        );
      xhr.ontimeout = () =>
        reject(Error("Upload timed out. Retry on a faster connection."));
      xhr.send(file);
    });
    const completion = await fetch("/api/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: uploadId }),
    });
    const result = await completion.json();
    if (!completion.ok)
      throw Error(result.error || "Could not verify uploaded file.");
  } catch (e) {
    if (uploadId)
      await fetch("/api/upload?id=" + uploadId, { method: "DELETE" }).catch(
        () => {},
      );
    throw e;
  }
}
