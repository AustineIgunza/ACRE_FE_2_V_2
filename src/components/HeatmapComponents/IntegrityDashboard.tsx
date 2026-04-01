'use client';

import { Unit } from '@/types/thermal';

interface IntegrityDashboardProps {
  unit?: Unit;
}

export default function IntegrityDashboard({ unit }: IntegrityDashboardProps) {
  if (!unit) {
    return (
      <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Select a unit to view details</p>
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
    neutral: unit.nodes.filter(n => n.status === 'neutral').length,
    frost: unit.nodes.filter(n => n.status === 'frost').length,
    warning: unit.nodes.filter(n => n.status === 'warning').length,
    ignition: unit.nodes.filter(n => n.status === 'ignition').length,
  };

  const successRate = unit.nodes.length > 0
    ? unit.nodes.reduce((sum, n) => sum + (n.totalAttempts > 0 ? n.correctAttempts / n.totalAttempts : 0), 0) / unit.nodes.length * 100
    : 0;

  return (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#fff', fontFamily: 'Georgia, serif' }}>{unit.name}</h3>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>{unit.description}</p>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Integrity</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>{Math.round(avgIntegrity)}%</p>
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Heat</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#ff5c35' }}>{Math.round(avgHeat)}%</p>
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Success Rate</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>{Math.round(successRate)}%</p>
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Nodes</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{unit.nodes.length}</p>
        </div>
      </div>

      {/* Status Distribution */}
      <h4 style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', marginTop: '24px' }}>Concept Distribution</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px' }}>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', marginBottom: '6px' }}>◯</p>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Neutral</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#8b5cf6' }}>{statusCounts.neutral}</p>
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', marginBottom: '6px' }}>❄️</p>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Frost</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#3b82f6' }}>{statusCounts.frost}</p>
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', marginBottom: '6px' }}>⚠️</p>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Warning</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b' }}>{statusCounts.warning}</p>
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', marginBottom: '6px' }}>🔥</p>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Ignition</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#ff5c35' }}>{statusCounts.ignition}</p>
        </div>
      </div>
    </div>
  );
}
