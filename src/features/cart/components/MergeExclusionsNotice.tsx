import type { MergeExclusion } from '@/features/cart/utils/mergeGuestCart';

type MergeExclusionsNoticeProps = {
  exclusions: MergeExclusion[];
  onDismiss: () => void;
};

const REASON_LABELS: Record<MergeExclusion['reason'], string> = {
  inactive: 'ya no está disponible',
  'out-of-stock': 'se quedó sin stock',
};

export function MergeExclusionsNotice({ exclusions, onDismiss }: MergeExclusionsNoticeProps) {
  if (exclusions.length === 0) {
    return null;
  }

  return (
    <div
      role="alert"
      className="mb-8 flex flex-col gap-3 border border-ink/15 px-4 py-4 dark:border-bone/15"
    >
      <p className="font-body text-sm text-ink dark:text-bone">
        Al iniciar sesion, algunos productos no se pudieron conservar:
      </p>
      <ul className="font-body flex flex-col gap-1 text-sm text-ink/70 dark:text-bone/70">
        {exclusions.map((exclusion) => (
          <li key={exclusion.productId}>
            {exclusion.productName} — {REASON_LABELS[exclusion.reason]}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onDismiss}
        className="font-body self-start border-b border-ink text-xs font-medium tracking-wide text-ink uppercase hover:border-field-magenta hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:border-bone dark:text-bone dark:hover:border-field-cyan dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
      >
        Entendido
      </button>
    </div>
  );
}
