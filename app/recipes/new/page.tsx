'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { parseSupabaseError } from '@/lib/utils/errors';
import { groupUnitsByDimension, ALL_UNITS } from '@/lib/utils/units';
import type { Unit } from '@/lib/types/database';

export default function NewRecipePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const units = ALL_UNITS;
  const [loading, setLoading] = useState(false);

  const [recipeName, setRecipeName] = useState('');
  const [yieldQty, setYieldQty] = useState('');
  const [yieldUnit, setYieldUnit] = useState('');

  const grouped = groupUnitsByDimension(units);
  const unitGroups = [
    { label: 'Weight', options: grouped.mass.map((u) => ({ value: u.unit_code, label: u.unit_code })) },
    { label: 'Volume', options: grouped.volume.map((u) => ({ value: u.unit_code, label: u.unit_code })) },
    { label: 'Count', options: grouped.count.map((u) => ({ value: u.unit_code, label: u.unit_code })) },
  ].filter((g) => g.options.length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast('You must be signed in.', 'error');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('recipes')
      .insert({
        user_id: user.id,
        recipe_name: recipeName.trim(),
        yield_qty: Number(yieldQty),
        yield_unit: yieldUnit,
      })
      .select('id')
      .single();

    if (error) {
      showToast(parseSupabaseError(error), 'error');
      setLoading(false);
    } else {
      showToast(`"${recipeName.trim()}" created`, 'success');
      router.push(`/recipes/${data.id}`);
    }
  }

  const isValid =
    recipeName.trim().length > 0 &&
    Number(yieldQty) > 0 &&
    yieldUnit.length > 0;

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
          New Recipe
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Name your recipe and specify how much it yields.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Recipe name"
            placeholder="e.g. Chocolate Cake"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Yield quantity"
              type="number"
              placeholder="e.g. 12"
              min="0.0001"
              step="any"
              value={yieldQty}
              onChange={(e) => setYieldQty(e.target.value)}
              required
            />
            <Select
              label="Yield unit"
              placeholder="Select unit"
              groups={unitGroups}
              value={yieldUnit}
              onChange={(e) => setYieldUnit(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} disabled={!isValid}>
              Create Recipe
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
