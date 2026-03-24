export interface Node {
  id: string;
  title: string;
  topic: string;
  status: 'grey' | 'frost' | 'glow' | 'ignition'; // grey=new, frost=frozen, glow=decay warning, ignition=mastered
  heat: number; // 0-100
  integrity: number; // 0-100
  createdAt: Date;
  lastAttempt?: Date;
  correctAttempts: number;
  totalAttempts: number;
  thermalLeak?: boolean; // latency > 5s
  locked?: boolean; // locked nodes don't decay
}

export interface Unit {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  createdAt: Date;
  stability: number; // 0-100, average of all nodes
}

export interface ThermalState {
  units: Unit[];
  currentUnitId?: string;
  currentNodeId?: string;
  totalHeat: number;
  overallIntegrity: number;
}

export const NodeStatus = {
  GREY: 'grey',      // New node
  FROST: 'frost',    // Failed/Decay
  GLOW: 'glow',      // Decay warning
  IGNITION: 'ignition' // Mastered
} as const;

export const StatusColors = {
  grey: {
    bg: 'bg-slate-200',
    text: 'text-slate-600',
    glow: 'shadow-slate-300/20',
    icon: '◯'
  },
  frost: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    glow: 'shadow-blue-300/40 animate-pulse',
    icon: '❄️'
  },
  glow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    glow: 'shadow-yellow-400/40 animate-pulse',
    icon: '🕯️'
  },
  ignition: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    glow: 'shadow-red-400/50',
    icon: '🔥'
  }
} as const;
