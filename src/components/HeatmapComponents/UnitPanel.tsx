'use client';

import { useState } from 'react';
import { Unit } from '@/types/thermal';
import { useThermalStore } from '@/store/thermalStore';

interface UnitPanelProps {
  units: Unit[];
  currentUnitId?: string;
  onSelectUnit: (unitId: string) => void;
}

export default function UnitPanel({ units, currentUnitId, onSelectUnit }: UnitPanelProps) {
  // No manual unit creation in the new system; handled via backend submission

  return (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
      <h3 style={{ fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '24px', color: 'rgba(255,255,255,0.5)' }}>📚 Units</h3>
      
      {/* Units List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {units.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>No units yet</p>
        ) : (
          units.map(unit => (
            <div
              key={unit.id}
              onClick={() => onSelectUnit(unit.id)}
              style={{
                padding: '16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: currentUnitId === unit.id ? 'rgba(255, 92, 53, 0.1)' : 'transparent',
                border: currentUnitId === unit.id ? '1px solid #ff5c35' : '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                if (currentUnitId !== unit.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                if (currentUnitId !== unit.id) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <p style={{ fontWeight: 600, fontSize: '14px', color: currentUnitId === unit.id ? '#ff5c35' : '#fff' }}>{unit.name}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{unit.nodes.length} NODES</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
