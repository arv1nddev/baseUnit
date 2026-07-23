import type { Dimension, Unit } from '@/lib/types/database';

/** Map each dimension to its canonical hub unit code */
const CANONICAL_UNITS: Record<Dimension, string> = {
  mass: 'g',
  volume: 'ml',
  count: 'each',
};

/**
 * Given a dimension, return the canonical (hub) unit code.
 * mass → 'g', volume → 'ml', count → 'each'
 */
export function getCanonicalUnit(dimension: Dimension): string {
  return CANONICAL_UNITS[dimension];
}

/** Static list of units matching the database schema */
export const ALL_UNITS: Unit[] = [
  { unit_code: 'g', dimension: 'mass', to_canonical: 1 },
  { unit_code: 'kg', dimension: 'mass', to_canonical: 1000 },
  { unit_code: 'lb', dimension: 'mass', to_canonical: 453.592 },
  { unit_code: 'oz', dimension: 'mass', to_canonical: 28.3495 },
  { unit_code: 'ml', dimension: 'volume', to_canonical: 1 },
  { unit_code: 'l', dimension: 'volume', to_canonical: 1000 },
  { unit_code: 'tsp', dimension: 'volume', to_canonical: 4.92892 },
  { unit_code: 'tbsp', dimension: 'volume', to_canonical: 14.7868 },
  { unit_code: 'cup', dimension: 'volume', to_canonical: 240 },
  { unit_code: 'each', dimension: 'count', to_canonical: 1 }
];

/**
 * Compute the cost per canonical base unit.
 *
 * base_unit_cost = total_cost / (purchase_qty × (purchase_unit.to_canonical / base_unit.to_canonical))
 *
 * Since base_unit IS the canonical unit, base_unit.to_canonical is always 1.
 * So: base_unit_cost = total_cost / (purchase_qty × purchase_unit.to_canonical)
 */
export function computeBaseUnitCost(
  totalCost: number,
  purchaseQty: number,
  purchaseUnitToCanonical: number
): number {
  const totalCanonicalQty = purchaseQty * purchaseUnitToCanonical;
  if (totalCanonicalQty <= 0) return 0;
  return totalCost / totalCanonicalQty;
}

/**
 * Format a number as Indian Rupee currency.
 * e.g. 1234.5 → '₹1,234.50'
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as INR with more decimal places (for per-unit costs
 * that can be very small, e.g. ₹0.0005/g for saffron).
 */
export function formatCurrencyPrecise(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '₹0.00';
  // Show up to 4 decimals, but trim trailing zeros
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
  return formatted;
}

/**
 * Given a list of all units and a selected unit_code, derive the
 * canonical base_unit code for that unit's dimension.
 */
export function deriveBaseUnit(units: Unit[], purchaseUnitCode: string): { baseUnit: string; dimension: Dimension } | null {
  const unit = units.find((u) => u.unit_code === purchaseUnitCode);
  if (!unit) return null;
  return {
    baseUnit: getCanonicalUnit(unit.dimension),
    dimension: unit.dimension,
  };
}

/**
 * Group units by dimension for dropdown display.
 */
export function groupUnitsByDimension(units: Unit[]): Record<Dimension, Unit[]> {
  return units.reduce(
    (acc, unit) => {
      acc[unit.dimension].push(unit);
      return acc;
    },
    { mass: [], volume: [], count: [] } as Record<Dimension, Unit[]>
  );
}
