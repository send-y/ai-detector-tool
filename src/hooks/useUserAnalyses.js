import { useCallback, useEffect, useState } from "react";
import { fetchUserAnalyses } from "../services/analysisService";

export function useUserAnalyses(uid) {
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const loadUserAnalyses = useCallback(async () => {
    if (!uid) {
      setAnalysisHistory([]);
      return;
    }

    try {
      const items = await fetchUserAnalyses(uid);
      setAnalysisHistory(items);
    } catch (err) {
      console.error("Ошибка загрузки истории анализов:", err);
      setAnalysisHistory([]);
    }
  }, [uid]);

  useEffect(() => {
    loadUserAnalyses();
  }, [loadUserAnalyses]);

  const addAnalysis = useCallback((item) => {
    setAnalysisHistory((prev) => [item, ...prev].slice(0, 20));
  }, []);

  const clearAnalyses = useCallback(() => {
    setAnalysisHistory([]);
  }, []);

  return {
    analysisHistory,
    addAnalysis,
    clearAnalyses,
    loadUserAnalyses,
  };
}
