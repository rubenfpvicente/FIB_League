export const MatchCard = ({ index, jogo, onUpdate, times, showIda }) => {
  return (
    <div className="card-jogo">
      <div className="selecao-confronto">
        <div className="time-col">
          <select value={jogo.time1} onChange={(e) => onUpdate(index, 'time1', e.target.value)}>
            <option value="">-- Selecione --</option>
            {times.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="wo-label"><input type="checkbox" checked={jogo.wo1} onChange={(e) => onUpdate(index, 'wo1', e.target.checked)} /> WO</label>
        </div>

        <div className="vs-badge">
          {showIda && (
            <div className="ida-input">
              <small>Ida:</small>
              <input type="text" value={jogo.resultadoIda} onChange={(e) => onUpdate(index, 'resultadoIda', e.target.value)} />
            </div>
          )}
          <span>VS</span>
        </div>

        <div className="time-col">
          <select value={jogo.time2} onChange={(e) => onUpdate(index, 'time2', e.target.value)}>
            <option value="">-- Selecione --</option>
            {times.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="wo-label"><input type="checkbox" checked={jogo.wo2} onChange={(e) => onUpdate(index, 'wo2', e.target.checked)} /> WO</label>
        </div>
      </div>
      <div className="palpites-grid">
        <textarea disabled={jogo.wo1} value={jogo.wo1 ? "" : jogo.equipe1Palpites} onChange={(e) => onUpdate(index, 'equipe1Palpites', e.target.value)} placeholder="Palpites..." />
        <textarea disabled={jogo.wo2} value={jogo.wo2 ? "" : jogo.equipe2Palpites} onChange={(e) => onUpdate(index, 'equipe2Palpites', e.target.value)} placeholder="Palpites..." />
      </div>
    </div>
  );
};