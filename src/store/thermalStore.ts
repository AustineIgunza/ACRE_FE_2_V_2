import { create } from 'zustand';
import { Node, Unit, ThermalState, NodeStatus } from '@/types/thermal';
import { authClient } from '@/lib/authClient';

// All DB requests are now routed to the authenticated backend API
interface ThermalStore extends ThermalState {
  // Navigation
  selectUnit: (unitId: string) => void;
  selectNode: (unitId: string, nodeId: string) => void;
  
  // Backend Integration
  fetchThermalLibrary: () => Promise<void>;
  updateNodeStats: (unitId: string, nodeId: string, isSuccess: boolean) => Promise<void>;
  fetchNodeHistory: (nodeId: string) => Promise<void>;
}

function mapHeatToStatus(heat: number, isIgnited: boolean): 'neutral' | 'frost' | 'warning' | 'ignition' {
  if (heat >= 100) return 'ignition';
  if (heat >= 60) return 'warning';
  if (heat >= 25) return 'frost';
  return 'neutral';
}

function calculateUnitStability(nodes: Node[]): number {
  if (!nodes || nodes.length === 0) return 0;
  return nodes.reduce((sum, n) => sum + n.heat, 0) / nodes.length;
}

export const useThermalStore = create<ThermalStore>((set, get) => ({
  units: [],
  currentUnitId: undefined,
  currentNodeId: undefined,
  currentNodeHistory: null,
  totalHeat: 0,
  get overallIntegrity() {
    const state = get();
    if (state.units.length === 0) return 0;
    const allNodes = state.units.flatMap(u => u.nodes);
    if (allNodes.length === 0) return 0;
    return allNodes.reduce((sum, n) => sum + n.integrity, 0) / allNodes.length;
  },

  selectUnit: (unitId: string) => set({ currentUnitId: unitId }),
  selectNode: (unitId: string, nodeId: string) => set({ currentUnitId: unitId, currentNodeId: nodeId }),

  fetchThermalLibrary: async () => {
    const { data: session } = await authClient.getSession();
    if (!session?.user) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/thermal/library`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error("API Unauthorized or Failed");
      
      const { units: data } = await res.json();

      if (data) {
      const parsedUnits: Unit[] = data.map((unit: any) => {
        const parsedNodes: Node[] = (unit.nodes || unit.user_nodes || []).map((n: any) => ({
          id: n.node_id,
          title: n.title,
          topic: n.topic,
          status: mapHeatToStatus(n.heat_score, n.is_ignited),
          heat: n.heat_score,
          integrity: n.total_attempts > 0
            ? Math.round((n.correct_attempts / n.total_attempts) * 100)
            : 0,
          createdAt: new Date(unit.created_at),
          lastAttempt: new Date(n.last_attempt),
          correctAttempts: n.correct_attempts,
          totalAttempts: n.total_attempts,
          thermalLeak: false,
          intel_card: n.intel_card || null
        }));

        return {
          id: unit.id,
          name: unit.title,
          description: unit.description || 'Learning Session',
          createdAt: new Date(unit.created_at),
          stability: calculateUnitStability(parsedNodes),
          nodes: parsedNodes
        };
      });

      set({ units: parsedUnits });
      
      // Auto-select first unit if none selected
      const current = get().currentUnitId;
      if (!current && parsedUnits.length > 0) {
         set({ currentUnitId: parsedUnits[0].id });
      }
    }
    } catch (err) {
      console.error('Failed to fetch thermal library:', err);
    }
  },

  updateNodeStats: async (unitId: string, nodeId: string, isSuccess: boolean) => {
    const { data: session } = await authClient.getSession();
    if (!session?.user) return;

    const units = get().units;
    const unitIndex = units.findIndex(u => u.id === unitId);
    if (unitIndex === -1) return;

    const nodeIndex = units[unitIndex].nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return;

    const node = units[unitIndex].nodes[nodeIndex];

    const newHeat = Math.min(100, Math.max(0, node.heat + (isSuccess ? 25 : -10)));
    const newIsIgnited = newHeat >= 100;
    const newStatus = mapHeatToStatus(newHeat, newIsIgnited);
    const wasIgnited = node.heat >= 100 || node.status === 'ignition';
    
    if (wasIgnited && !newIsIgnited) {
      alert("⚠️ DECAY NOTIFICATION: This concept has dropped below Ignition level. Review it to restore full mastery!");
    }

    const updatedUnits = [...units];
    const updatedNodes = [...updatedUnits[unitIndex].nodes];
    const newTotalAttempts = node.totalAttempts + 1;
    const newCorrectAttempts = node.correctAttempts + (isSuccess ? 1 : 0);
    const newIntegrity = Math.round((newCorrectAttempts / newTotalAttempts) * 100);

    updatedNodes[nodeIndex] = {
      ...node,
      heat: newHeat,
      status: newStatus,
      totalAttempts: newTotalAttempts,
      correctAttempts: newCorrectAttempts,
      integrity: newIntegrity,
      lastAttempt: new Date()
    };
    
    updatedUnits[unitIndex] = {
      ...updatedUnits[unitIndex],
      nodes: updatedNodes,
      stability: calculateUnitStability(updatedNodes)
    };

    set({ units: updatedUnits });

    // Sync to authenticated backend API
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/thermal/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nodeId,
          newHeat,
          newIsIgnited,
          newTotalAttempts,
          newCorrectAttempts
        })
      });
      if (!res.ok) throw new Error("Failed to update stats via backend");
    } catch (err) {
      console.error("Failed to sync node stats to DB:", err);
    }
  },

  fetchNodeHistory: async (nodeId: string) => {
    const { data: session } = await authClient.getSession();
    if (!session?.user) return;

    set({ currentNodeHistory: null });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/thermal/history?nodeId=${nodeId}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Failed to fetch history via backend");
      
      const { history } = await res.json();
      if (history) {
        set({ currentNodeHistory: history });
      }
    } catch (err) {
      console.error("Failed to fetch node history:", err);
    }
  }
}));
