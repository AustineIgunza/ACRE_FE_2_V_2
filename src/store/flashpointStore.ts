import { create } from 'zustand';

export interface TriageNode {
  id: string; // The row UUID
  node_id: string;
  title: string;
  topic: string;
  current_interval: number;
  next_due_timestamp: string;
  heat_score: number;
}

export interface FlashpointState {
  triageQueue: TriageNode[];
  currentNodeId: string | null;
  currentPhase: 1 | 2 | 3 | null;
  flashpointData: any;
  evaluationResult: { isSuccess: boolean; feedback: string } | null;
  isLoading: boolean;
  error: string | null;

  fetchTriage: () => Promise<void>;
  startReview: (nodeId: string) => Promise<void>;
  submitFlashpoint: (payload: any) => Promise<void>;
  resetFlashpoint: () => void;
}

export const useFlashpointStore = create<FlashpointState>((set, get) => ({
  triageQueue: [],
  currentNodeId: null,
  currentPhase: null,
  flashpointData: null,
  evaluationResult: null,
  isLoading: false,
  error: null,

  fetchTriage: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/flashpoint/triage`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch triage");
      set({ triageQueue: data.nodes || [], isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  startReview: async (nodeId: string) => {
    set({ isLoading: true, error: null, currentNodeId: nodeId, evaluationResult: null, flashpointData: null });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/flashpoint/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nodeId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      
      set({ currentPhase: data.phase, flashpointData: data.flashpoint, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  submitFlashpoint: async (payload: any) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/flashpoint/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nodeId: get().currentNodeId, ...payload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");
      
      set({ evaluationResult: data, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  resetFlashpoint: () => {
    set({ currentNodeId: null, currentPhase: null, flashpointData: null, evaluationResult: null, error: null });
  }
}));
