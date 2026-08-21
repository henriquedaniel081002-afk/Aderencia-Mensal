import { useMemo, useState } from 'react';
import { FilterBar, FilterSelect } from '../components/FilterBar';
import { Header } from '../components/Header';
import { formatNum, formatPct } from '../lib/formatters';
import { MetricPanels } from '../components/MetricPanels';
import { EvolutionChart } from '../components/Charts';
import { DayDetailModal, type DetalheProducao, type Falta, type Observacao, type DetalheFalta, type DetalheObservacao, type FaltaMaterial, type MaquinaQuebrada, type NaoConformidade } from '../components/DayDetailModal';
import { EpoxiDashboard } from './EpoxiDashboard';
import type { EvolutionItem } from '../components/Charts';
import dadosJson from '../data/aderenciaMensal.json';

type Programacao = { data:string; linha:string; setor:string; quantidade:number };
type Apontamento = Programacao & { turno:string };
type Dados = { geradoEm:string; periodo:{meses:string[]}; filtros:{linhas:string[];setores:string[];turnos:string[]}; programacao:Programacao[]; apontamento:Apontamento[]; detalhesProducao?:DetalheProducao[]; faltas?:Falta[]; observacoes?:Observacao[]; detalhesFaltas?:DetalheFalta[]; detalhesObservacoes?:DetalheObservacao[]; faltasMaterial?:FaltaMaterial[]; maquinasQuebradas?:MaquinaQuebrada[]; naoConformidades?:NaoConformidade[] };
const dados = dadosJson as Dados;
const mesesNomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const mesLabel = (ym:string) => { const [a,m]=ym.split('-').map(Number); return `${mesesNomes[m-1]} de ${a}`; };

