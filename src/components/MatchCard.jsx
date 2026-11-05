import { separarTime } from '../utils/fixtures';

export const MatchCard = ({ index, jogo, onUpdate }) => {
  const time1 = separarTime(jogo.time1);
  const time2 = separarTime(jogo.time2);

  const exibirTime = ({ codigoBandeira, nome }) => (
    <strong className="team-name">
      {codigoBandeira && (
        <img
          className="team-flag"
          src={`https://flagcdn.com/w40/${codigoBandeira}.png`}
          alt=""
          onError={(evento) => { evento.currentTarget.style.display = 'none'; }}
        />
      )}
      {nome}
    </strong>
  );

  return (
    <div className="card-jogo">
      <div className="selecao-confronto">
        <div className="time-col">
          {exibirTime(time1)}
          <label className="wo-label"><input type="checkbox" checked={jogo.wo1} onChange={(e) => onUpdate(index, 'wo1', e.target.checked)} /> WO</label>
        </div>

        <div className="vs-badge">
          <span>VS</span>
        </div>

        <div className="time-col">
          {exibirTime(time2)}
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
