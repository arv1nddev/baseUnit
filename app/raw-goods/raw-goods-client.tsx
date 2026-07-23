'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { CostDisplay } from '@/components/ui/cost-display';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { parseSupabaseError } from '@/lib/utils/errors';
import type { RawGood } from '@/lib/types/database';

interface RawGoodsClientProps {
  initialRawGoods: RawGood[];
}

export function RawGoodsClient({ initialRawGoods }: RawGoodsClientProps) {
  const [rawGoods, setRawGoods] = useState<RawGood[]>(initialRawGoods);
  const [deleteTarget, setDeleteTarget] = useState<RawGood | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('raw_goods')
      .delete()
      .eq('id', deleteTarget.id);

    if (error) {
      showToast(parseSupabaseError(error), 'error');
    } else {
      setRawGoods((prev) => prev.filter((rg) => rg.id !== deleteTarget.id));
      showToast(`"${deleteTarget.item_name}" deleted`, 'success');
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Ingredients
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {rawGoods.length > 0
              ? `${rawGoods.length} ingredient${rawGoods.length === 1 ? '' : 's'} tracked`
              : 'Your purchased ingredients'}
          </p>
        </div>
        <Link href="/raw-goods/new">
          <Button size="md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Ingredient
          </Button>
        </Link>
      </div>

      {/* List */}
      {rawGoods.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          }
          title="No ingredients yet"
          description="Add the ingredients you purchase so you can use them in your recipes and track costs accurately."
          action={
            <Link href="/raw-goods/new">
              <Button>Add your first ingredient</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-list">
          {rawGoods.map((rg) => (
            <Card key={rg.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-[var(--text-primary)] text-base truncate flex-1 mr-2">
                  {rg.item_name}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link href={`/raw-goods/${rg.id}/edit`}>
                    <button className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(rg)}
                    className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-sm text-[var(--text-secondary)] mb-3">
                {rg.purchase_qty} {rg.purchase_unit} purchased for{' '}
                <span className="font-medium text-[var(--text-primary)]">
                  ₹{Number(rg.total_cost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </p>

              <CostDisplay
                amount={rg.base_unit_cost}
                label="Cost per unit"
                size="md"
                precise
                perUnit={rg.base_unit}
              />
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete ingredient"
        message={`Are you sure you want to delete "${deleteTarget?.item_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleting}
      />
    </div>
  );
}
