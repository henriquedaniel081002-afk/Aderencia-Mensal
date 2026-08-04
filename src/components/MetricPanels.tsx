import { useId } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  Flag,
  Info,
  Scale,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { MotionConfig, motion, useReducedMotion } from 'motion/react';
import { cn } from '../lib/utils';

export type MetricTrend = 'up' | 'down';

export type MetricPanelsProps = {
  adherence: {
    value: string;
    trend: MetricTrend;
  };
  goal: {
    value: string;
    percent: number;
  };
  auxiliary: {
    programmedAverage: string;
    producedAverage: string;
    producedAverageTrend: MetricTrend;
    workingDays: string;
  };
  operational: {
    partialProgrammed: string;
    partialProduced: string;
    partialProducedTrend: MetricTrend;
    totalProgrammed: string;
  };
};

export function MetricPanels({ adherence, goal, auxiliary, operational }: MetricPanelsProps) {
  const prefersReducedMotion = useReducedMotion();
  const entrance = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 };
  const transition = { duration: prefersReducedMotion ? 0 : 0.28, ease: 'easeOut' as const };

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-3.5">
        <div className="metrics-main-grid">
          <motion.div initial={entrance} animate={{ opacity: 1, y: 0 }} transition={transition}>
            <AdherenceSignal value={adherence.value} trend={adherence.trend} />
          </motion.div>

          <motion.div
            initial={entrance}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: prefersReducedMotion ? 0 : 0.04 }}
          >
            <GoalSignal value={goal.value} percent={goal.percent} />
          </motion.div>

          <motion.aside
            initial={entrance}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: prefersReducedMotion ? 0 : 0.08 }}
            className="auxiliary-panel"
            aria-labelledby="auxiliary-metrics-title"
          >
            <h3 id="auxiliary-metrics-title" className="metric-card-kicker text-text-primary">Indicadores auxiliares</h3>
            <div className="auxiliary-panel__grid">
              <CompactMetric
                title="Média Programada"
                value={auxiliary.programmedAverage}
                description="Programado parcial / dias úteis"
                icon={Scale}
                accent="blue"
              />
              <CompactMetric
                title="Média Produzida"
                value={auxiliary.producedAverage}
                description="Produzido parcial / dias úteis"
                icon={TrendingUp}
                trend={auxiliary.producedAverageTrend}
                accent="green"
              />
              <CompactMetric
                title="Dias Úteis"
                value={auxiliary.workingDays}
                description="Dias com registro no apontamento"
                icon={CalendarDays}
                accent="amber"
              />
            </div>
          </motion.aside>
        </div>

        <motion.section
          initial={entrance}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: prefersReducedMotion ? 0 : 0.1 }}
          className="operational-panel"
          aria-labelledby="operational-metrics-title"
        >
          <div className="operational-panel__heading">
            <span className="operational-panel__heading-icon" aria-hidden="true">
              <BarChart3 className="size-5" />
            </span>
            <h3 id="operational-metrics-title">Volumes<br />do período</h3>
          </div>

          <OperationalMetric
            title="Programado Parcial"
            value={operational.partialProgrammed}
            description="Programado até o dia anterior"
            icon={CalendarRange}
          />
          <OperationalMetric
            title="Produzido Parcial"
            value={operational.partialProduced}
            description="Produzido até o dia anterior"
            icon={CalendarRange}
            trend={operational.partialProducedTrend}
          />
          <OperationalMetric
            title="Programado Total"
            value={operational.totalProgrammed}
            description="Programação completa do mês"
            icon={Flag}
          />
        </motion.section>
      </div>
    </MotionConfig>
  );
}

