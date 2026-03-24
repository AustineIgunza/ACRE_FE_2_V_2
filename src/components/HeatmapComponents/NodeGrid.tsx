'use client';

import { useState } from 'react';
import { Node } from '@/types/thermal';
import { useThermalStore } from '@/store/thermalStore';
import { StatusColors } from '@/types/thermal';

interface NodeGridProps {
  nodes: Node[];
  currentNodeId?: string;
  onSelectNode: (nodeId: string) => void;
}

export default function NodeGrid({ nodes, currentNodeId, onSelectNode }: NodeGridProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeTopic, setNewNodeTopic] = useState('');
  const { currentUnitId, createNode } = useThermalStore();

  const handleCreateNode = () => {
    if (newNodeTitle.trim() && currentUnitId) {
      createNode(currentUnitId, newNodeTitle, newNodeTopic);
      setNewNodeTitle('');
      setNewNodeTopic('');
      setIsCreating(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--p-white)', border: '1px solid var(--p-border)', borderRadius: '12px', padding: '16px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--t-primary)' }}>🔥 Nodes</h3>

      {/* Nodes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        {nodes.map(node => {
          const colors = StatusColors[node.status];
          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: currentNodeId === node.id ? 'var(--p-surface)' : 'var(--p-white)',
                border: currentNodeId === node.id ? '2px solid var(--snap)' : '1px solid var(--p-border)',
                boxShadow: currentNodeId === node.id ? '0 0 12px var(--snap-tint)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--t-primary)' }}>{node.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--t-secondary)', marginTop: '4px' }}>{node.topic}</p>
                </div>
                <span style={{ fontSize: '18px' }}>{colors.icon}</span>
              </div>

              {/* Progress Bars */}
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--t-secondary)' }}>Heat</span>
                  <span style={{ fontWeight: 600, color: 'var(--t-primary)' }}>{Math.round(node.heat)}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--p-surface)', borderRadius: '3px', overflow: 'hidden' }}>
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

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--t-secondary)' }}>Integrity</span>
                  <span style={{ fontWeight: 600, color: 'var(--t-primary)' }}>{Math.round(node.integrity)}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--p-surface)', borderRadius: '3px', overflow: 'hidden' }}>
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

              {/* Thermal Leak Indicator */}
              {node.thermalLeak && (
                <div style={{ marginTop: '8px', padding: '6px 8px', backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: '6px', fontSize: '12px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>⚠️</span>
                  <span>Thermal Leak</span>
                </div>
              )}

              {/* Stats */}
              <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'var(--t-secondary)' }}>
                <div>Attempts: {node.totalAttempts}</div>
                <div>Success: {node.correctAttempts}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Node Form */}
      {isCreating ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', backgroundColor: 'var(--p-surface)', borderRadius: '8px' }}>
          <input
            type="text"
            placeholder="Node title"
            value={newNodeTitle}
            onChange={(e) => setNewNodeTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'var(--p-white)',
              border: '1px solid var(--p-border)',
              borderRadius: '6px',
              color: 'var(--t-primary)',
              fontSize: '13px'
            }}
          />
          <input
            type="text"
            placeholder="Topic/Concept"
            value={newNodeTopic}
            onChange={(e) => setNewNodeTopic(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'var(--p-white)',
              border: '1px solid var(--p-border)',
              borderRadius: '6px',
              color: 'var(--t-primary)',
              fontSize: '13px'
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCreateNode}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: 'var(--snap)',
                color: 'white',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--snap-hover)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--snap)')}
            >
              Create
            </button>
            <button
              onClick={() => setIsCreating(false)}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: 'var(--p-surface)',
                color: 'var(--t-primary)',
                borderRadius: '6px',
                fontSize: '13px',
                border: '1px solid var(--p-border)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--p-border)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--p-surface)')}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          style={{
            width: '100%',
            padding: '10px',
            background: 'linear-gradient(to right, var(--snap), var(--xp))',
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
          + New Node
        </button>
      )}
    </div>
  );
}
