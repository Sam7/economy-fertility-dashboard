import { useEffect, useRef, useState, type MouseEvent } from 'react';

export interface ChartPoint {
  year: number;
  value: number;
}

export interface ChartSeries {
  name: string;
  color: string;
  data: ChartPoint[];
}

interface ChartProps {
  series: ChartSeries[];
  label: string;
  formatY?: (value: number) => string;
  tooltipY?: (value: number) => string;
  height?: number;
}

const GRID_COLOR = '#ded9cf';
const TEXT_COLOR = '#77736a';
const YEARS = [2026, 2050, 2075, 2100, 2126];

export function LineChart({ series, label, formatY, tooltipY, height = 320 }: ChartProps) {
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(900);
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const measure = () => {
      const measured = Math.round(wrapper.clientWidth);
      if (measured > 0) setWidth((previous) => previous === measured ? previous : measured);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);
  const chartHeight = width < 560 ? (height < 320 ? 220 : 260) : height;
  const margin = width < 560
    ? { top: 18, right: 12, bottom: 34, left: 43 }
    : { top: 24, right: 24, bottom: 42, left: 62 };
  const values = series.flatMap((line) => line.data.map((point) => point.value)).filter(Number.isFinite);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    min = 0;
    max = 1;
  }
  if (max === min) {
    max += 1;
    min -= 1;
  }
  const pad = (max - min) * 0.08;
  max += pad;
  min -= pad * 0.35;
  const x = (year: number) => margin.left + (year - 2026) / 100 * (width - margin.left - margin.right);
  const y = (value: number) => margin.top + (max - value) / (max - min) * (chartHeight - margin.top - margin.bottom);
  const activePoints = hoverYear == null ? [] : series.map((line) => line.data[hoverYear - 2026]);
  const nearestY = activePoints.length ? Math.min(...activePoints.map((point) => y(point.value))) : 0;

function handleMove(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const localX = (event.clientX - rect.left) / rect.width * width;
    const year = Math.max(2026, Math.min(2126, Math.round(2026 + (localX - margin.left) / (width - margin.left - margin.right) * 100)));
    setHoverYear(year);
  }

  return (
    <div ref={wrapperRef} className={`line-chart-wrap ${height < 320 ? 'small' : ''}`}>
      <svg className="line-chart" viewBox={`0 0 ${width} ${chartHeight}`} role="img" aria-label={label} onMouseMove={handleMove} onMouseLeave={() => setHoverYear(null)}>
        {Array.from({ length: 5 }, (_, index) => {
          const value = min + (max - min) * index / 4;
          const yy = y(value);
          return (
            <g key={`tick-${index}`}>
              <line x1={margin.left} x2={width - margin.right} y1={yy} y2={yy} stroke={GRID_COLOR} strokeWidth="1" />
              <text x={margin.left - 10} y={yy + 4} textAnchor="end" fontSize="11" fill={TEXT_COLOR}>{formatY?.(value) ?? value.toLocaleString('en-US', { maximumFractionDigits: 1 })}</text>
            </g>
          );
        })}
        {YEARS.map((year) => (
          <text key={year} x={x(year)} y={chartHeight - 14} textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>{year}</text>
        ))}
        {series.map((line) => {
          const path = line.data.map((point, index) => `${index ? 'L' : 'M'} ${x(point.year).toFixed(2)} ${y(point.value).toFixed(2)}`).join(' ');
          return <path key={line.name} d={path} fill="none" stroke={line.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />;
        })}
        {hoverYear != null && (
          <g aria-hidden="true">
            <line x1={x(hoverYear)} x2={x(hoverYear)} y1={margin.top} y2={chartHeight - margin.bottom} stroke="#8c877e" strokeDasharray="3 4" />
            {series.map((line) => {
              const point = line.data[hoverYear - 2026];
              return <circle key={line.name} cx={x(hoverYear)} cy={y(point.value)} r="4" fill={line.color} stroke="#fff" strokeWidth="2" />;
            })}
          </g>
        )}
      </svg>
      {hoverYear != null && (
        <div className="chart-tooltip" style={{ left: `${x(hoverYear) / width * 100}%`, top: `${nearestY / chartHeight * 100}%` }}>
          <b>{hoverYear}</b>
          {series.map((line) => (
            <div key={line.name}><span style={{ color: line.color }}>●</span> {line.name}: <b>{tooltipY?.(line.data[hoverYear - 2026].value) ?? line.data[hoverYear - 2026].value.toLocaleString('en-US')}</b></div>
          ))}
        </div>
      )}
    </div>
  );
}
