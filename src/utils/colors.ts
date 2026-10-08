import { AQICategory } from '../types';

export interface OfficialAQITier {
  range: string;
  min: number;
  max: number;
  category: AQICategory;
  emoji: string;
  officialLevel: string;
  whatItMeans: string;
  accentHex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const CPCB_AQI_TIERS: OfficialAQITier[] = [
  {
    range: '0–50',
    min: 0,
    max: 50,
    category: 'Good',
    emoji: '🟢',
    officialLevel: 'Good',
    whatItMeans: 'Safe for most people.',
    accentHex: '#16a34a',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200'
  },
  {
    range: '51–100',
    min: 51,
    max: 100,
    category: 'Satisfactory',
    emoji: '🟡',
    officialLevel: 'Satisfactory',
    whatItMeans: 'Generally okay, but sensitive people may notice discomfort.',
    accentHex: '#ca8a04',
    badgeBg: 'bg-yellow-50',
    badgeText: 'text-yellow-800',
    badgeBorder: 'border-yellow-200'
  },
  {
    range: '101–200',
    min: 101,
    max: 200,
    category: 'Moderate',
    emoji: '🟠',
    officialLevel: 'Moderate',
    whatItMeans: 'People with asthma, lung or heart problems may have breathing discomfort.',
    accentHex: '#ea580c',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-200'
  },
  {
    range: '201–300',
    min: 201,
    max: 300,
    category: 'Poor',
    emoji: '🔴',
    officialLevel: 'Poor',
    whatItMeans: 'Breathing discomfort is possible for most people during prolonged exposure.',
    accentHex: '#dc2626',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-200'
  },
  {
    range: '301–400',
    min: 301,
    max: 400,
    category: 'Very Poor',
    emoji: '🟣',
    officialLevel: 'Very Poor',
    whatItMeans: 'Prolonged exposure can cause respiratory illness.',
    accentHex: '#9333ea',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-200'
  },
  {
    range: '401–500',
    min: 401,
    max: 500,
    category: 'Severe',
    emoji: '🟤',
    officialLevel: 'Severe',
    whatItMeans: 'Can affect even healthy people; serious risk for those with existing conditions.',
    accentHex: '#78350f',
    badgeBg: 'bg-amber-950/10',
    badgeText: 'text-amber-950',
    badgeBorder: 'border-amber-900/30'
  }
];

export function getOfficialAQITier(aqi: number): OfficialAQITier {
  if (aqi <= 50) return CPCB_AQI_TIERS[0];
  if (aqi <= 100) return CPCB_AQI_TIERS[1];
  if (aqi <= 200) return CPCB_AQI_TIERS[2];
  if (aqi <= 300) return CPCB_AQI_TIERS[3];
  if (aqi <= 400) return CPCB_AQI_TIERS[4];
  return CPCB_AQI_TIERS[5];
}

export interface AQITheme {
  category: AQICategory;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentHex: string;
  glowClass: string;
  gradient: string;
  healthSeverity: string;
  emoji: string;
}

export function getAQITheme(aqi: number): AQITheme {
  const tier = getOfficialAQITier(aqi);
  return {
    category: tier.category,
    label: tier.officialLevel.toUpperCase(),
    badgeBg: tier.badgeBg,
    badgeText: tier.badgeText,
    badgeBorder: tier.badgeBorder,
    accentHex: tier.accentHex,
    glowClass: 'shadow-sm',
    gradient: `from-[${tier.accentHex}]/10 to-transparent`,
    healthSeverity: tier.whatItMeans,
    emoji: tier.emoji
  };
}

export function getRiskColor(level: string): { bg: string; text: string; border: string } {
  switch (level.toUpperCase()) {
    case 'LOW':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'MODERATE':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    case 'HIGH':
      return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' };
    case 'VERY HIGH':
      return { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' };
    case 'SEVERE':
      return { bg: 'bg-amber-950/10', text: 'text-amber-950', border: 'border-amber-900/30' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
}
