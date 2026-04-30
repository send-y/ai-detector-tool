import { useCallback, useState } from "react";
import { auth } from "../config/firebase";
import {
  analyzeImage,
  saveAnalysisFeedback,
  saveAnalysisResult,
} from "../services/analysisService";

export function useImageAnalysis({ onAnalysisSaved, t }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [lastAnalysisId, setLastAnalysisId] = useState(null);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  const resetAnalysis = useCallback(() => {
    setResult(null);
    setPreview(null);
    setError(null);
    setFeedbackOpen(false);
    setLastAnalysisId(null);

    const input = document.getElementById("fileInput");
    if (input) input.value = "";
  }, []);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setResult(null);
      setError(null);
      setIsLoading(true);
      setLastAnalysisId(null);

      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error(t.unauthorized);
        }

        const data = await analyzeImage(file, t.analysisServerError);
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
        URL.revokeObjectURL(objectUrl);
      }
    },
    [onAnalysisSaved, t]
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
