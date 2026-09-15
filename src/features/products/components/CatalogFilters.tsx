import { PRODUCT_CATEGORIES, PRODUCT_DISPLAY_COLORS, type ProductCategory } from '@shared/schemas/product';
import { CATEGORY_LABELS } from '@/features/products/constants/categoryLabels';
import { FIELD_COLOR_CLASSES } from '@/features/products/constants/displayColors';
import { FILTER_CHIP_CLASSES } from '@/features/products/constants/filterStyles';

function dotClassForCategory(index: number): string {
  const color = PRODUCT_DISPLAY_COLORS[index % PRODUCT_DISPLAY_COLORS.length] ?? 'lime';
  return FIELD_COLOR_CLASSES[color];
}

type CatalogFiltersProps = {
  category: ProductCategory | undefined;
  searchInputValue: string;
  onCategoryChange: (category: ProductCategory | undefined) => void;
  onSearchInputChange: (value: string) => void;
};

export function CatalogFilters({
  category,
  searchInputValue,
  onCategoryChange,
  onSearchInputChange,
}: CatalogFiltersProps) {
  return (
    <div className="mb-10 flex flex-col gap-5 border-b border-ink/15 pb-6 dark:border-bone/15">
      <div role="search">
        <label htmlFor="catalog-search" className="sr-only">
          Buscar productos por nombre
        </label>
        <input
          id="catalog-search"
          type="search"
          value={searchInputValue}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full border-0 border-b border-ink/50 bg-transparent px-0 py-2 font-body text-sm text-ink placeholder:text-ink/60 focus:outline-none focus-visible:border-field-magenta dark:border-bone/40 dark:text-bone dark:placeholder:text-bone/55 dark:focus-visible:border-field-cyan"
        />
      </div>

      <div
        role="group"
        aria-label="Filtrar por categoria"
        className="catalog-category-rail flex gap-5 overflow-x-auto"
      >
        <button
          type="button"
          aria-pressed={category === undefined}
          onClick={() => onCategoryChange(undefined)}
          className={FILTER_CHIP_CLASSES}
        >
          Todos
        </button>
        {PRODUCT_CATEGORIES.map((productCategory, index) => (
          <button
            key={productCategory}
            type="button"
            aria-pressed={category === productCategory}
            onClick={() => onCategoryChange(productCategory)}
            className={FILTER_CHIP_CLASSES}
          >
            <span aria-hidden="true" className={`size-1.5 ${dotClassForCategory(index)}`} />
            {CATEGORY_LABELS[productCategory]}
          </button>
        ))}
      </div>
    </div>
  );
}