export function MonthlyDashboard({ onLogout }: { onLogout: () => void }) {
  const hoje = new Date();
  const atual = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`;
  const defaultMes = dados.periodo.meses.includes(atual) ? atual : dados.periodo.meses[dados.periodo.meses.length-1];
  const defaultSetor = dados.filtros.setores.includes('MONTAGEM FINAL') ? 'MONTAGEM FINAL' : dados.filtros.setores[0];
  const [mes, setMes] = useState(defaultMes);
  const [setor, setSetor] = useState(defaultSetor);
  const [linha, setLinha] = useState('Todas');
  const [turno, setTurno] = useState('Todos');
  const [diaSelecionado, setDiaSelecionado] = useState<EvolutionItem | null>(null);
  const setorOptions = useMemo(() => dados.filtros.setores.includes('EPOXI') ? dados.filtros.setores : [...dados.filtros.setores, 'EPOXI'], []);
  const isEpoxi = setor === 'EPOXI';
  const handleSetor = (value:string) => {
    setSetor(value);
    setDiaSelecionado(null);
    if (value === 'EPOXI') setLinha('EPO');
    else if (setor === 'EPOXI') setLinha('Todas');
  };

  const calculado = useMemo(() => {
    const prog = dados.programacao.filter(r => r.data.startsWith(mes) && (linha==='Todas'||r.linha===linha) && r.setor===setor);
    const prod = dados.apontamento.filter(r => r.data.startsWith(mes) && (linha==='Todas'||r.linha===linha) && r.setor===setor && (turno==='Todos'||r.turno===turno));
    const [ano, numeroMes] = mes.split('-').map(Number);
    const diasMes = new Date(ano, numeroMes, 0).getDate();
    const fimMesSelecionado = new Date(ano, numeroMes, 0, 23,59,59);
    const inicioMesSelecionado = new Date(ano, numeroMes-1, 1);
    const corte = hoje < inicioMesSelecionado ? 0 : hoje > fimMesSelecionado ? diasMes : Math.max(hoje.getDate() - 1, 0);
    const porDia = Array.from({length:diasMes}, (_,i) => {
      const data = `${mes}-${String(i+1).padStart(2,'0')}`;
      return { dia:String(i+1).padStart(2,'0'), data, programado:prog.filter(r=>r.data===data).reduce((a,r)=>a+r.quantidade,0), produzido:prod.filter(r=>r.data===data).reduce((a,r)=>a+r.quantidade,0) };
    });
    const programadoTotal = prog.reduce((a,r)=>a+r.quantidade,0);
    const programadoParcial = porDia.filter((_,i)=>i<corte).reduce((a,r)=>a+r.programado,0);
    const produzidoParcial = porDia.filter((_,i)=>i<corte).reduce((a,r)=>a+r.produzido,0);
    const diasRegistro = porDia.filter((r,i)=>i<corte && r.produzido>0).length;
    const mediaProgramada = diasRegistro ? programadoParcial/diasRegistro : 0;
    const mediaProduzida = diasRegistro ? produzidoParcial/diasRegistro : 0;
    const aderenciaMensal = programadoParcial ? produzidoParcial/programadoParcial*100 : 0;
    const alcanceMeta = programadoTotal ? produzidoParcial/programadoTotal*100 : 0;
    const dadosGrafico = porDia.filter(r => r.programado > 0 || r.produzido > 0);
    return {porDia:dadosGrafico,programadoTotal,programadoParcial,produzidoParcial,diasRegistro,mediaProgramada,mediaProduzida,aderenciaMensal,alcanceMeta};
  }, [mes,setor,linha,turno]);

  const limpar = () => { setMes(defaultMes); setSetor(defaultSetor); setLinha('Todas'); setTurno('Todos'); setDiaSelecionado(null); };
  const filtrosAtivos = mes !== defaultMes || linha !== 'Todas' || setor !== defaultSetor || turno !== 'Todos';

  return (
    <div className="dashboard-shell">
      <Header period={mesLabel(mes)} generatedAt={dados.geradoEm} onLogout={onLogout} />

      <div className="dashboard-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="dashboard-content">
          <FilterBar onClear={limpar} clearDisabled={!filtrosAtivos}>
            <FilterSelect id="filtro-mes" label="Mês" options={dados.periodo.meses} selected={mes} onSelect={setMes} formatOption={mesLabel} active={mes !== defaultMes} />
            <FilterSelect id="filtro-linha" label="Linha" options={isEpoxi ? ['EPO'] : ['Todas',...dados.filtros.linhas]} selected={isEpoxi ? 'EPO' : linha} onSelect={setLinha} formatOption={(option) => option === 'Todas' ? 'Todos' : option} active={isEpoxi || linha !== 'Todas'} compact />
            <FilterSelect id="filtro-setor" label="Setor" options={setorOptions} selected={setor} onSelect={handleSetor} defaultValue={defaultSetor} />
            <FilterSelect id="filtro-turno" label="Turno" options={['Todos',...dados.filtros.turnos]} selected={turno} onSelect={setTurno} active={turno !== 'Todos'} compact />
          </FilterBar>

          {isEpoxi ? (
            <EpoxiDashboard
              mes={mes}
              turno={turno}
              detalhes={dados.detalhesProducao ?? []}
              faltas={dados.faltas ?? []}
              observacoes={dados.observacoes ?? []}
            />
          ) : (
            <main className="dashboard-main">
              <MetricPanels
                adherence={{ value: calculado.programadoParcial?formatPct(calculado.aderenciaMensal):'—', trend: calculado.aderenciaMensal>=100?'up':'down' }}
                goal={{ value: calculado.programadoTotal?formatPct(calculado.alcanceMeta):'—', percent: Math.min(calculado.alcanceMeta,100) }}
                auxiliary={{
                  programmedAverage: formatNum(calculado.mediaProgramada,2),
                  producedAverage: formatNum(calculado.mediaProduzida,2),
                  producedAverageTrend: calculado.mediaProduzida>=calculado.mediaProgramada?'up':'down',
                  workingDays: String(calculado.diasRegistro),
                }}
                operational={{
                  partialProgrammed: formatNum(calculado.programadoParcial),
                  partialProduced: formatNum(calculado.produzidoParcial),
                  partialProducedTrend: calculado.produzidoParcial>=calculado.programadoParcial?'up':'down',
                  totalProgrammed: formatNum(calculado.programadoTotal),
                }}
              />
              <EvolutionChart data={calculado.porDia} mesLabel={mesLabel(mes)} onDayClick={setDiaSelecionado} />
            </main>
          )}
        </div>
      </div>
      {!isEpoxi && diaSelecionado && (
        <DayDetailModal
          item={diaSelecionado}
          setor={setor}
          linha={linha}
          turno={turno}
          detalhes={dados.detalhesProducao ?? []}
          faltas={dados.faltas ?? []}
          observacoes={dados.observacoes ?? []}
          detalhesFaltas={dados.detalhesFaltas ?? []}
          detalhesObservacoes={dados.detalhesObservacoes ?? []}
          faltasMaterial={dados.faltasMaterial ?? []}
          maquinasQuebradas={dados.maquinasQuebradas ?? []}
          naoConformidades={dados.naoConformidades ?? []}
          onClose={() => setDiaSelecionado(null)}
        />
      )}
    </div>
  );
}
