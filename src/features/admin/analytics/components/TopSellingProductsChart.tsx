import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import type { Product } from '@shared/schemas/product';

type TopSellingProductsChartProps = {
  products: Product[];
};

export function TopSellingProductsChart({ products }: TopSellingProductsChartProps) {
  const data = products.map((product) => ({ name: product.name, unitsSold: product.unitsSold }));

  return (
    <div className="h-64 text-ink dark:text-bone">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 32, bottom: 8, left: 8 }}>
          <CartesianGrid horizontal={false} stroke="currentColor" strokeOpacity={0.15} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: 'currentColor' }}
            stroke="currentColor"
            strokeOpacity={0.3}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={160}
            tick={{ fill: 'currentColor' }}
            stroke="currentColor"
            strokeOpacity={0.3}
          />
          <Bar dataKey="unitsSold" fill="currentColor" isAnimationActive={false}>
            <LabelList dataKey="unitsSold" position="right" fill="currentColor" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
