import React from 'react';
import { CATEGORIES } from '../utils/constants';

export default function CategoryBadge({ category, size = 'sm', className = '' }) {
  const cat = CATEGORIES[category] || {
    label: category || 'Other',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[11px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-lg border ${cat.color} ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {cat.label}
    </span>
  );
}
