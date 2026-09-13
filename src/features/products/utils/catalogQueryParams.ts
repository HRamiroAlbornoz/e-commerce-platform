import { z } from 'zod';
import { productCategorySchema, type ProductCategory } from '@shared/schemas/product';

const SEARCH_TERM_MAX_LENGTH = 120;
const searchTermParamSchema = z.string().trim().max(SEARCH_TERM_MAX_LENGTH);

export function parseCategoryParam(raw: string | null): ProductCategory | undefined {
  const result = productCategorySchema.safeParse(raw);
  return result.success ? result.data : undefined;
}

export function parseSearchTermParam(raw: string | null): string {
  if (raw === null) {
    return '';
  }

  const result = searchTermParamSchema.safeParse(raw);
  return result.success ? result.data : '';
}

const pageParamSchema = z.coerce.number().int().min(1);

export function parsePageParam(raw: string | null): number {
  const result = pageParamSchema.safeParse(raw);
  return result.success ? result.data : 1;
}
