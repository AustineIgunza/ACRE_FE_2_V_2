export interface Node {
  id: string;
  title: string;
  topic: string;
  status: 'neutral' | 'frost' | 'warning' | 'ignition'; // neutral=new, frost=frozen, warning=decay warning, ignition=mastered
  heat: number; // 0-100
  integrity: number; // 0-100
  createdAt: Date;
  lastAttempt?: Date;
  correctAttempts: number;
  totalAttempts: number;
  thermalLeak?: boolean; // latency > 5s
  locked?: boolean; // locked nodes don't decay
  intel_card?: {
    crisis_context: string;
    formal_mechanism: string;
    chain_analysis: string;
    so_what: string;
    accuracy: string;
  } | null;
}

export interface Unit {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  createdAt: Date;
  stability: number; // 0-100, average of all nodes
}

export interface CombatLog {
  id: string;
  node_id: string;
  scenario_text: string;
  action_choice: string;
  defense_text: string | null;
  academic_defense: string | null;
  ideal_action: string;
  thermal_result: string;
  feedback: string;
  created_at: string;
}

export interface ThermalState {
  units: Unit[];
  currentUnitId?: string;
  currentNodeId?: string;
  totalHeat: number;
  overallIntegrity: number;
  currentNodeHistory: CombatLog[] | null;
}

export const NodeStatus = {
  NEUTRAL: 'neutral',  // New node
  FROST: 'frost',    // Failed/Decay
  WARNING: 'warning',      // Decay warning
  IGNITION: 'ignition' // Mastered
} as const;

export const StatusColors = {
  neutral: {
    bg: 'rgba(139, 92, 246, 0.1)',
    text: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.2)',
    icon: '◯'
  },
  frost: {
    bg: 'rgba(59, 130, 246, 0.1)',
    text: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    icon: '❄️'
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.1)',
    text: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    icon: '⚠️'
  },
  ignition: {
    bg: 'rgba(255, 92, 53, 0.1)',
    text: '#ff5c35',
    glow: 'rgba(255, 92, 53, 0.5)',
    icon: '🔥'
  }
} as const;
