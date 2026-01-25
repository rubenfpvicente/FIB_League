import { RODADAS_EL, RODADAS_CONF, RODADAS_CUP } from '../utils/constants';

export const ConfigHeader = ({ config, setConfig }) => {
  const { competicao, rodada, resultadoGlobal } = config;

  return (
    <header className="main-header">
      <div className="config-row">
        <div className="input-group">
          <label>Competição:</label>
          <select 
            value={competicao} 
            onChange={(e) => setConfig({ ...config, competicao: e.target.value, rodada: "1" })}
          >
            <option value="L2">League 2</option>
            <option value="L3">League 3</option>
            <option value="L4">League 4</option>
            <option value="EL">Europa League</option>
            <option value="CONF">Conference League</option>
            <option value="CUP">FIB Cup</option>
          </select>
        </div>

        <div className="input-group">
          <label>Rodada:</label>
          <select value={rodada} onChange={(e) => setConfig({ ...config, rodada: e.target.value })}>
            {/* Ligas de pontos corridos */}
            {(competicao === "L2" || competicao === "L3" || competicao === "L4") && (
              [...Array(38)].map((_, i) => <option key={i+1} value={i+1}>Rodada {i+1}</option>)
            )}
            {/* Europa League */}
            {competicao === "EL" && (
              RODADAS_EL.map(r => <option key={r} value={r}>{isNaN(r) ? r : `Rodada ${r}`}</option>)
            )}
            {/* Conference League */}
            {competicao === "CONF" && (
              RODADAS_CONF.map(r => <option key={r} value={r}>{isNaN(r) ? r : `Rodada ${r}`}</option>)
            )}
            {/* FIB Cup */}
            {competicao === "CUP" && (
              RODADAS_CUP.map(r => <option key={r} value={r}>{isNaN(r) ? r : `Rodada ${r}`}</option>)
            )}
          </select>
        </div>

        <div className="input-group">
          <label>Global:</label>
          <input type="text" value={resultadoGlobal} onChange={(e) => setConfig({ ...config, resultadoGlobal: e.target.value })} />
        </div>
      </div>
    </header>
  );
};