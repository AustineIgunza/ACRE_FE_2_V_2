'use client';

import { Unit } from '@/types/thermal';

interface IntegrityDashboardProps {
  unit?: Unit;
}

export default function IntegrityDashboard({ unit }: IntegrityDashboardProps) {
  if (!unit) {
    return (
      <div style={{ backgroundColor: 'var(--p-white)', border: '1px solid var(--p-border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--t-secondary)', fontSize: '14px' }}>Select a unit to view details</p>
      </div>
    );
  }

  const avgIntegrity = unit.nodes.length > 0
    ? unit.nodes.reduce((sum, n) => sum + n.integrity, 0) / unit.nodes.length
    : 0;

  const avgHeat = unit.nodes.length > 0
    ? unit.nodes.reduce((sum, n) => sum + n.heat, 0) / unit.nodes.length
    : 0;

  const statusCounts = {
    grey: unit.nodes.filter(n => n.status === 'grey').length,
    frost: unit.nodes.filter(n => n.status === 'frost').length,
    glow: unit.nodes.filter(n => n.status === 'glow').length,
    ignition: unit.nodes.filter(n => n.status === 'ignition').length,
  };

  const successRate = unit.nodes.length > 0
    ? unit.nodes.reduce((sum, n) => sum + (n.totalAttempts > 0 ? n.correctAttempts / n.totalAttempts : 0), 0) / unit.nodes.length * 100
    : 0;

  return (
    <div style={{ backgroundColor: 'var(--p-white)', border: '1px solid var(--p-border)', borderRadius: '12px', padding: '16px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--t-primary)' }}>{unit.name}</h3>
      <p style={{ fontSize: '13px', color: 'var(--t-secondary)', marginBottom: '12px' }}>{unit.description}</p>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        <div style={{ backgroundColor: 'var(--p-surface)', borderRadius: '8px', padding: '12px' }}>
          <p style={{ fontSize: '12px', color: 'var(--t-secondary)', marginBottom: '4px' }}>Integrity</p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>{Math.round(avgIntegrity)}%</p>
        </div>
        <div style={{ backgroundColor: 'var(--p-surface)', borderRadius: '8px', padding: '12px' }}>
          <p style={{ fontSize: '12px', color: 'var(--t-secondary)', marginBottom: '4px' }}>Heat</p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--snap)' }}>{Math.round(avgHeat)}%</p>
        </div>
        <div style={{ backgroundColor: 'var(--p-surface)', borderRadius: '8px', padding: '12px' }}>
          <p style={{ fontSize: '12px', color: 'var(--t-secondary)', marginBottom: '4px' }}>Success Rate</p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--xp)' }}>{Math.round(successRate)}%</p>
        </div>
        <div style={{ backgroundColor: 'var(--p-surface)', borderRadius: '8px', padding: '12px' }}>
          <p style={{ fontSize: '12px', color: 'var(--t-secondary)', marginBottom: '4px' }}>Total Nodes</p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--t-primary)' }}>{unit.nodes.length}</p>
        </div>
      </div>

      {/* Status Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px', marginTop: '12px' }}>
        <div style={{ backgroundColor: 'var(--p-surface)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '20px', marginBottom: '4px' }}>◯</p>
          <p style={{ fontSize: '11px', color: 'var(--t-secondary)' }}>New</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--t-primary)' }}>{statusCounts.grey}</p>
        </div>
        <div style={{ backgroundColor: 'var(--p-surface)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '20px', marginBottom: '4px' }}>❄️</p>
          <p style={{ fontSize: '11px', color: 'var(--t-secondary)' }}>Frozen</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--info)' }}>{statusCounts.frost}</p>
        </div>
        <div style={{ backgroundColor: 'var(--p-surface)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '20px', marginBottom: '4px' }}>🕯️</p>
          <p style={{ fontSize: '11px', color: 'var(--t-secondary)' }}>Glowing</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--xp)' }}>{statusCounts.glow}</p>
        </div>
        <div style={{ backgroundColor: 'var(--p-surface)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '20px', marginBottom: '4px' }}>🔥</p>
          <p style={{ fontSize: '11px', color: 'var(--t-secondary)' }}>Ignition</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--snap)' }}>{statusCounts.ignition}</p>
        </div>
      </div>
    </div>
  );
}
