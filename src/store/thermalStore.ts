import { create } from 'zustand';
import { Node, Unit, ThermalState, NodeStatus } from '@/types/thermal';
import { supabase } from '@/lib/supabaseClient';

interface ThermalStore extends ThermalState {
  // Navigation
  selectUnit: (unitId: string) => void;
  selectNode: (unitId: string, nodeId: string) => void;
  
  // Backend Integration
  fetchThermalLibrary: () => Promise<void>;
  updateNodeStats: (unitId: string, nodeId: string, isSuccess: boolean) => Promise<void>;
  fetchNodeHistory: (nodeId: string) => Promise<void>;
}

function mapHeatToStatus(heat: number, isIgnited: boolean): 'grey' | 'frost' | 'glow' | 'ignition' {
  if (heat >= 100) return 'ignition';
  if (heat >= 60) return 'glow';
  if (heat >= 25) return 'frost';
  return 'grey';
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
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    const { data, error } = await supabase
      .from('user_units')
      .select('id, title, description, created_at, user_nodes(node_id, title, topic, heat_score, is_ignited, total_attempts, correct_attempts, last_attempt)');

    if (error) {
      if (error.code === '42501') {
        console.warn("PostgreSQL 42501 (Permission Denied): user_units access blocked. This usually means table permissions are missing or the user has no allowed rows yet.", error.message);
      } else {
        console.error('Failed to fetch thermal library:', error.message, "Code:", error.code);
      }
      return;
    }

    if (data) {
      const parsedUnits: Unit[] = data.map((unit: any) => {
        const parsedNodes: Node[] = (unit.user_nodes || []).map((n: any) => ({
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
          thermalLeak: false
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
  },

  updateNodeStats: async (unitId: string, nodeId: string, isSuccess: boolean) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    const units = get().units;
    const unitIndex = units.findIndex(u => u.id === unitId);
    if (unitIndex === -1) return;

    const nodeIndex = units[unitIndex].nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return;

    const node = units[unitIndex].nodes[nodeIndex];

    // Compute new values
    const newHeat = Math.min(100, Math.max(0, node.heat + (isSuccess ? 25 : -10)));
    const newIsIgnited = newHeat >= 100;
    const newStatus = mapHeatToStatus(newHeat, newIsIgnited);
    const wasIgnited = node.heat >= 100 || node.status === 'ignition';
    
    // Decay Notification Check
    if (wasIgnited && !newIsIgnited) {
      alert("⚠️ DECAY NOTIFICATION: This concept has dropped below Ignition level. Review it to restore full mastery!");
    }

    // Optimistically update local state
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

    // Sync to Supabase
    const { error } = await supabase.from('user_nodes').update({
      heat_score: newHeat,
      is_ignited: newIsIgnited,
      total_attempts: newTotalAttempts,
      correct_attempts: newCorrectAttempts,
      last_attempt: new Date().toISOString()
    }).eq('user_id', session.session.user.id).eq('node_id', nodeId);

    if (error) {
      console.error("Failed to sync node stats to DB:", error);
      // Fallback is currently ignored - next fetch overrides it properly.
    }
  },

  fetchNodeHistory: async (nodeId: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    // Reset history while loading new data
    set({ currentNodeHistory: null });

    const { data, error } = await supabase
      .from('user_responses')
      .select('id, node_id, scenario_text, action_choice, defense_text, academic_defense, ideal_action, thermal_result, feedback, created_at')
      .eq('user_id', session.session.user.id)
      .eq('node_id', nodeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // Ignore "No rows found"
        console.error("Failed to fetch node history:", error);
      }
      return;
    }

    if (data) {
      set({ currentNodeHistory: data });
    }
  }
}));