function AdherenceSignal({ value, trend }: { value: string; trend: MetricTrend }) {
  const titleId = useId();
  const descriptionId = useId();
  const isPositive = trend === 'up';
  const numeric = Number(value.replace('%', '').replace('.', '').replace(',', '.'));
  const progress = Number.isFinite(numeric) ? Math.min(Math.max(numeric / 150 * 100, 0), 100) : 0;

  return (
    <article
      className={cn('adherence-card', isPositive ? 'adherence-card--positive' : 'adherence-card--negative')}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="relative z-10">
        <h3 id={titleId} className={cn('metric-card-kicker', isPositive ? 'text-status-success' : 'text-status-danger')}>
          Aderência mensal
        </h3>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <span className={cn('metric-hero-value', isPositive ? 'text-status-success' : 'text-status-danger')}>{value}</span>
          <TrendBadge trend={trend} />
        </div>
      </div>

      <svg className="adherence-card__spark" viewBox="0 0 260 95" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="sparkFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.48" stopColor="currentColor" stopOpacity="0.05" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.62" />
          </linearGradient>
        </defs>
        <path d="M0 78 C42 78 67 76 92 75 C126 74 132 65 150 49 C169 32 178 25 204 15 C225 7 241 8 260 5" fill="none" stroke="url(#sparkFade)" strokeWidth="2" strokeDasharray="3 4" />
      </svg>

      <div className="relative z-10 mt-auto">
        <div className="metric-progress metric-progress--green">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="metric-progress-labels"><span>0%</span><span>100%</span><span>150%</span></div>
        <p id={descriptionId} className="metric-description">
          <Info className="size-3.5" aria-hidden="true" />
          Produzido parcial / programado parcial
        </p>
      </div>
    </article>
  );
}

function GoalSignal({ value, percent }: { value: string; percent: number }) {
  const titleId = useId();
  const descriptionId = useId();
  const safePercent = Number.isFinite(percent) ? Math.min(Math.max(percent, 0), 100) : 0;

  return (
    <article className="goal-card" aria-labelledby={titleId} aria-describedby={descriptionId}>
      <div className="relative z-10">
        <h3 id={titleId} className="metric-card-kicker text-status-planned">Alcance de meta</h3>
        <span className="metric-hero-value mt-4 block text-white">{value}</span>
      </div>

      <div className="target-graphic" aria-hidden="true">
        <span className="target-ring target-ring--1" />
        <span className="target-ring target-ring--2" />
        <span className="target-ring target-ring--3" />
        <span className="target-dot" />
        <span className="target-arrow">➤</span>
      </div>

      <div className="relative z-10 mt-auto">
        <div className="metric-progress metric-progress--blue" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safePercent}>
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: `${safePercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <p id={descriptionId} className="metric-description mt-5">
          <Info className="size-3.5" aria-hidden="true" />
          Produzido parcial / programado total
        </p>
      </div>
    </article>
  );
}

function CompactMetric({
  title,
  value,
  description,
  icon: Icon,
  trend,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: MetricTrend;
  accent: 'blue' | 'green' | 'amber';
}) {
  return (
    <article className="auxiliary-metric">
      <span className={`auxiliary-metric__icon auxiliary-metric__icon--${accent}`} aria-hidden="true">
        <Icon className="size-[19px]" />
      </span>
      <h4>{title}</h4>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="auxiliary-metric__value">{value}</span>
        {trend && <TrendBadge trend={trend} compact />}
      </div>
      <p>{description}</p>
    </article>
  );
}

function OperationalMetric({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: MetricTrend;
}) {
  return (
    <article className="operational-metric">
      <div className="min-w-0">
        <h4>{title}</h4>
        <div className="mt-2.5 flex flex-wrap items-center gap-3">
          <span className="operational-metric__value">{value}</span>
          {trend && <TrendBadge trend={trend} />}
        </div>
        <p className="metric-description mt-2.5">
          {description}
          <Info className="size-3.5" aria-hidden="true" />
        </p>
      </div>
      <span className="operational-metric__icon" aria-hidden="true">
        <Icon className="size-6" />
      </span>
    </article>
  );
}

function TrendBadge({ trend, compact = false }: { trend: MetricTrend; compact?: boolean }) {
  const isPositive = trend === 'up';
  return (
    <span className={cn('trend-badge', compact ? 'trend-badge--compact' : '', isPositive ? 'trend-badge--positive' : 'trend-badge--negative')}>
      {isPositive ? <TrendingUp className="size-3.5" aria-hidden="true" /> : <TrendingDown className="size-3.5" aria-hidden="true" />}
      {isPositive ? 'Acima' : 'Abaixo'}
    </span>
  );
}
