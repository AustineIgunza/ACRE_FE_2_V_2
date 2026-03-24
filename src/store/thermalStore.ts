import { create } from 'zustand';
import { Node, Unit, ThermalState, NodeStatus } from '@/types/thermal';

// Sample data for testing
const SAMPLE_DATA: ThermalState = {
  units: [
    {
      id: 'unit-microeconomics',
      name: 'Microeconomics 101',
      description: 'Study of supply, demand, and market equilibrium',
      createdAt: new Date('2026-03-01'),
      stability: 78,
      nodes: [
        {
          id: 'node-supply-demand',
          title: 'Law of Supply & Demand',
          topic: 'Market Forces',
          status: 'ignition',
          heat: 92,
          integrity: 88,
          createdAt: new Date('2026-03-01'),
          lastAttempt: new Date('2026-03-24T14:30:00'),
          correctAttempts: 8,
          totalAttempts: 9,
          thermalLeak: false
        },
        {
          id: 'node-elasticity',
          title: 'Price Elasticity',
          topic: 'Market Response',
          status: 'glow',
          heat: 65,
          integrity: 72,
          createdAt: new Date('2026-03-05'),
          lastAttempt: new Date('2026-03-20T10:15:00'),
          correctAttempts: 5,
          totalAttempts: 8,
          thermalLeak: false
        },
        {
          id: 'node-consumer-surplus',
          title: 'Consumer Surplus',
          topic: 'Market Efficiency',
          status: 'frost',
          heat: 38,
          integrity: 42,
          createdAt: new Date('2026-03-10'),
          lastAttempt: new Date('2026-03-22T16:45:00'),
          correctAttempts: 2,
          totalAttempts: 5,
          thermalLeak: true
        },
        {
          id: 'node-monopoly',
          title: 'Perfect Competition',
          topic: 'Market Structure',
          status: 'grey',
          heat: 0,
          integrity: 0,
          createdAt: new Date('2026-03-23'),
          correctAttempts: 0,
          totalAttempts: 0,
          thermalLeak: false
        }
      ]
    },
    {
      id: 'unit-calculus',
      name: 'Calculus II',
      description: 'Integration techniques and applications',
      createdAt: new Date('2026-03-02'),
      stability: 85,
      nodes: [
        {
          id: 'node-derivatives',
          title: 'Derivative Rules',
          topic: 'Differentiation',
          status: 'ignition',
          heat: 88,
          integrity: 92,
          createdAt: new Date('2026-03-02'),
          lastAttempt: new Date('2026-03-24T09:00:00'),
          correctAttempts: 10,
          totalAttempts: 11,
          thermalLeak: false
        },
        {
          id: 'node-integrals',
          title: 'Integration by Parts',
          topic: 'Integration',
          status: 'ignition',
          heat: 95,
          integrity: 90,
          createdAt: new Date('2026-03-03'),
          lastAttempt: new Date('2026-03-23T13:20:00'),
          correctAttempts: 9,
          totalAttempts: 10,
          thermalLeak: false
        },
        {
          id: 'node-limits',
          title: 'Limits & Continuity',
          topic: 'Foundations',
          status: 'glow',
          heat: 72,
          integrity: 78,
          createdAt: new Date('2026-03-04'),
          lastAttempt: new Date('2026-03-21T11:40:00'),
          correctAttempts: 6,
          totalAttempts: 8,
          thermalLeak: false
        }
      ]
    },
    {
      id: 'unit-shakespeare',
      name: 'Shakespeare & The Sonnets',
      description: 'Analysis of sonnets and dramatic works',
      createdAt: new Date('2026-03-06'),
      stability: 62,
      nodes: [
        {
          id: 'node-sonnet-18',
          title: 'Sonnet 18 Analysis',
          topic: 'Poetry',
          status: 'glow',
          heat: 58,
          integrity: 65,
          createdAt: new Date('2026-03-06'),
          lastAttempt: new Date('2026-03-19T15:30:00'),
          correctAttempts: 4,
          totalAttempts: 7,
          thermalLeak: false
        },
        {
          id: 'node-metaphor',
          title: 'Metaphor & Imagery',
          topic: 'Literary Devices',
          status: 'frost',
          heat: 45,
          integrity: 38,
          createdAt: new Date('2026-03-08'),
          lastAttempt: new Date('2026-03-23T10:00:00'),
          correctAttempts: 1,
          totalAttempts: 4,
          thermalLeak: true
        },
        {
          id: 'node-hamlet',
          title: 'Hamlet - Act III',
          topic: 'Drama',
          status: 'grey',
          heat: 0,
          integrity: 0,
          createdAt: new Date('2026-03-24'),
          correctAttempts: 0,
          totalAttempts: 0,
          thermalLeak: false
        }
      ]
    }
  ],
  currentUnitId: 'unit-microeconomics',
  currentNodeId: 'node-supply-demand',
  totalHeat: 0,
  overallIntegrity: 0
};

