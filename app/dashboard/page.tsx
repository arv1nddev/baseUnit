import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { CostDisplay } from '@/components/ui/cost-display';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import type { RecipeCostView } from '@/lib/types/database';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: recipes } = await supabase
    .from('recipe_costs')
    .select('recipe_id, recipe_name, total_cost, cost_per_yield_unit')
    .returns<RecipeCostView[]>();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Recipes
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {recipes && recipes.length > 0
              ? `${recipes.length} recipe${recipes.length === 1 ? '' : 's'}`
              : 'Your recipe collection'}
          </p>
        </div>
        <Link href="/recipes/new">
          <Button size="md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Recipe
          </Button>
        </Link>
      </div>

      {/* Recipe grid */}
      {!recipes || recipes.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          title="No recipes yet"
          description="Start by adding your purchased ingredients, then create your first recipe to see its true cost."
          action={
            <div className="flex gap-3">
              <Link href="/raw-goods/new">
                <Button variant="secondary">Add ingredient</Button>
              </Link>
              <Link href="/recipes/new">
                <Button>Create recipe</Button>
              </Link>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-list">
          {recipes.map((recipe) => (
            <Link key={recipe.recipe_id} href={`/recipes/${recipe.recipe_id}`}>
              <Card hover className="p-5 h-full">
                <h3 className="font-semibold text-[var(--text-primary)] text-base mb-3 truncate">
                  {recipe.recipe_name}
                </h3>
                <div className="flex items-end justify-between">
                  <CostDisplay
                    amount={recipe.total_cost}
                    label="Total cost"
                    size="lg"
                  />
                  <CostDisplay
                    amount={recipe.cost_per_yield_unit}
                    label="Per unit"
                    size="sm"
                    precise
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
