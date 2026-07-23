// ─── Database entity types ───────────────────────────────────────────────────
// Mirror the Supabase schema. Keep in sync with documentation/baseunit-database-architecture.md

export type Dimension = 'mass' | 'volume' | 'count';

export interface Unit {
  unit_code: string;
  dimension: Dimension;
  to_canonical: number;
}

export interface RawGood {
  id: string;
  user_id: string;
  item_name: string;
  purchase_qty: number;
  purchase_unit: string;
  total_cost: number;
  base_unit: string;
  base_unit_cost: number;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  recipe_name: string;
  yield_qty: number;
  yield_unit: string;
  created_at: string;
}

export type IngredientType = 'raw_good' | 'sub_recipe';

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  type: IngredientType;
  raw_good_id: string | null;
  sub_recipe_id: string | null;
  quantity_used: number;
  uom: string;
  created_at: string;
}

/** Returned by calculate_recipe_cost() RPC */
export interface RecipeCost {
  recipe_id: string;
  total_cost: number;
  yield_qty: number;
  cost_per_yield_unit: number;
}

/** Returned by the recipe_costs view */
export interface RecipeCostView {
  recipe_id: string;
  user_id: string;
  recipe_name: string;
  total_cost: number;
  cost_per_yield_unit: number;
}

// ─── Form payloads ───────────────────────────────────────────────────────────

export interface RawGoodFormData {
  item_name: string;
  purchase_qty: number;
  purchase_unit: string;
  total_cost: number;
}

export interface RecipeFormData {
  recipe_name: string;
  yield_qty: number;
  yield_unit: string;
}

export interface RecipeIngredientFormData {
  type: IngredientType;
  raw_good_id?: string;
  sub_recipe_id?: string;
  quantity_used: number;
  uom: string;
}
