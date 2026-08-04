import { useId } from 'react';
import type { ReactNode } from 'react';
import { ChartNoAxesCombined, Info } from 'lucide-react';
import { MotionConfig, motion, useReducedMotion } from 'motion/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type EvolutionItem = {
  dia: string;
  data: string;
  programado: number;
  produzido: number;
};

type TooltipPayload = { payload?: EvolutionItem };
type DailyTooltipProps = { active?: boolean; payload?: TooltipPayload[] };
type LegendItem = { label: string; color: string };

const formatInteger = (value: number) => Math.round(value).toLocaleString('pt-BR');
const formatBarLabel = (value: number) => (value === 0 ? '' : formatInteger(value));

function formatReceivedDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function sanitizeSvgId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function EvolutionChart({ data, mesLabel }: { data: EvolutionItem[]; mesLabel: string }) {
  const prefersReducedMotion = useReducedMotion();
  const rawId = sanitizeSvgId(useId());
  const chartMinWidth = Math.max(940, data.length * 58);
  const animationDuration = prefersReducedMotion ? 0 : 650;

  const ids = {
    programmedGradient: `programmed-gradient-${rawId}`,
    producedSuccessGradient: `produced-success-gradient-${rawId}`,
    producedDangerGradient: `produced-danger-gradient-${rawId}`,
    programmedGlow: `programmed-glow-${rawId}`,
    successGlow: `success-glow-${rawId}`,
    dangerGlow: `danger-glow-${rawId}`,
  };

  return (
    <ChartShell
      title="Evolução diária"
      subtitle="Comparativo diário entre programado e produzido"
      legend={[
        { label: 'Programado', color: '#2f7df4' },
        { label: 'Produzido', color: '#29d6a2' },
      ]}
    >
      {data.length === 0 ? (
        <EmptyChartState />
      ) : (
        <div className="evolution-chart-layout">
          <div
            className="chart-scrollbar evolution-chart-scroll"
            tabIndex={0}
            role="region"
            aria-label={`Gráfico de evolução diária de ${mesLabel}`}
          >
            <div className="evolution-chart-canvas" style={{ minWidth: chartMinWidth }}>
              <div
                className="evolution-difference-grid"
                style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
                aria-hidden="true"
              >
                {data.map((item) => {
                  if (item.produzido <= 0) {
                    return <div className="evolution-difference-grid__cell" key={item.data} />;
                  }

                  const difference = item.produzido - item.programado;
                  const status = difference < 0 ? 'danger' : difference > 0 ? 'success' : 'neutral';
                  const label = difference > 0
                    ? `+${formatInteger(difference)}`
                    : formatInteger(difference);

                  return (
                    <div className="evolution-difference-grid__cell" key={item.data}>
                      <span className={`evolution-difference-badge evolution-difference-badge--${status}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart
                  data={data}
                  margin={{ top: 52, right: 18, left: 0, bottom: 4 }}
                  barGap={5}
                  barCategoryGap="25%"
                  accessibilityLayer
                >
                  <defs>
                    <linearGradient id={ids.programmedGradient} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#52a2ff" />
                      <stop offset="42%" stopColor="#2f7df4" />
                      <stop offset="100%" stopColor="#1554c5" />
                    </linearGradient>
                    <linearGradient id={ids.producedSuccessGradient} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#66f09b" />
                      <stop offset="42%" stopColor="#2dd6a0" />
                      <stop offset="100%" stopColor="#12966e" />
                    </linearGradient>
                    <linearGradient id={ids.producedDangerGradient} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff7b78" />
                      <stop offset="42%" stopColor="#f05252" />
                      <stop offset="100%" stopColor="#bd2e37" />
                    </linearGradient>
                    <filter id={ids.programmedGlow} x="-80%" y="-30%" width="260%" height="180%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#2f7df4" floodOpacity="0.34" />
                    </filter>
                    <filter id={ids.successGlow} x="-80%" y="-30%" width="260%" height="180%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#2dd6a0" floodOpacity="0.36" />
                    </filter>
                    <filter id={ids.dangerGlow} x="-80%" y="-30%" width="260%" height="180%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef5350" floodOpacity="0.34" />
                    </filter>
                  </defs>

                  <CartesianGrid
                    stroke="#24374d"
                    strokeDasharray="2 8"
                    strokeOpacity={0.46}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="dia"
                    tick={{ fill: '#edf3fa', fontSize: 11, fontWeight: 750 }}
                    axisLine={{ stroke: '#263b53', strokeOpacity: 0.78 }}
                    tickLine={false}
                    tickMargin={13}
                    interval={0}
                    minTickGap={0}
                  />
                  <YAxis
                    tick={{ fill: '#8fa1b7', fontSize: 11, fontWeight: 650 }}
                    tickFormatter={formatInteger}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    width={56}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<DailyTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.028)', radius: 10 }}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="programado"
                    name="Programado"
                    fill={`url(#${ids.programmedGradient})`}
                    radius={[7, 7, 2, 2]}
                    maxBarSize={23}
                    filter={`url(#${ids.programmedGlow})`}
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={animationDuration}
                  >
                    <LabelList
                      dataKey="programado"
                      position="top"
                      offset={7}
                      fill="#f7f9fc"
                      fontSize={10}
                      fontWeight={800}
                      formatter={formatBarLabel}
                    />
                  </Bar>
                  <Bar
                    dataKey="produzido"
                    name="Produzido"
                    radius={[7, 7, 2, 2]}
                    maxBarSize={23}
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={animationDuration}
                  >
                    {data.map((item) => {
                      const reachedTarget = item.produzido >= item.programado;
                      return (
                        <Cell
                          key={item.data}
                          fill={`url(#${reachedTarget ? ids.producedSuccessGradient : ids.producedDangerGradient})`}
                          filter={`url(#${reachedTarget ? ids.successGlow : ids.dangerGlow})`}
                          opacity={item.produzido === 0 ? 0.22 : 1}
                        />
                      );
                    })}
                    <LabelList
                      dataKey="produzido"
                      position="top"
                      offset={7}
                      fill="#f7f9fc"
                      fontSize={10}
                      fontWeight={800}
                      formatter={formatBarLabel}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="evolution-chart-note" role="note">
            <Info className="size-3.5" aria-hidden="true" />
            <span>Barras verdes indicam dias acima da programação. Barras vermelhas indicam dias abaixo da programação.</span>
          </div>
        </div>
      )}
    </ChartShell>
  );
}

function ChartShell({
  title,
  subtitle,
  legend,
  children,
}: {
  title: string;
  subtitle: string;
  legend: LegendItem[];
  children: ReactNode;
}) {
  const titleId = useId();
  const subtitleId = useId();
  const prefersReducedMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: 'easeOut' }}
        className="evolution-panel"
        aria-labelledby={titleId}
        aria-describedby={subtitleId}
      >
        <header className="evolution-panel__header">
          <div className="evolution-panel__heading">
            <span className="evolution-panel__icon" aria-hidden="true">
              <ChartNoAxesCombined className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 id={titleId}>{title}</h2>
              <p id={subtitleId}>{subtitle}</p>
            </div>
          </div>

          <ul className="evolution-panel__legend" aria-label="Legenda do gráfico">
            {legend.map(({ label, color }) => (
              <li key={label}>
                <span style={{ backgroundColor: color }} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

        </header>
        <div className="evolution-panel__content">{children}</div>
      </motion.section>
    </MotionConfig>
  );
}

function EmptyChartState() {
  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-bg-main/30 px-6 text-center" role="status">
      <ChartNoAxesCombined className="mb-3 size-7 text-text-secondary" aria-hidden="true" />
      <p className="text-sm font-bold text-white">Nenhum registro para exibir</p>
      <p className="mt-1 text-xs text-text-secondary">Não há programação nem apontamento para os filtros selecionados.</p>
    </div>
  );
}

function DailyTooltip({ active, payload }: DailyTooltipProps) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;

  const diferenca = item.produzido - item.programado;
  const atingiuMeta = item.programado > 0 && item.produzido >= item.programado;
  const aderencia = item.programado > 0 ? (item.produzido / item.programado) * 100 : null;
  const statusLabel = atingiuMeta ? 'Acima da programação' : 'Abaixo da programação';
  const statusClass = atingiuMeta ? 'daily-tooltip__status--success' : 'daily-tooltip__status--danger';
  const diferencaTexto = diferenca > 0
    ? `+${formatInteger(diferenca)}`
    : formatInteger(diferenca);

  return (
    <div className="daily-tooltip">
      <div className="daily-tooltip__header">
        <div>
          <span>Resultado diário</span>
          <strong>{formatReceivedDate(item.data)}</strong>
        </div>
        <span className={`daily-tooltip__status ${statusClass}`}>{statusLabel}</span>
      </div>

      <div className="daily-tooltip__metrics">
        <div>
          <span><i className="daily-tooltip__dot daily-tooltip__dot--planned" />Programado</span>
          <strong>{formatInteger(item.programado)}</strong>
        </div>
        <div>
          <span><i className={`daily-tooltip__dot ${atingiuMeta ? 'daily-tooltip__dot--success' : 'daily-tooltip__dot--danger'}`} />Produzido</span>
          <strong>{formatInteger(item.produzido)}</strong>
        </div>
      </div>

      <div className="daily-tooltip__summary">
        <div>
          <span>Diferença</span>
          <strong className={diferenca >= 0 ? 'text-status-success' : 'text-status-danger'}>{diferencaTexto}</strong>
        </div>
        <div>
          <span>Aderência</span>
          <strong className={atingiuMeta ? 'text-status-success' : 'text-status-danger'}>
            {aderencia === null ? '—' : `${aderencia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}
          </strong>
        </div>
      </div>
    </div>
  );
}
