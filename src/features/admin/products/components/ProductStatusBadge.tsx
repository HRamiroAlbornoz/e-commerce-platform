import { STATUS_BADGE_BASE_CLASSES } from '@/components/ui/statusBadgeClasses';

const ACTIVE_CLASSES = `${STATUS_BADGE_BASE_CLASSES} border border-current`;
const RETIRED_CLASSES = `${STATUS_BADGE_BASE_CLASSES} border border-current line-through`;

type ProductStatusBadgeProps = {
  isActive: boolean;
};

export function ProductStatusBadge({ isActive }: ProductStatusBadgeProps) {
  return (
    <span className={isActive ? ACTIVE_CLASSES : RETIRED_CLASSES}>
      {isActive ? 'Activo' : 'Retirado'}
    </span>
  );
}
