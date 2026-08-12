import { useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  Box,
  CalendarDays,
  ClipboardList,
  Info,
  UsersRound,
} from 'lucide-react';
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
import type { DetalheProducao, Falta, Observacao } from '../components/DayDetailModal';
import { EpoxiDayDetailModal } from '../components/EpoxiDayDetailModal';

const fmt = (value: number) => Math.round(value).toLocaleString('pt-BR');
const fmtDate = (value: string) => {
  const [y,m,d] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(y,m-1,d));
};

function sanitizeSvgId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function EpoxiDashboard({
  mes,
  turno,
  detalhes,
  faltas,
  observacoes,
}: {
  mes: string;
  turno: string;
  detalhes: DetalheProducao[];
  faltas: Falta[];
  observacoes: Observacao[];
}) {
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const rawId = sanitizeSvgId(useId());
  const gradientId = `epoxi-gradient-${rawId}`;
  const glowId = `epoxi-glow-${rawId}`;

  const calculado = useMemo(() => {
    const producao = detalhes.filter(r => r.data.startsWith(mes) && r.setor === 'EPOXI' && r.linha === 'EPO');
    const faltasFiltradas = faltas.filter(r => r.data.startsWith(mes) && r.setor === 'EPOXI' && r.linha === 'EPO' && (turno === 'Todos' || r.turno === turno));
    const obs = observacoes.filter(r => r.data.startsWith(mes) && r.setor === 'EPOXI' && r.linha === 'EPO');
    const [ano, numeroMes] = mes.split('-').map(Number);
    const diasMes = new Date(ano, numeroMes, 0).getDate();
    const porDia = Array.from({length:diasMes},(_,i)=>{
      const data = `${mes}-${String(i+1).padStart(2,'0')}`;
      const produzido = producao.filter(r=>r.data===data).reduce((acc,r)=>acc+Number(r.quantidade||0),0);
      return {dia:String(i+1).padStart(2,'0'), data, produzido};
    });
    const totalProduzido = producao.reduce((acc,r)=>acc+Number(r.quantidade||0),0);
    const diasComProducao = new Set(producao.filter(r=>Number(r.quantidade||0)>0).map(r=>r.data)).size;
    const totalFaltas = faltasFiltradas.reduce((acc,r)=>acc+Number(r.quantidade||0),0);
    return { producao, faltasFiltradas, obs, porDia, totalProduzido, diasComProducao, totalFaltas };
  },[mes,turno,detalhes,faltas,observacoes]);

  const periodo = (() => {
    const [ano, numeroMes] = mes.split('-').map(Number);
    const diasMes = new Date(ano, numeroMes, 0).getDate();
    return `01/${String(numeroMes).padStart(2,'0')}/${ano} a ${String(diasMes).padStart(2,'0')}/${String(numeroMes).padStart(2,'0')}/${ano}`;
  })();

  return (
    <main className="epoxi-dashboard">
      <section className="epoxi-heading">
        <div>
          <div className="epoxi-title-line"><h2>EPOXI</h2><span>•</span><strong>Linha: EPO</strong></div>
          <p>Painel específico com produção, faltas e ocorrências do setor EPOXI.</p>
        </div>
        <div className="epoxi-data-note"><Info className="size-4"/><span>Dados exibidos somente para o setor <b>EPOXI</b> (Linha EPO).</span></div>
      </section>

      <section className="epoxi-kpis">
        <EpoxiKpi icon={Box} label="Produção total" value={fmt(calculado.totalProduzido)} suffix="unidades" tone="green" description="Total produzido no período" />
        <EpoxiKpi icon={CalendarDays} label="Dias com produção" value={fmt(calculado.diasComProducao)} suffix={calculado.diasComProducao === 1 ? 'dia' : 'dias'} tone="blue" description="Dias com pelo menos 1 registro de produção" />
        <EpoxiKpi icon={UsersRound} label="Total de faltas" value={fmt(calculado.totalFaltas)} suffix={calculado.totalFaltas === 1 ? 'falta' : 'faltas'} tone="purple" description={turno==='Todos'?'Total de faltas no período':`Faltas do ${turno} turno`} />
        <EpoxiKpi icon={AlertTriangle} label="Total de ocorrências" value={fmt(calculado.obs.length)} suffix="ocorrências" tone="orange" description="Ocorrências registradas no período" />
      </section>

      <section className="epoxi-chart-row">
        <article className="epoxi-panel epoxi-chart-panel">
          <div className="epoxi-panel-heading">
            <div><h3>Produção por dia</h3><p>Quantidade produzida por dia</p></div>
            <span className="epoxi-view-pill">Visualização: <b>Diária</b></span>
          </div>
          <div className="epoxi-chart-wrap">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={calculado.porDia} margin={{top:28,right:14,left:0,bottom:3}} barCategoryGap="31%" accessibilityLayer>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#56efb2"/>
                    <stop offset="48%" stopColor="#27d6a1"/>
                    <stop offset="100%" stopColor="#11936d"/>
                  </linearGradient>
                  <filter id={glowId} x="-100%" y="-40%" width="300%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#2dd6a0" floodOpacity="0.42" />
                  </filter>
                </defs>
                <CartesianGrid stroke="#24374d" strokeDasharray="2 8" strokeOpacity={0.45} vertical={false}/>
                <XAxis dataKey="dia" tick={{fill:'#dfe8f2',fontSize:10,fontWeight:700}} axisLine={{stroke:'#263b53',strokeOpacity:.8}} tickLine={false} tickMargin={10} interval={0}/>
                <YAxis tick={{fill:'#8395aa',fontSize:10,fontWeight:650}} axisLine={false} tickLine={false} width={36} allowDecimals={false}/>
                <Tooltip content={<EpoxiTooltip/>} cursor={{fill:'rgba(255,255,255,.028)',radius:8}} isAnimationActive={false}/>
                <Bar dataKey="produzido" name="Produzido" fill={`url(#${gradientId})`} radius={[6,6,2,2]} maxBarSize={22} filter={`url(#${glowId})`}>
                  {calculado.porDia.map(item=><Cell key={item.data} opacity={item.produzido > 0 ? 1 : 0} onClick={()=>item.produzido>0&&setDiaSelecionado(item.data)} style={{cursor:item.produzido>0?'pointer':'default'}}/>)}
                  <LabelList dataKey="produzido" position="top" offset={7} fill="#f7f9fc" fontSize={11} fontWeight={800} formatter={(v:number)=>v>0?fmt(v):''}/>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="epoxi-chart-note"><Info className="size-3.5"/><span>Clique em uma coluna com produção para abrir os detalhes completos do dia.</span></div>
        </article>

        <article className="epoxi-panel epoxi-summary-panel">
          <div className="epoxi-panel-heading"><div><h3>Resumo do período</h3><p>Filtros aplicados ao painel</p></div></div>
          <div className="epoxi-summary-list">
            <div><span>Período selecionado</span><strong>{periodo}</strong></div>
            <div><span>Linha</span><strong className="epoxi-chip">EPO</strong></div>
            <div><span>Setor</span><strong className="epoxi-chip">EPOXI</strong></div>
            <div><span>Turno</span><strong>{turno}</strong></div>
          </div>
          <div className="epoxi-summary-foot"><Info className="size-3.5"/> Dados consolidados do mês selecionado.</div>
        </article>
      </section>

      <section className="epoxi-tables">
        <EpoxiTable title="Detalhes de produção" subtitle="Registros de produção do período" icon={ClipboardList} columns={['Data','Potência','Linha','Quantidade']} empty="Nenhum registro de produção no período.">
          {calculado.producao.map((r,i)=><div className="epoxi-table-row epoxi-table-row--production" key={`${r.data}-${r.potencia}-${i}`}><span>{fmtDate(r.data)}</span><span>{r.potencia} kVA</span><span>{r.linha}</span><strong>{fmt(Number(r.quantidade||0))}</strong></div>)}
        </EpoxiTable>

        <EpoxiTable title="Faltas" subtitle="Faltas registradas no período" icon={UsersRound} columns={['Data','Turno','Quantidade']} empty="Nenhuma falta registrada no período.">
          {calculado.faltasFiltradas.map((r,i)=><div className="epoxi-table-row epoxi-table-row--absence" key={`${r.data}-${r.turno}-${i}`}><span>{fmtDate(r.data)}</span><span>{r.turno} turno</span><strong>{fmt(Number(r.quantidade||0))}</strong></div>)}
        </EpoxiTable>

        <EpoxiTable title="Ocorrências / observações" subtitle="Ocorrências registradas no período" icon={AlertTriangle} columns={['Data','Descrição']} empty="Nenhuma ocorrência registrada no período.">
          {calculado.obs.map((r,i)=><div className="epoxi-table-row epoxi-table-row--notes" key={`${r.data}-${i}`}><span>{fmtDate(r.data)}</span><span>{r.observacao ?? r.texto ?? '—'}</span></div>)}
        </EpoxiTable>
      </section>

      {diaSelecionado && <EpoxiDayDetailModal data={diaSelecionado} detalhes={detalhes} faltas={faltas} observacoes={observacoes} turno={turno} onClose={()=>setDiaSelecionado(null)}/>}      
    </main>
  );
}

