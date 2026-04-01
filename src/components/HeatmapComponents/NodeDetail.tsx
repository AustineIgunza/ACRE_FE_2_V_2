'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Node, CombatLog } from '@/types/thermal';
import { useThermalStore } from '@/store/thermalStore';
import { useCombatStore } from '@/store/combatStore';
import { StatusColors } from '@/types/thermal';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface NodeDetailProps {
  node: Node;
  unitId: string;
  onClose: () => void;
}

export default function NodeDetail({ node, unitId, onClose }: NodeDetailProps) {
  const router = useRouter();
  const { setNodeContext } = useCombatStore();
  const { fetchNodeHistory, currentNodeHistory } = useThermalStore();
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (node.id) {
      fetchNodeHistory(node.id);
    }
  }, [node.id, fetchNodeHistory]);

  const colors = StatusColors[node.status];
  const intel = node.intel_card;

  const handleTakeQuiz = () => {
    setNodeContext({
      nodeId: node.id,
      nodeTitle: node.title,
      nodeTopic: node.topic,
      unitId,
    });
    router.push('/battle');
  };

  return (
    <div style={{ 
      backgroundColor: '#0f0f12', 
      borderLeft: '1px solid rgba(255,255,255,0.08)', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      color: '#f0f2ec'
    }}>
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '2px' }}>Intel Card</span>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0 0', color: '#fff', fontFamily: 'Georgia, serif' }}>{node.title}</h3>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {!showHistory ? (
          /* Intel Card Mode */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Thermal State Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: colors.bg, borderRadius: '20px' }}>
                <span style={{ fontSize: '16px' }}>{colors.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: colors.text }}>{node.status}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '1px' }}>THERMAL INTEGRITY</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{Math.round(node.heat)}%</div>
              </div>
            </div>

            {intel ? (
              <>
                {/* LaTeX Mechanism */}
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '120px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: '12px', left: '16px', fontSize: '9px', fontWeight: 800, color: '#3b82f6', letterSpacing: '2px' }}>FORMAL_MECHANISM</div>
                  <div style={{ fontSize: '1.2em', color: '#fff' }}>
                    <BlockMath math={intel.formal_mechanism} />
                  </div>
                </div>

                {/* The "So What" */}
                <div>
                  <h4 style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#f59e0b' }}>◈</span> THE SO WHAT
                  </h4>
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: 'rgba(245, 158, 11, 0.06)', 
                    borderLeft: '2px solid #f59e0b',
                  }}>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#f0f2ec', fontStyle: 'italic', fontWeight: 500, fontFamily: 'Georgia, serif', margin: 0 }}>
                      &quot;{intel.so_what}&quot;
                    </p>
                  </div>
                </div>

                {/* Crisis Context */}
                <div>
                  <h4 style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '2px' }}>CRISIS CONTEXT</h4>
                  <div style={{ fontSize: '13px', lineHeight: 1.6, padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                    {intel.crisis_context}
                  </div>
                </div>

                {/* Keywords/Topics */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '6px' }}>{node.topic}</div>
                  <div style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', borderRadius: '6px' }}>Invariant Node</div>
                </div>
              </>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>This node was extracted under a legacy engine version. Re-ignite this topic to generate an Intel Card.</p>
              </div>
            )}
          </div>
        ) : (
          /* History / Domino Log Mode */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px' }}>Reasoning History</h4>
            {currentNodeHistory && currentNodeHistory.length > 0 ? (
              currentNodeHistory.map((log: CombatLog) => (
                <div key={log.id} style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', position: 'relative', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: log.thermal_result === 'IGNITION' ? '#ff5c35' : '#f59e0b' }}>
                      {log.thermal_result}
                    </span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                     <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px', letterSpacing: '1px' }}>CHAIN RESPONSE</div>
                     <p style={{ fontSize: '12px', lineHeight: 1.5, color: 'rgba(255,255,255,0.7)' }}>{log.defense_text}</p>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'rgba(255, 92, 53, 0.06)', borderRadius: '8px', borderLeft: '3px solid #ff5c35' }}>
                     <div style={{ fontSize: '10px', color: '#ff5c35', fontWeight: 700, marginBottom: '2px', letterSpacing: '1px' }}>NEURAL EVALUATION</div>
                     <p style={{ fontSize: '12px', lineHeight: 1.5, color: 'rgba(255,255,255,0.7)' }}>{log.academic_defense}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>No behavioral logs found for this node.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
        <button
          onClick={handleTakeQuiz}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #ff5c35 100%)',
            color: 'white',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 92, 53, 0.3)'
          }}
        >
          {node.heat < 100 ? '◈ Re-Ignite Node' : '◈ Stress Test Mechanism'}
        </button>

        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          {showHistory ? 'View Intel Card' : 'View Reasoning Logs'}
        </button>
      </div>
    </div>
  );
}
