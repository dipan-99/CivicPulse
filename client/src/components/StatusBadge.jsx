import React from 'react';
import { STATUSES } from '../utils/constants';

export default function StatusBadge({ status, size = 'sm', className = '' }) {
  const info = STATUSES[status] || STATUSES.open;

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[11px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-xs ${info.badgeClass} ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dotClass} animate-pulse`} />
      <span>{info.label}</span>
    </span>
  );
}
