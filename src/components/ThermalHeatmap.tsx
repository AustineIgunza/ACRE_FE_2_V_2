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
    selectNode
  } = useThermalStore();

  const [showNodeDetail, setShowNodeDetail] = useState(false);

  const currentUnit = units.find(u => u.id === currentUnitId);
  const currentNode = currentUnit?.nodes.find(n => n.id === currentNodeId);

  return (
    <div style={{ 
      backgroundColor: 'transparent', 
      color: '#f0f2ec',
      padding: '24px',
      borderRadius: '12px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              🗺️ Your Mastery Map
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Track concepts through thermal states</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Overall Integrity</p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: overallIntegrity > 70 ? '#10b981' : overallIntegrity > 40 ? '#f59e0b' : '#ef4444' }}>
              {Math.round(overallIntegrity)}%
            </p>
          </div>
        </div>
        
        {/* Status Legend */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          {Object.entries(StatusColors).map(([status, colors]) => (
            <div key={status} style={{ 
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: `1px solid ${colors.bg.replace('0.1', '0.2')}`, // use the status color's bg variable, slightly more opaque
              padding: '8px 12px', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: colors.text
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
          
          {/* Topic-based Accordion View */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
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
          width: '380px',
          backgroundColor: '#0f0f12',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-8px 0 24px rgba(0,0,0,0.5)',
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
