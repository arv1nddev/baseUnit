/**
 * Parse a Supabase error into a user-friendly message.
 *
 * Handles specific Postgres error codes:
 * - 23503 (foreign_key_violation) on delete → item is in use
 * - 23505 (unique_violation) → duplicate name
 * - P0001 (raise_exception) → trigger-thrown errors (dimension mismatch, cycles)
 */
export function parseSupabaseError(error: { code?: string; message?: string; details?: string } | null): string {
  if (!error) return 'An unexpected error occurred.';

  const code = error.code;
  const message = error.message ?? '';

  // Foreign key violation — most commonly triggered when trying to delete
  // a raw_good or recipe that's referenced by recipe_ingredients
  if (code === '23503') {
    if (message.includes('raw_good') || message.includes('raw_goods')) {
      return 'This ingredient can\'t be deleted because it\'s used in one or more recipes. Remove it from those recipes first.';
    }
    if (message.includes('recipe') || message.includes('sub_recipe')) {
      return 'This recipe can\'t be deleted because it\'s used as a sub-recipe in one or more other recipes. Remove it from those recipes first.';
    }
    return 'This item can\'t be deleted because other records depend on it.';
  }

  // Unique constraint violation
  if (code === '23505') {
    if (message.includes('recipe_name')) {
      return 'A recipe with this name already exists. Please choose a different name.';
    }
    return 'A record with this value already exists.';
  }

  // Trigger-raised exceptions (dimension mismatch, circular reference, tenant mismatch)
  if (code === 'P0001') {
    if (message.includes('dimension')) {
      return 'Unit mismatch: the selected unit doesn\'t match the required measurement type (mass, volume, or count).';
    }
    if (message.includes('circular')) {
      return 'This would create a circular reference — a recipe can\'t contain itself, even indirectly.';
    }
    if (message.includes('same user')) {
      return 'You can only reference your own ingredients and recipes.';
    }
    return message;
  }

  // Fallback
  return message || 'Something went wrong. Please try again.';
}
