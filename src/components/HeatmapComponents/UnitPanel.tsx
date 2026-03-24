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
  const [isCreating, setIsCreating] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitDesc, setNewUnitDesc] = useState('');
  const { createUnit, deleteUnit } = useThermalStore();

  const handleCreateUnit = () => {
    if (newUnitName.trim()) {
      createUnit(newUnitName, newUnitDesc);
      setNewUnitName('');
      setNewUnitDesc('');
      setIsCreating(false);
    }
  };

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

      {/* Create Unit Form */}
      {isCreating ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', backgroundColor: 'var(--p-surface)', borderRadius: '8px' }}>
          <input
            type="text"
            placeholder="Unit name"
            value={newUnitName}
            onChange={(e) => setNewUnitName(e.target.value)}
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
          <textarea
            placeholder="Description (optional)"
            value={newUnitDesc}
            onChange={(e) => setNewUnitDesc(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'var(--p-white)',
              border: '1px solid var(--p-border)',
              borderRadius: '6px',
              color: 'var(--t-primary)',
              fontSize: '13px',
              resize: 'none',
              height: '80px'
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCreateUnit}
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
          + New Unit
        </button>
      )}
    </div>
  );
}
