export const ConfigHeader = ({ confrontosTexto, setConfrontosTexto, resultadoGlobal, setResultadoGlobal }) => {

  return (
    <header className="main-header">
      <div className="config-row">
        <div className="input-group">
          <label>Lista de confrontos:</label>
          <textarea
            className="confrontos-input"
            value={confrontosTexto}
            onChange={(e) => setConfrontosTexto(e.target.value)}
            placeholder={'🇵🇭 FIB League 2 🇵🇭\n\nRodada 38 (Última)\n\n🇫🇷 Lens vs Swansea City 🏴\n🇰🇿 FC Astana vs AC Milan 🇮🇹'}
          />
        </div>

        <div className="input-group">
          <label>Resultados:</label>
          <input type="text" value={resultadoGlobal} onChange={(e) => setResultadoGlobal(e.target.value)} />
        </div>
      </div>
    </header>
  );
};
