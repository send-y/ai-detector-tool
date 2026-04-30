import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../config/cloudinary";

export async function uploadImageToCloudinary(file, userId, analysisId) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary environment variables are not configured");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", `lander_uploads/${userId}`);
  formData.append("public_id", analysisId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Cloudinary upload error");
  }

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    assetId: data.asset_id,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
  };
}
