import { PRODUCT_CATEGORIES, type ProductCategory } from '@shared/schemas/product';
import { CATEGORY_LABELS } from '@/features/products/constants/categoryLabels';
import { FILTER_CHIP_CLASSES } from '@/features/products/constants/filterStyles';

type AdminProductFiltersProps = {
  category: ProductCategory | undefined;
  searchTerm: string;
  onCategoryChange: (category: ProductCategory | undefined) => void;
  onSearchTermChange: (value: string) => void;
};

export function AdminProductFilters({
  category,
  searchTerm,
  onCategoryChange,
  onSearchTermChange,
}: AdminProductFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-ink/15 pb-4 dark:border-bone/15">
      <div role="search">
        <label htmlFor="admin-product-search" className="sr-only">
          Buscar productos por nombre
        </label>
        <input
          id="admin-product-search"
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full max-w-sm border-0 border-b border-ink/50 bg-transparent px-0 py-2 font-body text-sm text-ink placeholder:text-ink/60 focus:outline-none focus-visible:border-field-magenta dark:border-bone/40 dark:text-bone dark:placeholder:text-bone/55 dark:focus-visible:border-field-cyan"
        />
      </div>

      <div role="group" aria-label="Filtrar por categoría" className="flex gap-5 overflow-x-auto">
        <button
          type="button"
          aria-pressed={category === undefined}
          onClick={() => onCategoryChange(undefined)}
          className={FILTER_CHIP_CLASSES}
        >
          Todas
        </button>
        {PRODUCT_CATEGORIES.map((productCategory) => (
          <button
            key={productCategory}
            type="button"
            aria-pressed={category === productCategory}
            onClick={() => onCategoryChange(productCategory)}
            className={FILTER_CHIP_CLASSES}
          >
            {CATEGORY_LABELS[productCategory]}
          </button>
        ))}
      </div>
    </div>
  );
}