type IconType = typeof Box;
function EpoxiKpi({icon:Icon,label,value,suffix,tone,description}:{icon:IconType;label:string;value:string;suffix:string;tone:'green'|'blue'|'purple'|'orange';description:string}) {
  return <article className={`epoxi-kpi epoxi-kpi--${tone}`}>
    <div className="epoxi-kpi-icon"><Icon className="size-6"/></div>
    <div><span>{label}</span><div className="epoxi-kpi-value"><strong>{value}</strong><b>{suffix}</b></div><p>{description}</p></div>
  </article>;
}

function EpoxiTable({title,subtitle,icon:Icon,columns,children,empty}:{title:string;subtitle:string;icon:IconType;columns:string[];children:ReactNode;empty:string}) {
  const count = Array.isArray(children) ? children.length : children ? 1 : 0;
  return <article className="epoxi-panel epoxi-table-card">
    <div className="epoxi-table-title"><Icon className="size-4"/><div><h3>{title}</h3><p>{subtitle}</p></div></div>
    <div className={`epoxi-table-head epoxi-table-head--${columns.length}`}>{columns.map(c=><span key={c}>{c}</span>)}</div>
    <div className="epoxi-table-body">{count ? children : <div className="epoxi-table-empty">{empty}</div>}</div>
  </article>;
}

function EpoxiTooltip({active,payload}:{active?:boolean;payload?:Array<{payload?:{data:string;produzido:number}}>} ) {
  const item=payload?.[0]?.payload;
  if(!active||!item||item.produzido<=0)return null;
  return <div className="epoxi-tooltip"><span>{fmtDate(item.data)}</span><strong>{fmt(item.produzido)} produzido{item.produzido===1?'':'s'}</strong><small>Clique para ver os detalhes</small></div>;
}
