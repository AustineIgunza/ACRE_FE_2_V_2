'use client';

import { useState, useEffect } from 'react';
import { useThermalStore } from '@/store/thermalStore';
import { StatusColors } from '@/types/thermal';
import UnitPanel from '@/components/HeatmapComponents/UnitPanel';
import TopicGridView from '@/components/HeatmapComponents/TopicGridView';
import IntegrityDashboard from '@/components/HeatmapComponents/IntegrityDashboard';
import NodeDetail from '@/components/HeatmapComponents/NodeDetail';

export default function ThermalHeatmap() {
  const {
    units,
    currentUnitId,
    currentNodeId,
    overallIntegrity,
    selectUnit,
    selectNode,
    loadFromLocalStorage,
    saveToLocalStorage
  } = useThermalStore();

  const [showNodeDetail, setShowNodeDetail] = useState(false);

  // Load on component mount
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Save whenever units change
  useEffect(() => {
    saveToLocalStorage();
  }, [units, saveToLocalStorage]);

  // Reload from localStorage when page becomes visible (returning from battle)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadFromLocalStorage();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadFromLocalStorage]);

  const currentUnit = units.find(u => u.id === currentUnitId);
  const currentNode = currentUnit?.nodes.find(n => n.id === currentNodeId);

  return (
    <div style={{ 
      backgroundColor: 'var(--p-surface)', 
      color: 'var(--t-mid)',
      padding: '24px',
      borderRadius: '12px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--t-primary)', marginBottom: '8px' }}>
              🗺️ Your Mastery Map
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--t-secondary)' }}>Track concepts through thermal states</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: 'var(--t-secondary)', marginBottom: '4px' }}>Overall Integrity</p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: overallIntegrity > 70 ? 'var(--success)' : overallIntegrity > 40 ? 'var(--xp)' : 'var(--error)' }}>
              {Math.round(overallIntegrity)}%
            </p>
          </div>
        </div>
        
        {/* Status Legend */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          {Object.entries(StatusColors).map(([status, colors]) => (
            <div key={status} style={{ 
              backgroundColor: 'var(--p-white)',
              border: '1px solid var(--p-border)',
              padding: '8px 12px', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--t-mid)'
            }}>
              <span>{colors.icon}</span>
              <span className="capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Left Panel: Units */}
        <div>
          <UnitPanel
            units={units}
            currentUnitId={currentUnitId}
            onSelectUnit={selectUnit}
          />
        </div>

        {/* Right Panel: Topic Grid + Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <IntegrityDashboard unit={currentUnit} />
          
          {/* Topic-based Grid View */}
          <div style={{
            backgroundColor: 'var(--p-white)',
            border: '1px solid var(--p-border)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <TopicGridView onNodeClick={(unitId, nodeId) => {
              selectNode(unitId, nodeId);
              setShowNodeDetail(true);
            }} />
          </div>
        </div>
      </div>

      {/* Node Detail Modal/Drawer */}
      {showNodeDetail && currentNode && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '360px',
          backgroundColor: 'var(--p-white)',
          borderLeft: '1px solid var(--p-border)',
          boxShadow: '-4px 0 12px rgba(0,0,0,0.1)',
          zIndex: 40,
          overflowY: 'auto',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <NodeDetail
            node={currentNode}
            unitId={currentUnitId || ''}
            onClose={() => setShowNodeDetail(false)}
          />
        </div>
      )}
    </div>
  );
}
