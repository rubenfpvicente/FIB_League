import fibLogo from '../assets/fib-logo.png';

export const ConfigHeader = ({ confrontosTexto, setConfrontosTexto, resultadoGlobal, setResultadoGlobal }) => {

  return (
    <header className="main-header">
      <div className="header-inner">
        <div className="brand">
          <img className="brand-logo" src={fibLogo} alt="Logótipo da Federação Internacional de Bolão" />
          <div>
            <p className="brand-kicker">FIB LEAGUE</p>
            <h1>Somador automático</h1>
            <p className="brand-description">Resultados organizados, prontos para partilhar.</p>
          </div>
        </div>

        <div className="config-row">
          <div className="input-group confrontos-group">
            <label htmlFor="confrontos">Lista de confrontos</label>
          <textarea
            id="confrontos"
            className="confrontos-input"
            value={confrontosTexto}
            onChange={(e) => setConfrontosTexto(e.target.value)}
            placeholder={'🇵🇭 FIB League 2 🇵🇭\n\nRodada 38 (Última)\n\n🇫🇷 Lens vs Swansea City 🏴\n🇰🇿 FC Astana vs AC Milan 🇮🇹'}
          />
            <small>Cole aqui o texto completo vindo do WhatsApp.</small>
        </div>

          <div className="input-group resultados-group">
            <label htmlFor="resultados">Resultados</label>
            <input id="resultados" type="text" value={resultadoGlobal} onChange={(e) => setResultadoGlobal(e.target.value)} placeholder="Ex.: 1-0 / 2-2 / 3-1" />
            <small>Separe cada resultado por “/”.</small>
          </div>
        </div>
      </div>
    </header>
  );
};