interface ThermalStore extends ThermalState {
  // Unit actions
  createUnit: (name: string, description: string) => void;
  deleteUnit: (unitId: string) => void;
  selectUnit: (unitId: string) => void;
  
  // Node actions
  createNode: (unitId: string, title: string, topic: string) => void;
  updateNodeStatus: (unitId: string, nodeId: string, status: Node['status']) => void;
  updateNodeHeat: (unitId: string, nodeId: string, heat: number) => void;
  updateNodeIntegrity: (unitId: string, nodeId: string, integrity: number) => void;
  recordNodeAttempt: (unitId: string, nodeId: string, success: boolean) => void;
  flagThermalLeak: (unitId: string, nodeId: string) => void;
  selectNode: (unitId: string, nodeId: string) => void;
  
  // Calculations
  calculateUnitStability: (unitId: string) => number;
  calculateOverallIntegrity: () => number;
  
  // Learning session integration
  saveSessionToNodes: (session: any) => void;
  
  // Mastery solidification
  solidifyMastery: (unitId: string) => void;
  
  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

export const useThermalStore = create<ThermalStore>((set, get) => ({
  units: [],
  currentUnitId: undefined,
  currentNodeId: undefined,
  totalHeat: 0,
  overallIntegrity: 0,

  // Unit actions
  createUnit: (name: string, description: string) => set((state) => ({
    units: [...state.units, {
      id: `unit-${Date.now()}`,
      name,
      description,
      nodes: [],
      createdAt: new Date(),
      stability: 0
    }]
  })),

  deleteUnit: (unitId: string) => set((state) => ({
    units: state.units.filter(u => u.id !== unitId)
  })),

  selectUnit: (unitId: string) => set({ currentUnitId: unitId }),

  // Node actions
  createNode: (unitId: string, title: string, topic: string) => set((state) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      title,
      topic,
      status: 'grey',
      heat: 0,
      integrity: 0,
      createdAt: new Date(),
      correctAttempts: 0,
      totalAttempts: 0
    };

    return {
      units: state.units.map(u =>
        u.id === unitId
          ? { ...u, nodes: [...u.nodes, newNode] }
          : u
      )
    };
  }),

  updateNodeStatus: (unitId: string, nodeId: string, status: Node['status']) =>
    set((state) => ({
      units: state.units.map(u =>
        u.id === unitId
          ? {
              ...u,
              nodes: u.nodes.map(n =>
                n.id === nodeId ? { ...n, status, lastAttempt: new Date() } : n
              )
            }
          : u
      )
    })),

  updateNodeHeat: (unitId: string, nodeId: string, heat: number) =>
    set((state) => ({
      units: state.units.map(u =>
        u.id === unitId
          ? {
              ...u,
              nodes: u.nodes.map(n =>
                n.id === nodeId ? { ...n, heat: Math.min(100, Math.max(0, heat)) } : n
              )
            }
          : u
      )
    })),

  updateNodeIntegrity: (unitId: string, nodeId: string, integrity: number) =>
    set((state) => ({
      units: state.units.map(u =>
        u.id === unitId
          ? {
              ...u,
              nodes: u.nodes.map(n =>
                n.id === nodeId ? { ...n, integrity: Math.min(100, Math.max(0, integrity)) } : n
              )
            }
          : u
      )
    })),

  recordNodeAttempt: (unitId: string, nodeId: string, success: boolean) =>
    set((state) => ({
      units: state.units.map(u =>
        u.id === unitId
          ? {
              ...u,
              nodes: u.nodes.map(n =>
                n.id === nodeId
                  ? {
                      ...n,
                      totalAttempts: n.totalAttempts + 1,
                      correctAttempts: success ? n.correctAttempts + 1 : n.correctAttempts,
                      status: success ? 'ignition' : 'frost'
                    }
                  : n
              )
            }
          : u
      )
    })),

  flagThermalLeak: (unitId: string, nodeId: string) =>
    set((state) => ({
      units: state.units.map(u =>
        u.id === unitId
          ? {
              ...u,
              nodes: u.nodes.map(n =>
                n.id === nodeId ? { ...n, thermalLeak: true, status: 'frost' } : n
              )
            }
          : u
      )
    })),

  selectNode: (unitId: string, nodeId: string) =>
    set({ currentUnitId: unitId, currentNodeId: nodeId }),

  // Calculations
  calculateUnitStability: (unitId: string) => {
    const state = get();
    const unit = state.units.find(u => u.id === unitId);
    if (!unit || unit.nodes.length === 0) return 0;
    
    const avgIntegrity = unit.nodes.reduce((sum, n) => sum + n.integrity, 0) / unit.nodes.length;
    return avgIntegrity;
  },

  calculateOverallIntegrity: () => {
    const state = get();
    if (state.units.length === 0) return 0;
    
    const allNodes = state.units.flatMap(u => u.nodes);
    if (allNodes.length === 0) return 0;
    
    return allNodes.reduce((sum, n) => sum + n.integrity, 0) / allNodes.length;
  },

  // Save learning session results to nodes
  saveSessionToNodes: (session: any) => {
    set((state) => {
      // Find or create a unit for this learning session
      const sourceTitle = session.sourceTitle || 'Learning Session';
      let unit = state.units.find(u => u.name === sourceTitle);
      
      if (!unit) {
        // Create new unit
        unit = {
          id: `unit-${Date.now()}`,
          name: sourceTitle,
          description: `Learning session from: ${sourceTitle}`,
          nodes: [],
          createdAt: new Date(),
          stability: 0
        };
      }

      // Convert mastery cards to nodes
      const newNodes = session.masteryCards.map((card: any) => {
        const existingNode = unit!.nodes.find(n => n.title === card.nodeId);
        
        if (existingNode) {
          // Update existing node
          const newCorrectAttempts = existingNode.correctAttempts + (session.globalHeat >= 70 ? 1 : 0);
          const newTotalAttempts = existingNode.totalAttempts + 1;
          const newHeat = Math.min(100, existingNode.heat + 25);
          const newIntegrity = session.globalHeat >= 70 
            ? Math.min(100, existingNode.integrity + 20) 
            : Math.max(0, existingNode.integrity - 10);
          
          return {
            ...existingNode,
            heat: newHeat,
            integrity: newIntegrity,
            correctAttempts: newCorrectAttempts,
            totalAttempts: newTotalAttempts,
            status: newHeat >= 80 ? 'ignition' : newHeat >= 50 ? 'glow' : newHeat >= 20 ? 'frost' : 'grey',
            lastAttempt: new Date()
          };
        } else {
          // Create new node
          const isSuccess = session.globalHeat >= 70;
          return {
            id: `node-${Date.now()}-${Math.random()}`,
            title: card.nodeId,
            topic: card.formalDefinition?.substring(0, 50) || 'Unknown Topic',
            status: isSuccess ? 'glow' : 'frost',
            heat: isSuccess ? 25 : 10,
            integrity: isSuccess ? 20 : 5,
            createdAt: new Date(),
            correctAttempts: isSuccess ? 1 : 0,
            totalAttempts: 1,
            lastAttempt: new Date(),
            thermalLeak: false
          };
        }
      });

      // Update or add unit with nodes
      const updatedUnits = state.units.map(u => u.id === unit!.id ? { ...unit!, nodes: newNodes } : u);
      if (!state.units.find(u => u.id === unit!.id)) {
        updatedUnits.push({ ...unit!, nodes: newNodes });
      }

      return { units: updatedUnits };
    });

    // Save to localStorage
    setTimeout(() => {
      get().saveToLocalStorage();
    }, 0);
  },

  // Solidify mastery - lock nodes to prevent decay
  solidifyMastery: (unitId: string) => {
    set((state) => ({
      units: state.units.map(u =>
        u.id === unitId
          ? {
              ...u,
              nodes: u.nodes.map(n =>
                n.status === 'ignition'
                  ? { ...n, status: 'ignition', thermalLeak: false }
                  : n
              )
            }
          : u
      )
    }));

    // Save to localStorage
    setTimeout(() => {
      get().saveToLocalStorage();
    }, 0);
  },

  // Persistence
  saveToLocalStorage: () => {
    const state = get();
    localStorage.setItem('thermalState', JSON.stringify(state));
  },

  loadFromLocalStorage: () => {
    const stored = localStorage.getItem('thermalState');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        // Reconstruct Date objects for all nodes
        if (parsed.units) {
          parsed.units = parsed.units.map((unit: any) => ({
            ...unit,
            createdAt: unit.createdAt ? new Date(unit.createdAt) : new Date(),
            nodes: unit.nodes.map((node: any) => ({
              ...node,
              createdAt: node.createdAt ? new Date(node.createdAt) : new Date(),
              lastAttempt: node.lastAttempt ? new Date(node.lastAttempt) : undefined
            }))
          }));
        }
        
        set(parsed);
      } catch (e) {
        console.error('Failed to load thermal state:', e);
        // Fall back to sample data on error
        set(SAMPLE_DATA);
      }
    } else {
      // No saved data - load sample data for testing
      set(SAMPLE_DATA);
    }
  }
}));
