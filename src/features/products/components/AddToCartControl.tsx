import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { Button } from '@/components/ui/Button';
import type { Product } from '@shared/schemas/product';

type AddToCartControlProps = {
  product: Product;
};

export function AddToCartControl({ product }: AddToCartControlProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock === 0;

  return (
    <div className="flex flex-col gap-3 md:items-end">
      {isOutOfStock ? (
        <p className="font-body text-sm text-ink/70">Sin stock</p>
      ) : (
        <QuantitySelector maxQuantity={product.stock} onQuantityChange={setQuantity} />
      )}

      <Button disabled={isOutOfStock} onClick={() => addItem(product.id, quantity, product.stock)}>
        Agregar al carrito
      </Button>
    </div>
  );
}
