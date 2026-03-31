'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Node, CombatLog } from '@/types/thermal';
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
      backgroundColor: 'var(--p-white)', 
      borderLeft: '1px solid var(--p-border)', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--t-primary)'
    }}>
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--p-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--t-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>Intel Card</span>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0 0' }}>{node.title}</h3>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--t-secondary)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {!showHistory ? (
          /* Intel Card Mode */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Thermal State Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'var(--p-surface)', borderRadius: '20px' }}>
                <span style={{ fontSize: '16px' }}>{colors.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>{node.status}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: 'var(--t-muted)', fontWeight: 700 }}>THERMAL INTEGRITY</div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{Math.round(node.heat)}%</div>
              </div>
            </div>

            {intel ? (
              <>
                {/* LaTeX Mechanism */}
                <div style={{ 
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--p-border)',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '120px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: '12px', left: '16px', fontSize: '9px', fontWeight: 800, color: 'var(--info)', opacity: 0.6 }}>FORMAL_MECHANISM</div>
                  <div style={{ fontSize: '1.2em' }}>
                    <BlockMath math={intel.formal_mechanism} />
                  </div>
                </div>

                {/* The "So What" */}
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--t-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--xp)' }}>◈</span> THE SO WHAT
                  </h4>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--t-deep)', fontStyle: 'italic', fontWeight: 500 }}>
                    "{intel.so_what}"
                  </p>
                </div>

                {/* Crisis Context */}
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--t-muted)', marginBottom: '8px' }}>CRISIS CONTEXT</h4>
                  <div style={{ fontSize: '13px', lineHeight: 1.6, padding: '16px', backgroundColor: 'var(--p-surface)', borderRadius: '12px', border: '1px solid var(--p-border)' }}>
                    {intel.crisis_context}
                  </div>
                </div>

                {/* Keywords/Topics */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(14, 165, 233, 0.1)', color: 'var(--info)', borderRadius: '6px' }}>{node.topic}</div>
                  <div style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, backgroundColor: 'var(--p-surface)', color: 'var(--t-secondary)', borderRadius: '6px' }}>Invariant Node</div>
                </div>
              </>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'var(--p-surface)', borderRadius: '16px', border: '1px dashed var(--p-border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--t-muted)' }}>This node was extracted under a legacy engine version. Re-ignite this topic to generate an Intel Card.</p>
              </div>
            )}
          </div>
        ) : (
          /* History / Domino Log Mode */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--t-muted)', textTransform: 'uppercase' }}>Reasoning History</h4>
            {currentNodeHistory && currentNodeHistory.length > 0 ? (
              currentNodeHistory.map((log: CombatLog) => (
                <div key={log.id} style={{ padding: '16px', border: '1px solid var(--p-border)', borderRadius: '12px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: log.thermal_result === 'IGNITION' ? 'var(--success)' : 'var(--xp)' }}>
                      {log.thermal_result}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--t-muted)' }}>
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                     <div style={{ fontSize: '10px', color: 'var(--t-muted)', marginBottom: '4px' }}>CHAIN RESPONSED</div>
                     <p style={{ fontSize: '12px', lineHeight: 1.5 }}>{log.defense_text}</p>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--p-surface)', borderRadius: '8px', borderLeft: '3px solid var(--snap)' }}>
                     <div style={{ fontSize: '10px', color: 'var(--snap)', fontWeight: 700, marginBottom: '2px' }}>NEURAL EVALUATION</div>
                     <p style={{ fontSize: '12px', lineHeight: 1.5 }}>{log.academic_defense}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--t-muted)' }}>No behavioral logs found for this node.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div style={{ padding: '24px', borderTop: '1px solid var(--p-border)', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--p-surface)' }}>
        <button
          onClick={handleTakeQuiz}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, var(--info) 0%, var(--snap) 100%)',
            color: 'white',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
          }}
        >
          {node.heat < 100 ? '◈ Re-Ignite Node' : '◈ Stress Test Mechanism'}
        </button>

        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'var(--p-white)',
            border: '1px solid var(--p-border)',
            color: 'var(--t-primary)',
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
