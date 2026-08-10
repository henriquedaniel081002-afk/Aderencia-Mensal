import { AlertTriangle, CalendarDays, Factory, Gauge, UsersRound, X } from 'lucide-react';
import type { EvolutionItem } from './Charts';

export type DetalheProducao = { data:string; linha:string; setor:string; potencia:number|string; quantidade:number };
export type Falta = { data:string; linha:string; setor:string; turno:string; quantidade:number };
export type Observacao = { data:string; linha:string; setor:string; observacao?:string; texto?:string };

const fmt = (n:number) => Math.round(n).toLocaleString('pt-BR');
const pct = (n:number) => `${n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}%`;
const formatDate = (value:string) => {
  const [y,m,d]=value.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(y,m-1,d));
};

export function DayDetailModal({ item, setor, linha, turno, detalhes, faltas, observacoes, onClose }:{
  item:EvolutionItem; setor:string; linha:string; turno:string; detalhes:DetalheProducao[]; faltas:Falta[]; observacoes:Observacao[]; onClose:()=>void;
}) {
  const diferenca=item.produzido-item.programado;
  const aderencia=item.programado ? item.produzido/item.programado*100 : null;
  // Mantém cada combinação Potência + Linha separada. Isso evita misturar,
  // por exemplo, 30 kVA MON com 30 kVA TRI quando o filtro está em Todas.
  const potencias = detalhes
    .filter(r=>r.data===item.data && r.setor===setor && (linha==='Todas'||r.linha===linha))
    .reduce<Map<string,{potencia:string;linha:string;quantidade:number}>>((acc,r)=>{
      const potencia=String(r.potencia);
      const chave=`${potencia}||${r.linha}`;
      const atual=acc.get(chave);
      acc.set(chave,{potencia,linha:r.linha,quantidade:(atual?.quantidade||0)+Number(r.quantidade||0)});
      return acc;
    },new Map());
  const potenciaRows=[...potencias.values()].sort((a,b)=>{
    const dif=Number(a.potencia.replace(',','.'))-Number(b.potencia.replace(',','.'));
    return dif!==0?dif:a.linha.localeCompare(b.linha,'pt-BR');
  });
  const faltasDia=faltas.filter(r=>r.data===item.data && r.setor===setor && (linha==='Todas'||r.linha===linha) && (turno==='Todos'||r.turno===turno));
  const obsDia=observacoes.filter(r=>r.data===item.data && r.setor===setor && (linha==='Todas'||r.linha===linha));

  return <div className="day-detail-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section className="day-detail-modal" role="dialog" aria-modal="true" aria-label={`Detalhamento de ${formatDate(item.data)}`}>
      <header className="day-detail-header">
        <div>
          <span className="day-detail-eyebrow"><CalendarDays className="size-4"/> Detalhamento diário</span>
          <h2>{formatDate(item.data)}</h2>
          <p>{setor} <i/> {linha==='Todas'?'Todas as linhas':linha} {turno!=='Todos' && <><i/> {turno} turno</>}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Fechar detalhamento"><X className="size-5"/></button>
      </header>

      <div className="day-detail-body">
        <div className="day-detail-kpis">
          <article><span>Programado</span><strong>{fmt(item.programado)}</strong></article>
          <article><span>Produzido</span><strong>{fmt(item.produzido)}</strong></article>
          <article><span>Diferença</span><strong className={diferenca>=0?'positive':'negative'}>{diferenca>0?'+':''}{fmt(diferenca)}</strong></article>
          <article><span>Aderência</span><strong className={(aderencia||0)>=100?'positive':'negative'}>{aderencia===null?'—':pct(aderencia)}</strong></article>
        </div>

        <div className="day-detail-grid">
          <article className="day-detail-card day-detail-production">
            <div className="day-detail-card-title"><Gauge className="size-4"/><div><h3>Produção por potência</h3><p>Composição do volume produzido no dia</p></div></div>
            {potenciaRows.length ? <div className="day-detail-table">
              <div className="day-detail-table-head"><span>Potência</span><span className="day-detail-line">Linha</span><span>Produzido</span></div>
              {potenciaRows.map(r=><div className="day-detail-table-row" key={`${r.potencia}-${r.linha}`}><span>{r.potencia} kVA</span><span className="day-detail-line">{r.linha}</span><strong>{fmt(r.quantidade)}</strong></div>)}
              <div className="day-detail-table-total"><span>Total detalhado</span><span/><strong>{fmt(potenciaRows.reduce((a,r)=>a+r.quantidade,0))}</strong></div>
            </div> : <Empty text="Nenhum detalhamento por potência registrado para este dia."/>}
          </article>

          <div className="day-detail-side">
            <article className="day-detail-card">
              <div className="day-detail-card-title"><UsersRound className="size-4"/><div><h3>Faltas</h3><p>Registros por turno</p></div></div>
              {faltasDia.length ? <div className="day-detail-list">{faltasDia.map((r,i)=><div key={`${r.turno}-${i}`}><span>{r.turno} turno</span><strong>{fmt(r.quantidade)}</strong></div>)}</div> : <Empty text="Nenhuma falta registrada."/>}
            </article>
            <article className="day-detail-card">
              <div className="day-detail-card-title"><AlertTriangle className="size-4"/><div><h3>Ocorrências</h3><p>Observações operacionais do dia</p></div></div>
              {obsDia.length ? <div className="day-detail-notes">{obsDia.map((r,i)=><div className="day-detail-note" key={`${r.linha}-${i}`}><span>{r.linha}</span><p>{r.observacao ?? r.texto}</p></div>)}</div> : <Empty text="Nenhuma ocorrência registrada."/>}
            </article>
          </div>
        </div>
      </div>
      <footer className="day-detail-footer"><Factory className="size-3.5"/> Dados consolidados para os filtros selecionados no dashboard.</footer>
    </section>
  </div>;
}
function Empty({text}:{text:string}){return <div className="day-detail-empty">{text}</div>}
