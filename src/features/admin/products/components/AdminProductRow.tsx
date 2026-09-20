import { useState } from 'react';
import { Link } from 'react-router';
import type { User } from 'firebase/auth';
import { DestructiveTriggerButton } from '@/components/ui/DestructiveTriggerButton';
import { InlineError } from '@/components/ui/InlineError';
import { CATEGORY_LABELS } from '@/features/products/constants/categoryLabels';
import { FIELD_COLOR_CLASSES } from '@/features/products/constants/displayColors';
import { EditableNumberCell } from '@/features/admin/products/components/EditableNumberCell';
import { ProductStatusBadge } from '@/features/admin/products/components/ProductStatusBadge';
import { DeleteProductModal } from '@/features/admin/products/components/DeleteProductModal';
import { TABLE_LABEL_CLASSES } from '@/features/admin/constants/tableLabelClasses';
import { updateProduct } from '@/features/admin/products/services/updateProduct';
import { roundToCents } from '@shared/schemas/order';
import type { Product } from '@shared/schemas/product';

export function canHardDeleteProduct(product: Product): boolean {
  return product.orderCount === 0 && product.ratingCount === 0;
}

export function hardDeleteUnavailableReason(product: Product): string {
  if (product.orderCount > 0 && product.ratingCount > 0) {
    return `Tiene ${product.orderCount} ventas y ${product.ratingCount} reseñas registradas`;
  }
  if (product.orderCount > 0) {
    return `Tiene ${product.orderCount} ventas registradas`;
  }
  return `Tiene ${product.ratingCount} reseñas registradas`;
}

type AdminProductRowProps = {
  product: Product;
  user: User;
  onMutated: () => void;
};

export function AdminProductRow({ product, user, onMutated }: AdminProductRowProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canHardDelete = canHardDeleteProduct(product);

  async function handleSavePrice(newPrice: number): Promise<number> {
    const rounded = roundToCents(newPrice);
    const result = await updateProduct(user, {
      productId: product.id,
      changes: { price: rounded },
    });
    if (!result.ok) {
      throw new Error(result.message);
    }
    onMutated();
    return rounded;
  }

  async function handleSaveStock(newStock: number): Promise<number> {
    const truncated = Math.trunc(newStock);
    const result = await updateProduct(user, {
      productId: product.id,
      changes: { stock: truncated },
    });
    if (!result.ok) {
      throw new Error(result.message);
    }
    onMutated();
    return truncated;
  }

  async function handleToggleActive(): Promise<void> {
    setIsToggling(true);
    setToggleError(null);

    const result = await updateProduct(user, {
      productId: product.id,
      changes: { isActive: !product.isActive },
    });

    if (!result.ok) {
      setToggleError(result.message);
      setIsToggling(false);
      return;
    }

    onMutated();
  }

  return (
    <tr className="flex flex-col gap-2 border-b border-ink/10 py-4 md:table-row md:gap-0 md:py-0 dark:border-bone/10">
      <td className="flex items-center gap-2 md:table-cell md:py-3 md:pr-4">
        <span
          aria-hidden="true"
          className={`inline-block size-4 shrink-0 ${FIELD_COLOR_CLASSES[product.displayColor]}`}
        />
        <span className="font-body text-sm font-medium text-ink md:hidden dark:text-bone">
          {product.name}
        </span>
      </td>
      <td className="hidden font-body text-sm text-ink md:table-cell md:py-3 md:pr-4 dark:text-bone">
        {product.name}
      </td>
      <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:pr-4">
        <span className={`${TABLE_LABEL_CLASSES} md:hidden`}>Categoría</span>
        <span className="font-body text-sm text-ink/70 dark:text-bone/70">
          {CATEGORY_LABELS[product.category]}
        </span>
      </td>
      <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:pr-4">
        <span className={`${TABLE_LABEL_CLASSES} md:hidden`}>Precio</span>
        <EditableNumberCell
          key={product.price}
          value={product.price}
          label={`Precio — ${product.name}`}
          min={0.01}
          step={0.01}
          disabled={isToggling}
          onSave={handleSavePrice}
        />
      </td>
      <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:pr-4">
        <span className={`${TABLE_LABEL_CLASSES} md:hidden`}>Stock</span>
        <EditableNumberCell
          key={product.stock}
          value={product.stock}
          label={`Stock — ${product.name}`}
          min={0}
          step={1}
          disabled={isToggling}
          onSave={handleSaveStock}
        />
      </td>
      <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:pr-4">
        <span className={`${TABLE_LABEL_CLASSES} md:hidden`}>Estado</span>
        <ProductStatusBadge isActive={product.isActive} />
      </td>
      <td className="md:py-3">
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap justify-end gap-3">
            <Link
              to={`/admin/products/${product.id}/edit`}
              className="font-body border-b border-ink text-xs font-medium tracking-widest text-ink uppercase hover:border-field-magenta hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:border-bone dark:text-bone dark:hover:border-field-cyan dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
            >
              Editar
            </Link>
            <button
              type="button"
              onClick={() => void handleToggleActive()}
              disabled={isToggling}
              className="font-body border-b border-ink text-xs font-medium tracking-widest text-ink uppercase hover:border-field-magenta hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta disabled:cursor-not-allowed disabled:opacity-40 dark:border-bone dark:text-bone dark:hover:border-field-cyan dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
            >
              {product.isActive ? 'Retirar' : 'Reactivar'}
            </button>
            {canHardDelete ? (
              <DestructiveTriggerButton onClick={() => setIsDeleteModalOpen(true)}>
                Eliminar
              </DestructiveTriggerButton>
            ) : (
              <span className="font-body text-right text-xs text-ink/60 dark:text-bone/60">
                {hardDeleteUnavailableReason(product)}
              </span>
            )}
          </div>
          <InlineError message={toggleError} />
        </div>

        {isDeleteModalOpen ? (
          <DeleteProductModal
            product={product}
            user={user}
            onClose={() => setIsDeleteModalOpen(false)}
            onDeleted={() => {
              setIsDeleteModalOpen(false);
              onMutated();
            }}
          />
        ) : null}
      </td>
    </tr>
  );
}
