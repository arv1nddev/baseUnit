'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CostDisplay } from '@/components/ui/cost-display';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { parseSupabaseError } from '@/lib/utils/errors';
import { ALL_UNITS } from '@/lib/utils/units';
import type { Recipe, RecipeIngredient, RawGood, RecipeCost, Unit, Dimension } from '@/lib/types/database';

// Extended ingredient with joined name data
interface IngredientLine extends RecipeIngredient {
  raw_good_name?: string;
  sub_recipe_name?: string;
}

export default function RecipeBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const { showToast } = useToast();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<IngredientLine[]>([]);
  const [cost, setCost] = useState<RecipeCost | null>(null);
  const units = ALL_UNITS;
  const [rawGoods, setRawGoods] = useState<RawGood[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Add ingredient modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<'raw_good' | 'sub_recipe'>('raw_good');
  const [addItemId, setAddItemId] = useState('');
  const [addQty, setAddQty] = useState('');
  const [addUom, setAddUom] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<IngredientLine | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Delete recipe
  const [deleteRecipeOpen, setDeleteRecipeOpen] = useState(false);
  const [deletingRecipe, setDeletingRecipe] = useState(false);

  const fetchCost = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .rpc('calculate_recipe_cost', { target_recipe_id: recipeId })
      .single<RecipeCost>();
    if (data) setCost(data);
  }, [recipeId]);

  const fetchIngredients = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('created_at');

    if (!data) return;

    // Resolve names
    const lines: IngredientLine[] = [];
    for (const ri of data) {
      const line: IngredientLine = { ...ri };
      if (ri.type === 'raw_good' && ri.raw_good_id) {
        const { data: rg } = await supabase
          .from('raw_goods')
          .select('item_name')
          .eq('id', ri.raw_good_id)
          .single();
        line.raw_good_name = rg?.item_name;
      } else if (ri.type === 'sub_recipe' && ri.sub_recipe_id) {
        const { data: sr } = await supabase
          .from('recipes')
          .select('recipe_name')
          .eq('id', ri.sub_recipe_id)
          .single();
        line.sub_recipe_name = sr?.recipe_name;
      }
      lines.push(line);
    }
    setIngredients(lines);
  }, [recipeId]);

  useEffect(() => {
    async function fetchAll() {
      const supabase = createClient();

      const [recipeRes, rawGoodsRes, recipesRes] = await Promise.all([
        supabase.from('recipes').select('*').eq('id', recipeId).single<Recipe>(),
        supabase.from('raw_goods').select('*').order('item_name'),
        supabase.from('recipes').select('*').neq('id', recipeId).order('recipe_name'),
      ]);

      if (recipeRes.data) setRecipe(recipeRes.data);
      else {
        showToast('Recipe not found.', 'error');
        router.push('/dashboard');
        return;
      }

      if (rawGoodsRes.data) setRawGoods(rawGoodsRes.data);
      if (recipesRes.data) setAllRecipes(recipesRes.data);

      await fetchIngredients();
      await fetchCost();
      setLoading(false);
    }
    fetchAll();
  }, [recipeId, router, showToast, fetchIngredients, fetchCost]);

  // Determine which units to show for the selected item
  const getAvailableUomDimension = (): Dimension | null => {
    if (addType === 'raw_good' && addItemId) {
      const rg = rawGoods.find((r) => r.id === addItemId);
      if (rg) {
        const u = units.find((u) => u.unit_code === rg.base_unit);
        return u?.dimension ?? null;
      }
    }
    if (addType === 'sub_recipe' && addItemId) {
      const sr = allRecipes.find((r) => r.id === addItemId);
      if (sr) {
        const u = units.find((u) => u.unit_code === sr.yield_unit);
        return u?.dimension ?? null;
      }
    }
    return null;
  };

  const uomDimension = getAvailableUomDimension();
  const filteredUnits = uomDimension
    ? units.filter((u) => u.dimension === uomDimension)
    : [];

  async function handleAddIngredient(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from('recipe_ingredients').insert({
      recipe_id: recipeId,
      type: addType,
      raw_good_id: addType === 'raw_good' ? addItemId : null,
      sub_recipe_id: addType === 'sub_recipe' ? addItemId : null,
      quantity_used: Number(addQty),
      uom: addUom,
    });

    if (error) {
      showToast(parseSupabaseError(error), 'error');
    } else {
      showToast('Ingredient added', 'success');
      setAddModalOpen(false);
      resetAddForm();
      await fetchIngredients();
      await fetchCost();
    }
    setAddLoading(false);
  }

  async function handleDeleteIngredient() {
    if (!deleteTarget) return;
    setDeleting(true);

    const supabase = createClient();
    const { error } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('id', deleteTarget.id);

    if (error) {
      showToast(parseSupabaseError(error), 'error');
    } else {
      showToast('Ingredient removed', 'success');
      setIngredients((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      await fetchCost();
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  async function handleDeleteRecipe() {
    setDeletingRecipe(true);
    const supabase = createClient();

    // First delete all ingredients, then the recipe
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
    const { error } = await supabase.from('recipes').delete().eq('id', recipeId);

    if (error) {
      showToast(parseSupabaseError(error), 'error');
      setDeletingRecipe(false);
      setDeleteRecipeOpen(false);
    } else {
      showToast('Recipe deleted', 'success');
      router.push('/dashboard');
    }
  }

  function resetAddForm() {
    setAddType('raw_good');
    setAddItemId('');
    setAddQty('');
    setAddUom('');
  }

  if (loading || !recipe) {
    return (
      <div className="animate-fade-in">
        <div className="h-10 w-64 rounded-[var(--radius-md)] animate-shimmer mb-4" />
        <div className="h-32 rounded-[var(--radius-lg)] animate-shimmer mb-6" />
        <div className="h-64 rounded-[var(--radius-lg)] animate-shimmer" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Recipes
        </button>
        <div className="flex items-center gap-2">
          <Link href={`/recipes/${recipeId}/edit`}>
            <Button variant="ghost" size="sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setDeleteRecipeOpen(true)}>
            <svg className="w-4 h-4 text-[var(--color-danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Recipe header card */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-1">
              {recipe.recipe_name}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Yields {recipe.yield_qty} {recipe.yield_unit}
            </p>
          </div>
          <div className="flex gap-6">
            <CostDisplay
              amount={cost?.total_cost}
              label="Total cost"
              size="xl"
            />
            <CostDisplay
              amount={cost?.cost_per_yield_unit}
              label="Per unit"
              size="lg"
              precise
              perUnit={recipe.yield_unit}
            />
          </div>
        </div>
      </Card>

      {/* Ingredients section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Ingredients
          {ingredients.length > 0 && (
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-2">
              ({ingredients.length})
            </span>
          )}
        </h2>
        <Button size="sm" onClick={() => setAddModalOpen(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </Button>
      </div>

      {ingredients.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title="No ingredients yet"
          description="Add your first ingredient to see the recipe's true cost."
          action={
            <Button onClick={() => setAddModalOpen(true)}>
              Add ingredient
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2 stagger-list">
          {ingredients.map((ing) => (
            <Card key={ing.id} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Badge variant={ing.type === 'raw_good' ? 'ingredient' : 'subrecipe'}>
                    {ing.type === 'raw_good' ? 'Ingredient' : 'Sub-recipe'}
                  </Badge>
                  <span className="font-medium text-[var(--text-primary)] text-sm truncate">
                    {ing.raw_good_name || ing.sub_recipe_name || '—'}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm text-[var(--text-secondary)] tabular-nums">
                    {ing.quantity_used} {ing.uom}
                  </span>
                  <button
                    onClick={() => setDeleteTarget(ing)}
                    className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors cursor-pointer"
                    aria-label="Remove ingredient"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Ingredient Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => { setAddModalOpen(false); resetAddForm(); }}
        title="Add Ingredient"
        size="md"
      >
        <form onSubmit={handleAddIngredient} className="flex flex-col gap-5">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setAddType('raw_good'); setAddItemId(''); setAddUom(''); }}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-[var(--radius-md)] border transition-colors cursor-pointer
                ${addType === 'raw_good'
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)]'
                }
              `}
            >
              Raw Ingredient
            </button>
            <button
              type="button"
              onClick={() => { setAddType('sub_recipe'); setAddItemId(''); setAddUom(''); }}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-[var(--radius-md)] border transition-colors cursor-pointer
                ${addType === 'sub_recipe'
                  ? 'bg-slate-100 text-slate-900 border-slate-400 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-500'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)]'
                }
              `}
            >
              Sub-Recipe
            </button>
          </div>

          {/* Item picker */}
          {addType === 'raw_good' ? (
            <Select
              label="Select ingredient"
              placeholder="Choose an ingredient..."
              options={rawGoods.map((rg) => ({
                value: rg.id,
                label: rg.item_name,
              }))}
              value={addItemId}
              onChange={(e) => { setAddItemId(e.target.value); setAddUom(''); }}
              required
            />
          ) : (
            <Select
              label="Select sub-recipe"
              placeholder="Choose a recipe..."
              options={allRecipes.map((r) => ({
                value: r.id,
                label: r.recipe_name,
              }))}
              value={addItemId}
              onChange={(e) => { setAddItemId(e.target.value); setAddUom(''); }}
              required
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              placeholder="e.g. 200"
              min="0.0001"
              step="any"
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              required
            />
            <Select
              label="Unit"
              placeholder={addItemId ? 'Select unit' : 'Pick item first'}
              options={filteredUnits.map((u) => ({
                value: u.unit_code,
                label: u.unit_code,
              }))}
              value={addUom}
              onChange={(e) => setAddUom(e.target.value)}
              required
              disabled={!addItemId}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setAddModalOpen(false); resetAddForm(); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={addLoading}
              disabled={!addItemId || !addQty || !addUom}
            >
              Add to Recipe
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete ingredient confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteIngredient}
        title="Remove ingredient"
        message={`Remove "${deleteTarget?.raw_good_name || deleteTarget?.sub_recipe_name || ''}" from this recipe?`}
        confirmLabel="Remove"
        isLoading={deleting}
      />

      {/* Delete recipe confirmation */}
      <ConfirmDialog
        isOpen={deleteRecipeOpen}
        onClose={() => setDeleteRecipeOpen(false)}
        onConfirm={handleDeleteRecipe}
        title="Delete recipe"
        message={`Are you sure you want to delete "${recipe.recipe_name}"? This will remove all its ingredients and cannot be undone.`}
        confirmLabel="Delete Recipe"
        isLoading={deletingRecipe}
      />
    </div>
  );
}
