import "server-only";
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { required } from "./config";
function client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${required("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}
export async function presignUpload(key: string, mime: string, size: number) {
  return getSignedUrl(
    client(),
    new PutObjectCommand({
      Bucket: required("R2_BUCKET_NAME"),
      Key: key,
      ContentType: mime,
      ContentLength: size,
    }),
    {
      expiresIn: 900,
      signableHeaders: new Set(["content-type", "content-length"]),
    },
  );
}
export async function presignRead(
  key: string,
  name: string,
  mime: string,
  download: boolean,
) {
  return getSignedUrl(
    client(),
    new GetObjectCommand({
      Bucket: required("R2_BUCKET_NAME"),
      Key: key,
      ResponseContentType: mime,
      ResponseContentDisposition: `${download || mime === "application/octet-stream" ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(name)}`,
    }),
    { expiresIn: 3600 },
  );
}
export async function inspectObject(key: string) {
  return client().send(
    new HeadObjectCommand({ Bucket: required("R2_BUCKET_NAME"), Key: key }),
  );
}
export async function deleteObject(key: string) {
  await client().send(
    new DeleteObjectCommand({ Bucket: required("R2_BUCKET_NAME"), Key: key }),
  );
}
