interface SparklineProps {
  /** Valores de la serie (de más antiguo a más reciente). */
  values: number[];
  /** Color del trazo. */
  color?: string;
  /** Valor máximo de referencia para escalar; por defecto el máximo de la serie. */
  max?: number;
  width?: number;
  height?: number;
}

/**
 * Mini-gráfico de línea con SVG plano (sin librerías). Pinta puntos y área
 * tenue bajo la curva. Pensado para tendencias de 7 días.
 */
export default function Sparkline({
  values,
  color = '#0d9488',
  max,
  width = 160,
  height = 40,
}: SparklineProps) {
  if (values.length === 0) {
    return <div style={{ width, height }} className="flex items-center text-xs text-gray-300">Sin datos</div>;
  }

  const pad = 3;
  const maxVal = max ?? Math.max(...values, 1);
  const denom = maxVal === 0 ? 1 : maxVal;
  const n = values.length;
  const stepX = n > 1 ? (width - pad * 2) / (n - 1) : 0;

  const points = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = height - pad - (v / denom) * (height - pad * 2);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[n - 1].x.toFixed(1)} ${height - pad} L ${points[0].x.toFixed(1)} ${height - pad} Z`;
  const last = points[n - 1];

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={areaPath} fill={color} opacity={0.08} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={2.5} fill={color} />
    </svg>
  );
}
