import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { API_URL } from "../config/api";
import { db } from "../config/firebase";
import { uploadImageToCloudinary } from "./cloudinaryService";
import { normalizeLabel } from "../utils/normalizeLabel";
import { toIsoDate } from "../utils/formatDate";

export async function fetchUserAnalyses(uid) {
  const q = query(
    collection(db, "users", uid, "analyses"),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  const snap = await getDocs(q);

  return snap.docs.map((itemDoc) => {
    const data = itemDoc.data();
    return {
      id: itemDoc.id,
      ...data,
      createdAt: toIsoDate(data?.createdAt),
    };
  });
}

export async function analyzeImage(file, errorMessage) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(API_URL, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || errorMessage || "Analysis server error");
  }

  return data;
}

export async function saveAnalysisResult({ file, user, modelResult }) {
  const probability = Number(modelResult?.probability) || 0;
  const percent = Math.round(probability * 100);
  const label = normalizeLabel(modelResult?.label);
  const analysisRef = doc(collection(db, "analysis_results"));

  const uploaded = await uploadImageToCloudinary(file, user.uid, analysisRef.id);

  const analysisData = {
    userId: user.uid,
    userEmail: user.email || "",
    imageUrl: uploaded.secureUrl,
    thumbUrl: uploaded.secureUrl,
    cloudinaryPublicId: uploaded.publicId,
    cloudinaryAssetId: uploaded.assetId,
    width: uploaded.width,
    height: uploaded.height,
    format: uploaded.format,
    bytes: uploaded.bytes,
    label,
    percent,
    isCorrect: null,
    createdAt: serverTimestamp(),
  };

  await setDoc(analysisRef, analysisData);
  await setDoc(doc(db, "users", user.uid, "analyses", analysisRef.id), analysisData);

  return {
    id: analysisRef.id,
    imageUrl: uploaded.secureUrl,
    thumbUrl: uploaded.secureUrl,
    cloudinaryPublicId: uploaded.publicId,
    cloudinaryAssetId: uploaded.assetId,
    width: uploaded.width,
    height: uploaded.height,
    format: uploaded.format,
    bytes: uploaded.bytes,
    label,
    percent,
    isCorrect: null,
    createdAt: new Date().toISOString(),
  };
}

export async function saveAnalysisFeedback(userId, analysisId, isCorrect) {
  await updateDoc(doc(db, "analysis_results", analysisId), { isCorrect });
  await updateDoc(doc(db, "users", userId, "analyses", analysisId), { isCorrect });
}
