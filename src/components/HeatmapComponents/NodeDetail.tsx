'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { Node } from '@/types/thermal';
import { useThermalStore } from '@/store/thermalStore';
import { useCombatStore } from '@/store/combatStore';
import { StatusColors } from '@/types/thermal';

interface NodeDetailProps {
  node: Node;
  unitId: string;
  onClose: () => void;
}

export default function NodeDetail({ node, unitId, onClose }: NodeDetailProps) {
  const router = useRouter();
  const { setNodeContext } = useCombatStore();
  const { fetchNodeHistory, currentNodeHistory } = useThermalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (node.id) {
      fetchNodeHistory(node.id);
    }
  }, [node.id, fetchNodeHistory]);

  const colors = StatusColors[node.status];

  const handleTakeQuiz = () => {
    // Store the node context in combat store
    setNodeContext({
      nodeId: node.id,
      nodeTitle: node.title,
      nodeTopic: node.topic,
      unitId,
    });
    // Navigate to battle page
    router.push('/battle');
  };

  return (
    <div style={{ backgroundColor: 'var(--p-white)', border: '1px solid var(--p-border)', borderRadius: '12px', padding: '16px', position: 'sticky', top: '20px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, flex: 1, color: 'var(--t-primary)' }}>{node.title}</h3>
        <button
          onClick={onClose}
          style={{
            marginLeft: '8px',
            fontSize: '16px',
            fontWeight: 600,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--t-secondary)',
            padding: '4px 8px'
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--t-primary)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--t-secondary)')}
        >
          ✕
        </button>
      </div>

      {/* Status Badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '6px 12px', backgroundColor: 'var(--p-surface)', borderRadius: '20px' }}>
        <span style={{ fontSize: '16px' }}>{colors.icon}</span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t-primary)', textTransform: 'capitalize' }}>{node.status}</span>
      </div>

      {/* Topic */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{ fontSize: '11px', color: 'var(--t-secondary)', marginBottom: '4px' }}>Topic</p>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t-primary)' }}>{node.topic}</p>
      </div>

      {/* Heat Meter */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t-secondary)' }}>Heat</p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t-primary)' }}>{Math.round(node.heat)}%</p>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--p-surface)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              transition: 'all 0.2s',
              backgroundColor: node.status === 'ignition' ? 'var(--snap)' :
                              node.status === 'glow' ? 'var(--xp)' :
                              node.status === 'frost' ? 'var(--info)' :
                              'var(--p-border)',
              width: `${node.heat}%`
            }}
          />
        </div>
      </div>

      {/* Integrity Meter */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t-secondary)' }}>Integrity</p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t-primary)' }}>{Math.round(node.integrity)}%</p>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--p-surface)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              backgroundColor: 'var(--success)',
              transition: 'all 0.2s',
              width: `${node.integrity}%`
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', padding: '12px', backgroundColor: 'var(--p-surface)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: 'var(--t-secondary)' }}>Total Attempts</span>
          <span style={{ fontWeight: 700, color: 'var(--t-primary)' }}>{node.totalAttempts}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: 'var(--t-secondary)' }}>Correct</span>
          <span style={{ fontWeight: 700, color: 'var(--t-primary)' }}>{node.correctAttempts}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: 'var(--t-secondary)' }}>Success Rate</span>
          <span style={{ fontWeight: 700, color: 'var(--t-primary)' }}>
            {node.totalAttempts > 0
              ? `${Math.round((node.correctAttempts / node.totalAttempts) * 100)}%`
              : '-'}
          </span>
        </div>
        {node.lastAttempt && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--t-secondary)' }}>Last Attempt</span>
            <span style={{ fontWeight: 700, color: 'var(--t-primary)' }}>
              {new Date(node.lastAttempt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Thermal Leak Warning */}
      {node.thermalLeak && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <span>⚠️</span>
            <span>Thermal Leak Detected: Latency &gt; 5s</span>
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={handleTakeQuiz}
          style={{
            width: '100%',
            padding: '10px',
            background: 'linear-gradient(135deg, var(--snap) 0%, var(--xp) 100%)',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(255, 92, 53, 0.2)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 92, 53, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 92, 53, 0.2)';
          }}
        >
          🎯 Take Quiz
        </button>

        {currentNodeHistory && (
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'var(--p-surface)',
              border: '1px solid var(--p-border)',
              color: 'var(--t-primary)',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.1)';
              e.currentTarget.style.borderColor = 'var(--info)';
              e.currentTarget.style.color = 'var(--info)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--p-surface)';
              e.currentTarget.style.borderColor = 'var(--p-border)';
              e.currentTarget.style.color = 'var(--t-primary)';
            }}
          >
            📜 View Combat Log
          </button>
        )}
      </div>

      {/* Combat Log Modal */}
      {isModalOpen && currentNodeHistory && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: 'var(--p-white)',
            border: '1px solid var(--p-border)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--p-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--t-primary)' }}>
                  Combat Log
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--t-muted)' }}>
                  {new Date(currentNodeHistory.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--t-secondary)',
                  fontSize: '20px', cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Scenario Context */}
              <div>
                <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--info)', fontWeight: 700, marginBottom: '8px' }}>Scenario Encountered</h4>
                <div style={{ backgroundColor: 'var(--p-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--p-border)' }}>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--t-deep)' }}>{currentNodeHistory.scenario_text}</p>
                </div>
              </div>

              {/* Action Choices */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
                <div style={{ backgroundColor: 'rgba(255, 59, 48, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 59, 48, 0.2)' }}>
                   <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--error)', fontWeight: 700, marginBottom: '8px' }}>Your Action</h4>
                   <p style={{ fontSize: '13px', color: 'var(--t-deep)', fontWeight: 600 }}>{currentNodeHistory.action_choice}</p>
                </div>
                <div style={{ backgroundColor: 'rgba(52, 199, 89, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
                   <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--success)', fontWeight: 700, marginBottom: '8px' }}>Ideal Action</h4>
                   <p style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>{currentNodeHistory.ideal_action}</p>
                </div>
              </div>

              {/* Defenses */}
              {currentNodeHistory.defense_text && (
                <div>
                  <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--warning)', fontWeight: 700, marginBottom: '8px' }}>Combat Defense (Logic)</h4>
                  <div style={{ backgroundColor: 'rgba(255, 149, 0, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 149, 0, 0.2)' }}>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--t-deep)' }}>{currentNodeHistory.defense_text}</p>
                  </div>
                </div>
              )}

              {currentNodeHistory.academic_defense && (
                <div>
                  <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--snap)', fontWeight: 700, marginBottom: '8px' }}>Academic Defense</h4>
                  <div style={{ backgroundColor: 'rgba(255, 45, 85, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 45, 85, 0.2)' }}>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--t-deep)' }}>{currentNodeHistory.academic_defense}</p>
                  </div>
                </div>
              )}

              {/* AI Feedback */}
              {currentNodeHistory.feedback && (
                <div>
                  <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--xp)', fontWeight: 700, marginBottom: '8px' }}>Post-Action Analysis</h4>
                  <div style={{ backgroundColor: 'var(--p-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--p-border)' }}>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--t-deep)', whiteSpace: 'pre-wrap' }}>{currentNodeHistory.feedback}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
