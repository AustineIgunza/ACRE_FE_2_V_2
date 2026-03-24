'use client';

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
  const {
    updateNodeHeat,
    updateNodeIntegrity,
    recordNodeAttempt,
    flagThermalLeak,
    updateNodeStatus
  } = useThermalStore();

  const colors = StatusColors[node.status];

  const handleSuccess = () => {
    recordNodeAttempt(unitId, node.id, true);
    updateNodeHeat(unitId, node.id, Math.min(100, node.heat + 20));
    updateNodeIntegrity(unitId, node.id, Math.min(100, node.integrity + 15));
  };

  const handleFailure = () => {
    recordNodeAttempt(unitId, node.id, false);
    updateNodeIntegrity(unitId, node.id, Math.max(0, node.integrity - 20));
    flagThermalLeak(unitId, node.id);
  };

  const handleThermalLeakFlag = () => {
    flagThermalLeak(unitId, node.id);
  };

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
                              node.status === 'frost' ? '#0ea5e9' :
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
        <button
          onClick={handleSuccess}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'var(--success)',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
          ✓ Mark Success
        </button>
        <button
          onClick={handleFailure}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'var(--error)',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
          ✕ Mark Failure
        </button>
        <button
          onClick={handleThermalLeakFlag}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'var(--xp)',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
          🚨 Flag Thermal Leak
        </button>
      </div>
    </div>
  );
}
