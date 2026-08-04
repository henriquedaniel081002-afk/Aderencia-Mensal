import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { MonthlyDashboard } from './dashboards/MonthlyDashboard';

const LOGIN_USUARIO = 'Producao';
const LOGIN_SENHA = 'itam123';
const SESSAO_KEY = 'itam_dashboard_autenticado';

export default function App() {
  const [autenticado, setAutenticado] = useState(() => sessionStorage.getItem(SESSAO_KEY) === 'true');

  const entrar = (usuario: string, senha: string) => {
    const valido = usuario.trim() === LOGIN_USUARIO && senha === LOGIN_SENHA;
    if (valido) {
      sessionStorage.setItem(SESSAO_KEY, 'true');
      setAutenticado(true);
    }
    return valido;
  };

  const sair = () => {
    sessionStorage.removeItem(SESSAO_KEY);
    setAutenticado(false);
  };

  if (!autenticado) return <LoginScreen onLogin={entrar} />;

  return (
    <div className="h-dvh w-full overflow-hidden bg-bg-main font-sans text-text-primary">
      <MonthlyDashboard onLogout={sair} />
    </div>
  );
}
