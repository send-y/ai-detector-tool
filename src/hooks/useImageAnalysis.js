import { useCallback, useEffect, useRef, useState } from "react";
import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
} from "../config/api";
import { auth } from "../config/firebase";
import {
  analyzeImage,
  saveAnalysisFeedback,
  saveAnalysisResult,
} from "../services/analysisService";

function hasAllowedExtension(file) {
  const name = String(file?.name || "").toLowerCase();
  return ALLOWED_IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function validateImageFile(file, t) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(t.fileTooLarge(MAX_UPLOAD_MB));
  }

  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(t.unsupportedFileType);
  }

  if (!file.type && !hasAllowedExtension(file)) {
    throw new Error(t.unsupportedFileType);
  }
}

export function useImageAnalysis({ onAnalysisSaved, t }) {
  const previewUrlRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [lastAnalysisId, setLastAnalysisId] = useState(null);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  const clearPreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    clearPreviewUrl();
    setResult(null);
    setPreview(null);
    setError(null);
    setFeedbackOpen(false);
    setLastAnalysisId(null);

    const input = document.getElementById("fileInput");
    if (input) input.value = "";
  }, [clearPreviewUrl]);

  useEffect(() => clearPreviewUrl, [clearPreviewUrl]);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;

      setResult(null);
      setLastAnalysisId(null);
      setError(null);

      try {
        validateImageFile(file, t);

        const user = auth.currentUser;
        if (!user) {
          throw new Error(t.unauthorized);
        }

        clearPreviewUrl();
        const objectUrl = URL.createObjectURL(file);
        previewUrlRef.current = objectUrl;
        setPreview(objectUrl);
        setIsLoading(true);

        const authToken = await user.getIdToken();
        const data = await analyzeImage(file, authToken, t.analysisServerError);
        setResult(data);

        const savedAnalysis = await saveAnalysisResult({
          file,
          user,
          modelResult: data,
        });

        setLastAnalysisId(savedAnalysis.id);
        onAnalysisSaved?.(savedAnalysis);
      } catch (err) {
        console.error("Ошибка в handleFile:", err);
        setError(err?.message || t.analyzeFailed);
      } finally {
        setIsLoading(false);
      }
    },
    [clearPreviewUrl, onAnalysisSaved, t]
  );

  const saveFeedback = useCallback(
    async (isCorrect) => {
      const user = auth.currentUser;

      try {
        setIsSavingFeedback(true);

        if (!user) {
          throw new Error(t.unauthorized);
        }

        if (!lastAnalysisId) {
          throw new Error(t.lastAnalysisNotFound);
        }

        await saveAnalysisFeedback(user.uid, lastAnalysisId, isCorrect);
        resetAnalysis();
      } catch (err) {
        console.error("Ошибка сохранения feedback:", err);
        setError(err?.message || t.feedbackSaveFailed);
        resetAnalysis();
      } finally {
        setIsSavingFeedback(false);
      }
    },
    [lastAnalysisId, resetAnalysis, t]
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileInput = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return {
    isDragging,
    isLoading,
    result,
    error,
    preview,
    feedbackOpen,
    isSavingFeedback,
    setFeedbackOpen,
    resetAnalysis,
    saveFeedback,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileInput,
  };
}
