import React from 'react';
import { Headphones, Watch, Gem, Gift, Sparkles, Package } from 'lucide-react';

export default function ProductIcon({ name = '', category = '', size = 32 }) {
  const cleanName = name.toLowerCase();
  const cleanCategory = category.toLowerCase();

  let IconComponent = Package;
  let bgStyle = {
    background: 'rgba(148, 163, 184, 0.12)',
    color: '#94a3b8'
  };

  if (cleanName.includes('headphones')) {
    IconComponent = Headphones;
    bgStyle = {
      background: 'rgba(56, 189, 248, 0.12)',
      color: '#38bdf8'
    };
  } else if (cleanName.includes('watch')) {
    IconComponent = Watch;
    bgStyle = {
      background: 'rgba(99, 102, 241, 0.12)',
      color: '#818cf8'
    };
  } else if (cleanName.includes('anklet') || cleanName.includes('silver') || cleanCategory.includes('fashion')) {
    IconComponent = Gem;
    bgStyle = {
      background: 'rgba(16, 185, 129, 0.12)',
      color: '#34d399'
    };
  } else if (cleanName.includes('gift') || cleanName.includes('set')) {
    IconComponent = Gift;
    bgStyle = {
      background: 'rgba(236, 72, 153, 0.12)',
      color: '#f472b6'
    };
  } else if (cleanCategory.includes('beauty') || cleanName.includes('vanity') || cleanName.includes('cosmetics')) {
    IconComponent = Sparkles;
    bgStyle = {
      background: 'rgba(168, 85, 247, 0.12)',
      color: '#c084fc'
    };
  }

  const containerStyle = {
    ...bgStyle,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px'
  };

  return (
    <div style={containerStyle}>
      <IconComponent size={size} strokeWidth={1.5} />
    </div>
  );
}
