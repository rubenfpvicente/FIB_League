import { RODADAS_EL } from '../utils/constants';

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
            <option value="L2">FIB League 2</option>
            <option value="L3">FIB League 3</option>
            <option value="L4">FIB League 4</option>
            <option value="EL">FIB Europa League</option>
          </select>
        </div>

        <div className="input-group">
          <label>Rodada:</label>
          <select 
            value={rodada} 
            onChange={(e) => setConfig({ ...config, rodada: e.target.value })}
          >
            {competicao === "L2" ? (
              [...Array(38)].map((_, i) => <option key={i+1} value={i+1}>Rodada {i+1}</option>)
            ) : (
              RODADAS_EL.map(r => <option key={r} value={r}>{isNaN(r) ? r : `Rodada ${r}`}</option>)
            )}
          </select>
        </div>

        <div className="input-group">
          <label>Resultado Global:</label>
          <input 
            type="text" 
            placeholder="0-0/1-1/..." 
            value={resultadoGlobal} 
            onChange={(e) => setConfig({ ...config, resultadoGlobal: e.target.value })}
          />
        </div>
      </div>
    </header>
  );
};