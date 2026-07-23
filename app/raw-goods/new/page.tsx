'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CostDisplay } from '@/components/ui/cost-display';
import { useToast } from '@/components/ui/toast';
import { parseSupabaseError } from '@/lib/utils/errors';
import { deriveBaseUnit, computeBaseUnitCost, groupUnitsByDimension, ALL_UNITS } from '@/lib/utils/units';
import type { Unit } from '@/lib/types/database';

export default function NewRawGoodPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [itemName, setItemName] = useState('');
  const [purchaseQty, setPurchaseQty] = useState('');
  const [purchaseUnit, setPurchaseUnit] = useState('');
  const [totalCost, setTotalCost] = useState('');

  const units = ALL_UNITS;

  // Derived values
  const selectedUnit = units.find((u) => u.unit_code === purchaseUnit);
  const derived = purchaseUnit ? deriveBaseUnit(units, purchaseUnit) : null;
  const computedBaseUnitCost =
    derived && Number(purchaseQty) > 0 && Number(totalCost) >= 0 && selectedUnit
      ? computeBaseUnitCost(Number(totalCost), Number(purchaseQty), selectedUnit.to_canonical)
      : null;

  const grouped = groupUnitsByDimension(units);
  const unitGroups = [
    { label: 'Weight', options: grouped.mass.map((u) => ({ value: u.unit_code, label: u.unit_code })) },
    { label: 'Volume', options: grouped.volume.map((u) => ({ value: u.unit_code, label: u.unit_code })) },
    { label: 'Count', options: grouped.count.map((u) => ({ value: u.unit_code, label: u.unit_code })) },
  ].filter((g) => g.options.length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!derived || computedBaseUnitCost === null) return;

    setLoading(true);
    const supabase = createClient();

    // Get current user for user_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast('You must be signed in.', 'error');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('raw_goods').insert({
      user_id: user.id,
      item_name: itemName.trim(),
      purchase_qty: Number(purchaseQty),
      purchase_unit: purchaseUnit,
      total_cost: Number(totalCost),
      base_unit: derived.baseUnit,
      base_unit_cost: computedBaseUnitCost,
    });

    if (error) {
      showToast(parseSupabaseError(error), 'error');
      setLoading(false);
    } else {
      showToast(`"${itemName.trim()}" added`, 'success');
      router.push('/raw-goods');
    }
  }

  const isValid =
    itemName.trim().length > 0 &&
    Number(purchaseQty) > 0 &&
    purchaseUnit.length > 0 &&
    Number(totalCost) >= 0;

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Add Ingredient
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Enter what you purchased and how much you paid.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Item name"
            placeholder="e.g. All-purpose flour"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity purchased"
              type="number"
              placeholder="e.g. 5"
              min="0.0001"
              step="any"
              value={purchaseQty}
              onChange={(e) => setPurchaseQty(e.target.value)}
              required
            />
            <Select
              label="Unit"
              placeholder="Select unit"
              groups={unitGroups}
              value={purchaseUnit}
              onChange={(e) => setPurchaseUnit(e.target.value)}
              required
            />
          </div>

          <Input
            label="Total cost (₹)"
            type="number"
            placeholder="e.g. 250"
            min="0"
            step="any"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            required
          />

          {/* Live cost preview */}
          {computedBaseUnitCost !== null && (
            <div className="bg-[var(--color-cost-bg)] rounded-[var(--radius-md)] p-4 border border-[var(--color-cost)]/20 animate-fade-in">
              <CostDisplay
                amount={computedBaseUnitCost}
                label="Calculated cost per unit"
                size="lg"
                precise
                perUnit={derived?.baseUnit}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} disabled={!isValid}>
              Add Ingredient
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
