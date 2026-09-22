import { Button } from '@/components/ui/Button';

type PaginationControlsProps = {
  page: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
};

export function PaginationControls({ page, hasNextPage, onPageChange }: PaginationControlsProps) {
  return (
    <nav
      aria-label="Paginación del catálogo"
      className="mt-10 flex items-center justify-between border-t border-ink/15 pt-6 dark:border-bone/15"
    >
      <Button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Anterior
      </Button>
      <p aria-live="polite" className="font-body text-xs text-ink/70 dark:text-bone/70">
        Página {page}
      </p>
      <Button onClick={() => onPageChange(page + 1)} disabled={!hasNextPage}>
        Siguiente
      </Button>
    </nav>
  );
}
