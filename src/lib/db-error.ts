/**
 * Logs an unexpected database error server-side and returns a message safe
 * to show the user. Raw Postgres/PostgREST error text can include table,
 * column and constraint names — useful for debugging, but never meant for
 * an end user. Errors we've already classified (e.g. a unique-constraint
 * violation mapped to "That username is already taken") are handled at the
 * call site before this is reached, so this is only the generic fallback.
 */
export function genericDbError(context: string, error: unknown): { error: string } {
  console.error(`[${context}]`, error);
  return { error: "Something went wrong. Please try again." };
}
