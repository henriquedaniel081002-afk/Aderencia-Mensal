import type { ReactNode } from 'react';
import { CalendarDays, ChevronDown, Clock3, LogOut } from 'lucide-react';
import itamTransformadoresLogo from '../assets/itam-transformadores-logo.png';

type HeaderProps = {
  period: string;
  generatedAt: string;
  onLogout: () => void;
};

function formatarDataBase(generatedAt: string) {
  const data = new Date(generatedAt);
  if (Number.isNaN(data.getTime())) return generatedAt;

  const dia = data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const hora = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dia} às ${hora}`;
}

function HeaderCard({
  icon,
  label,
  children,
  accent = false,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="header-card">
      <span className={accent ? 'text-status-success' : 'text-status-planned'} aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <p className="header-card__label">{label}</p>
        <div className="header-card__value">{children}</div>
      </div>
    </div>
  );
}

export function Header({ period, generatedAt, onLogout }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="flex min-w-0 items-center gap-6">
        <div className="flex shrink-0 items-center" aria-label="ITAM Transformadores">
          <img
            src={itamTransformadoresLogo}
            alt="ITAM Transformadores"
            className="h-auto max-h-[60px] w-[110px] select-none object-contain sm:w-[128px] lg:max-h-[66px] lg:w-[138px]"
            draggable={false}
          />
        </div>

        <span className="hidden h-10 w-px bg-border-subtle lg:block" aria-hidden="true" />

        <div className="min-w-0">
          <h1 className="truncate text-[22px] font-extrabold leading-7 tracking-[-0.035em] text-white lg:text-[25px]">
            Aderência Mensal de Produção
          </h1>
          <p className="mt-0.5 hidden truncate text-[12px] text-text-secondary sm:block">
            Comparativo entre programação e produção realizada
          </p>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="hidden xl:block">
          <HeaderCard icon={<CalendarDays className="size-[17px]" />} label="Período" accent>
            <span>{period}</span>
            <ChevronDown className="ml-4 size-4 text-text-secondary" aria-hidden="true" />
          </HeaderCard>
        </div>

        <div className="hidden lg:block">
          <HeaderCard icon={<Clock3 className="size-[17px]" />} label="Atualizado em">
            <time dateTime={generatedAt}>{formatarDataBase(generatedAt)}</time>
          </HeaderCard>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="header-logout-button"
          title="Sair"
          aria-label="Sair do dashboard"
        >
          <LogOut className="size-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
