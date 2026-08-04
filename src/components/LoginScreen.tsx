import { FormEvent, KeyboardEvent, useId, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import itamTransformadoresLogo from '../assets/itam-transformadores-logo.png';

type LoginScreenProps = {
  onLogin: (usuario: string, senha: string) => boolean;
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const usuarioId = useId();
  const senhaId = useId();
  const erroId = useId();

  const tentarEntrar = () => {
    if (carregando || !usuario || !senha) return;

    setErro('');
    setCarregando(true);

    window.setTimeout(() => {
      const valido = onLogin(usuario, senha);
      if (!valido) {
        setErro('Login ou senha incorretos.');
        setCarregando(false);
      }
    }, 250);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    tentarEntrar();
  };

  const enviarComEnter = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    tentarEntrar();
  };

  const limparErro = () => {
    if (erro) setErro('');
  };

  return (
    <main className="grid h-dvh w-full overflow-y-auto bg-bg-main text-text-primary lg:grid-cols-[minmax(0,1.45fr)_minmax(420px,0.75fr)]">
      <section
        className="relative isolate flex min-h-[300px] overflow-hidden border-b border-border-subtle bg-bg-elevated px-6 py-8 sm:min-h-[340px] sm:px-10 sm:py-10 lg:min-h-dvh lg:border-b-0 lg:border-r lg:px-[clamp(3rem,6vw,7.5rem)] lg:py-14"
        aria-labelledby="institutional-title"
      >
        <div className="login-grid absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-status-planned/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-44 right-0 h-[460px] w-[460px] rounded-full bg-status-success/10 blur-3xl" aria-hidden="true" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[56%] text-border-strong opacity-80" aria-hidden="true">
          <svg className="h-full w-full" viewBox="0 0 900 420" fill="none" preserveAspectRatio="xMidYMax slice">
            <path d="M-40 353H157L229 281H407L487 201H644L717 128H936" stroke="currentColor" strokeWidth="1.5" />
            <path d="M36 407L221 222H378L512 88H718" className="text-status-success/35" stroke="currentColor" strokeWidth="2" />
            <path d="M438 420V312L526 224H647L725 146V0" className="text-border-subtle" stroke="currentColor" strokeWidth="1" strokeDasharray="6 8" />
            <path d="M683 420V348L774 257H920" className="text-status-planned/30" stroke="currentColor" strokeWidth="2" />
            <circle cx="229" cy="281" r="8" className="fill-bg-elevated stroke-status-success/60" strokeWidth="2" />
            <circle cx="487" cy="201" r="5" className="fill-status-success" />
            <circle cx="725" cy="146" r="11" className="fill-bg-elevated stroke-border-strong" strokeWidth="2" />
            <circle cx="774" cy="257" r="6" className="fill-status-planned/60" />
            <rect x="603" y="306" width="118" height="70" rx="4" className="fill-bg-main/40 stroke-border-subtle" />
            <path d="M623 350H701M662 326V368" className="stroke-border-strong" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative z-10 flex w-full max-w-3xl flex-col">
          <div className="flex items-center">
            <img
              src={itamTransformadoresLogo}
              alt="ITAM Transformadores"
              className="h-auto w-[clamp(220px,22vw,280px)] max-w-full select-none object-contain object-left"
              draggable={false}
            />
          </div>

          <div className="mt-12 max-w-2xl sm:mt-16 lg:mt-[clamp(6rem,17vh,12rem)]">
            <p className="mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-status-success">
              <span className="h-px w-9 bg-status-success" aria-hidden="true" />
              Monitoramento de produção
            </p>
            <h1 id="institutional-title" className="max-w-xl text-3xl font-bold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[clamp(3rem,5vw,5.5rem)]">
              Aderência Mensal de Produção
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-text-secondary sm:text-base sm:leading-7 lg:mt-7 lg:text-lg">
              Visão integrada entre planejamento e execução para acompanhamento do desempenho operacional.
            </p>
          </div>

          <div className="mt-auto hidden items-center gap-5 pt-12 lg:flex" aria-hidden="true">
            <span className="h-2 w-2 rotate-45 bg-status-success" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Planejamento</span>
            <span className="h-px w-10 bg-border-strong" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Execução</span>
            <span className="h-px w-10 bg-border-strong" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Aderência</span>
          </div>
        </div>
      </section>

      <section
        className="relative flex min-h-[600px] items-center justify-center bg-bg-main px-6 py-12 sm:px-10 lg:min-h-dvh lg:px-[clamp(2.5rem,4vw,5rem)]"
        aria-labelledby="login-title"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-status-success/50 to-transparent lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-px lg:bg-gradient-to-b" aria-hidden="true" />

        <div className="w-full max-w-md">
          <div className="mb-10">
            <div className="mb-7 flex items-center gap-3" aria-hidden="true">
              <span className="h-px w-8 bg-status-success" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-status-success">Acesso ao sistema</span>
            </div>
            <h2 id="login-title" className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Acesse o painel</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">Informe suas credenciais para visualizar os indicadores.</p>
          </div>

          <form onSubmit={submit} onKeyDown={enviarComEnter} className="space-y-5">
            <div>
              <label htmlFor={usuarioId} className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">Login</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
                <input
                  id={usuarioId}
                  name="usuario"
                  required
                  autoFocus
                  value={usuario}
                  onChange={(event) => {
                    setUsuario(event.target.value);
                    limparErro();
                  }}
                  autoComplete="username"
                  aria-invalid={Boolean(erro)}
                  aria-describedby={erro ? erroId : undefined}
                  className="h-13 w-full rounded-md border border-border-subtle bg-bg-elevated pl-12 pr-4 text-sm outline-none transition placeholder:text-text-secondary/60 hover:border-border-strong focus-visible:border-status-success focus-visible:ring-2 focus-visible:ring-status-success/20"
                  placeholder="Digite o login"
                />
              </div>
            </div>

            <div>
              <label htmlFor={senhaId} className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">Senha</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
                <input
                  id={senhaId}
                  name="senha"
                  required
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(event) => {
                    setSenha(event.target.value);
                    limparErro();
                  }}
                  autoComplete="current-password"
                  aria-invalid={Boolean(erro)}
                  aria-describedby={erro ? erroId : undefined}
                  className="h-13 w-full rounded-md border border-border-subtle bg-bg-elevated pl-12 pr-13 text-sm outline-none transition placeholder:text-text-secondary/60 hover:border-border-strong focus-visible:border-status-success focus-visible:ring-2 focus-visible:ring-status-success/20"
                  placeholder="Digite a senha"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((visivel) => !visivel)}
                  className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm text-text-secondary transition hover:bg-bg-card hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-success"
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={mostrarSenha}
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="min-h-12" aria-live="polite">
              {erro && (
                <p id={erroId} className="rounded-md border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-sm text-status-danger" role="alert">
                  {erro}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={carregando || !usuario || !senha}
              aria-busy={carregando}
              className="h-13 w-full rounded-md bg-status-success font-bold text-bg-main transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-success focus-visible:ring-offset-2 focus-visible:ring-offset-bg-main disabled:cursor-not-allowed disabled:opacity-50"
            >
              {carregando ? 'Verificando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-10 flex items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-border-subtle" />
            <span className="h-1.5 w-1.5 rotate-45 border border-border-strong" />
            <span className="h-px flex-1 bg-border-subtle" />
          </div>
          <p className="mt-5 text-center text-[11px] text-text-secondary">Acesso restrito a usuários autorizados.</p>
        </div>
      </section>
    </main>
  );
}
