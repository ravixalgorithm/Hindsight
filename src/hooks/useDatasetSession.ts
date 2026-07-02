import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export function useDatasetSession() {
  const [sessionId, setSessionId] = useState<string>("");
  const [activeMode, setActiveMode] = useState<string>("detective");

  useEffect(() => {
    let id = localStorage.getItem('hindsight_session');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('hindsight_session', id);
    }
    setSessionId(id);

    const mode = localStorage.getItem('hindsight_active_mode') || 'detective';
    setActiveMode(mode);

    const handleStorage = () => {
      setActiveMode(localStorage.getItem('hindsight_active_mode') || 'detective');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setActiveDatasetMode = (mode: string) => {
    localStorage.setItem('hindsight_active_mode', mode);
    setActiveMode(mode);
    window.dispatchEvent(new Event('storage'));
  };

  const detectiveDatasetName = sessionId ? `detective_core_${sessionId}` : "";
  const researchDatasetName = sessionId ? `research_${sessionId}` : "";
  
  // datasetName points to the active dataset so that other pages don't need changes.
  const datasetName = activeMode === 'research' ? researchDatasetName : detectiveDatasetName;

  return { sessionId, datasetName, detectiveDatasetName, researchDatasetName, setActiveDatasetMode, activeMode };
}
