export const CATEGORIES = {
    pothole: {
        key: 'pothole',
        label: 'Pothole',
        description: 'Road craters and severe asphalt depression',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        iconColor: '#ea580c',
    },
    streetlight: {
        key: 'streetlight',
        label: 'Broken Streetlight',
        description: 'Dark zones, flickering, or broken lamps',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        iconColor: '#d97706',
    },
    garbage: {
        key: 'garbage',
        label: 'Garbage Dump',
        description: 'Overflowing bins and illegal waste dumping',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        iconColor: '#e11d48',
    },
    water_leak: {
        key: 'water_leak',
        label: 'Water Leakage',
        description: 'Burst pipelines or contaminated water ponding',
        color: 'bg-sky-50 text-sky-700 border-sky-200',
        iconColor: '#0284c7',
    },
    road_damage: {
        key: 'road_damage',
        label: 'Road Damage',
        description: 'Broken curbs, divider damages, or cave-ins',
        color: 'bg-stone-100 text-stone-700 border-stone-300',
        iconColor: '#57534e',
    },
    other: {
        key: 'other',
        label: 'Other Infrastructure',
        description: 'Footpath encroachments, open manholes, etc.',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        iconColor: '#4f46e5',
    },
};

export const STATUSES = {
    open: {
        key: 'open',
        label: 'Open',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
        hex: '#ef4444',
        description: 'Reported and pending administrative review',
    },
    in_progress: {
        key: 'in_progress',
        label: 'In Progress',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
        hex: '#f59e0b',
        description: 'Work order dispatched to municipal maintenance',
    },
    resolved: {
        key: 'resolved',
        label: 'Resolved',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
        hex: '#10b981',
        description: 'Issue inspected and verified fixed by authorities',
    },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
export const STATUS_LIST = Object.values(STATUSES);
