import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm, useWatch, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Textarea } from '@/components/ui/Textarea';
import { InlineError } from '@/components/ui/InlineError';
import { ProductSpecsFieldArray } from '@/features/admin/products/components/ProductSpecsFieldArray';
import { ImageUploadField } from '@/features/admin/products/components/ImageUploadField';
import { FIELD_LABEL_CLASSES } from '@/features/admin/products/constants/formFieldClasses';
import {
  useImageUpload,
  type ImageUploadState,
} from '@/features/admin/uploads/hooks/useImageUpload';
import { CATEGORY_LABELS } from '@/features/products/constants/categoryLabels';
import { DISPLAY_COLOR_LABELS } from '@/features/admin/products/constants/displayColorLabels';
import { createProduct } from '@/features/admin/products/services/createProduct';
import { updateProduct } from '@/features/admin/products/services/updateProduct';
import {
  createProductRequestSchema,
  PRODUCT_CATEGORIES,
  PRODUCT_DISPLAY_COLORS,
  type CreateProductRequest,
  type Product,
} from '@shared/schemas/product';
import type { SubmitState } from '@/lib/asyncSubmitState';

const SELECT_CLASSES =
  'border-b border-ink/50 bg-transparent py-2 font-body text-sm text-ink outline-none focus-visible:border-field-magenta dark:border-bone/40 dark:text-bone dark:focus-visible:border-field-cyan';

type AdminProductFormProps = {
  user: User;
  existingProduct: Product | null;
};

type ProductImageFieldProps = {
  control: Control<CreateProductRequest>;
  uploadState: ImageUploadState;
  onFileSelected: (file: File) => void;
  error: string | undefined;
};

function ProductImageField({
  control,
  uploadState,
  onFileSelected,
  error,
}: ProductImageFieldProps) {
  const imageUrl = useWatch({ control, name: 'imageUrl' });

  return (
    <ImageUploadField
      currentImageUrl={imageUrl}
      state={uploadState}
      onFileSelected={onFileSelected}
      error={error}
    />
  );
}

function isImageUploadInProgress(state: ImageUploadState): boolean {
  return state.status === 'requesting-url' || state.status === 'uploading';
}

function toFormDefaults(product: Product | null): CreateProductRequest {
  if (!product) {
    return {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: 'keyboard',
      displayColor: 'lime',
      imageUrl: '',
      specs: [{ label: '', value: '' }],
      curatorialNote: '',
    };
  }

  return {
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.category,
    displayColor: product.displayColor,
    imageUrl: product.imageUrl,
    specs: product.specs,
    curatorialNote: product.curatorialNote,
  };
}

export function AdminProductForm({ user, existingProduct }: AdminProductFormProps) {
  const navigate = useNavigate();
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const { state: imageUploadState, upload: uploadImage } = useImageUpload(user);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductRequest>({
    resolver: zodResolver(createProductRequestSchema),
    mode: 'onTouched',
    defaultValues: toFormDefaults(existingProduct),
  });

  const isBusy =
    isSubmitting ||
    submitState.status === 'submitting' ||
    isImageUploadInProgress(imageUploadState);

  async function handleImageFileSelected(file: File): Promise<void> {
    const result = await uploadImage(file);
    if (result.ok) {
      setValue('imageUrl', result.publicUrl, { shouldValidate: true, shouldDirty: true });
    }
  }

  async function handleValid(values: CreateProductRequest): Promise<void> {
    setSubmitState({ status: 'submitting' });

    const result = existingProduct
      ? await updateProduct(user, { productId: existingProduct.id, changes: values })
      : await createProduct(user, values);

    if (!result.ok) {
      setSubmitState({ status: 'error', message: result.message });
      return;
    }

    void navigate('/admin/products');
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(handleValid)(event)}
      noValidate
      className="flex flex-col gap-6"
    >
      <fieldset disabled={isBusy} className="contents">
        <h1 className="font-display text-2xl text-ink dark:text-bone">
          {existingProduct ? `Editar "${existingProduct.name}"` : 'Nuevo producto'}
        </h1>

        <TextField label="Nombre" error={errors.name?.message} {...register('name')} />
        <Textarea
          label="Descripción"
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex flex-wrap gap-4">
          <TextField
            label="Precio"
            type="number"
            step="0.01"
            min="0.01"
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />
          <TextField
            label="Stock"
            type="number"
            step="1"
            min="0"
            error={errors.stock?.message}
            {...register('stock', { valueAsNumber: true })}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="product-category" className={FIELD_LABEL_CLASSES}>
              Categoría
            </label>
            <select id="product-category" className={SELECT_CLASSES} {...register('category')}>
              {PRODUCT_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="product-display-color" className={FIELD_LABEL_CLASSES}>
              Color de referencia
            </label>
            <select
              id="product-display-color"
              className={SELECT_CLASSES}
              {...register('displayColor')}
            >
              {PRODUCT_DISPLAY_COLORS.map((value) => (
                <option key={value} value={value}>
                  {DISPLAY_COLOR_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ProductImageField
          control={control}
          uploadState={imageUploadState}
          onFileSelected={(file) => void handleImageFileSelected(file)}
          error={errors.imageUrl?.message}
        />

        <ProductSpecsFieldArray control={control} register={register} errors={errors} />

        <Textarea
          label="Nota curatorial"
          rows={4}
          error={errors.curatorialNote?.message}
          {...register('curatorialNote')}
        />

        <div aria-live="polite">
          <InlineError message={submitState.status === 'error' ? submitState.message : null} />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" isLoading={isBusy} loadingLabel="Guardando…">
            {existingProduct ? 'Guardar cambios' : 'Crear producto'}
          </Button>
          <Link
            to="/admin/products"
            className="font-body border-b border-transparent text-xs font-medium tracking-widest text-ink uppercase hover:border-field-magenta hover:text-field-magenta dark:text-bone dark:hover:border-field-cyan dark:hover:text-field-cyan"
          >
            Volver
          </Link>
        </div>
      </fieldset>
    </form>
  );
}
