import { useState } from 'react';

type QuantitySelectorProps = {
  maxQuantity: number;
  onQuantityChange?: (quantity: number) => void;
};

const STEP_BUTTON_CLASSES =
  'flex size-11 items-center justify-center border border-current font-body text-lg enabled:hover:border-field-magenta enabled:hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta disabled:cursor-not-allowed disabled:opacity-40 dark:enabled:hover:border-field-cyan dark:enabled:hover:text-field-cyan dark:focus-visible:outline-field-cyan';

export function QuantitySelector({ maxQuantity, onQuantityChange }: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);
  const canDecrease = quantity > 1;
  const canIncrease = quantity < maxQuantity;

  function updateQuantity(nextQuantity: number) {
    setQuantity(nextQuantity);
    onQuantityChange?.(nextQuantity);
  }

  return (
    <div role="group" aria-label="Cantidad" className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => updateQuantity(quantity - 1)}
        disabled={!canDecrease}
        aria-label="Restar uno"
        className={STEP_BUTTON_CLASSES}
      >
        −
      </button>
      <span aria-live="polite" className="font-body min-w-6 text-center text-sm">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => updateQuantity(quantity + 1)}
        disabled={!canIncrease}
        aria-label="Sumar uno"
        className={STEP_BUTTON_CLASSES}
      >
        +
      </button>
    </div>
  );
}
