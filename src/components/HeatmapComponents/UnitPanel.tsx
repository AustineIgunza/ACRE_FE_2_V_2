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
    <div style={{ backgroundColor: 'var(--p-white)', border: '1px solid var(--p-border)', borderRadius: '12px', padding: '16px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--t-primary)' }}>📚 Units</h3>
      
      {/* Units List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {units.length === 0 ? (
          <p style={{ color: 'var(--t-secondary)', fontSize: '13px' }}>No units yet</p>
        ) : (
          units.map(unit => (
            <div
              key={unit.id}
              onClick={() => onSelectUnit(unit.id)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: currentUnitId === unit.id ? 'var(--snap-tint)' : 'var(--p-surface)',
                border: currentUnitId === unit.id ? '2px solid var(--snap)' : '1px solid var(--p-border)',
                boxShadow: currentUnitId === unit.id ? '0 0 12px var(--snap-tint)' : 'none'
              }}
            >
              <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--t-primary)' }}>{unit.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--t-secondary)' }}>{unit.nodes.length} nodes</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
