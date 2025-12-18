import { useState, useEffect } from 'react'
import './App.css'

const TIMES = [
  "🇫🇷 Monaco", "🇩🇪 Borussia Dortmund", "🇽🇪 Aston Villa", "🇮🇹 Pescara",
  "🇵🇹 FC Porto", "🇽🇼 Swansea City", "🇪🇸 Sevilla", "🇮🇹 Como",
  "🇵🇹 Braga", "🇽🇪 West Ham", "🇫🇷 Marseille", "🇫🇴 KÍ Klaksvík",
  "🇳🇱 Ajax", "🇰🇿 FC Astana", "🇮🇹 Palermo", "🇩🇪 Bayern",
  "🇮🇹 AC Milan", "🇽🇪 Manchester City", "🇧🇪 Anderlecht", "🇵🇹 Rio Ave"
].sort();

const TIMES2 = ["🇪🇸 Barcelona", "🇽🇪 Corinthian-Casuals", "🇵🇹 Fátima", "🇹🇷 Fenerbahçe", "🇮🇹 Fiorentina", "🇮🇹 Internazionale", "🇮🇹 Juventus", "🇦🇲 Pyunik Yerevan", "🇪🇸 Real Bétis", "🇪🇸 Real Madrid", "🇽🇪 Southampton", "🇩🇪 St. Pauli", "🇪🇸 Villarreal", "🇽🇪 Wolverhampton"
].sort();

function App() {
  const [rodada, setRodada] = useState(1);
  const [resultadoGlobal, setResultadoGlobal] = useState("");
  const [jogos, setJogos] = useState(
    Array(10).fill(null).map(() => ({ 
      time1: TIMES[0], time2: TIMES[1], 
      equipe1Palpites: "", equipe2Palpites: "",
      wo1: false, wo2: false
    }))
  );
  const [resultadoFinal, setResultadoFinal] = useState("");

  // Sua função de capitalização avançada
  const formatarNomeJogador = (nome) => {
    return nome
      .replace(/[^\p{L}'.]/gu, ' ')
      .toLowerCase()
      .split(' ')
      .filter(p => p !== '')
      .map(palavra =>
        palavra
          .split("'")
          .map(parte =>
            parte ? parte.charAt(0).toUpperCase() + parte.slice(1) : ''
          )
          .join("'")
      )
      .join(' ');
  };

  // Nova função para isolar a parte relevante do texto colado
  const extrairPalpitesDoBloco = (texto) => {
    const marcadorInicio = "*Palpites 🏆⬇:*";
    const marcadorFim = "- - - - - - - - - - - - - - - - - - -";
    
    if (texto.includes(marcadorInicio)) {
      let parteInteressante = texto.split(marcadorInicio)[1];
      if (parteInteressante.includes(marcadorFim)) {
        parteInteressante = parteInteressante.split(marcadorFim)[0];
      }
      return parteInteressante.trim();
    }
    return texto.trim(); // Se não tiver os marcadores, processa o texto normal
  };

  useEffect(() => {
    const resArray = resultadoGlobal.split('/').map(s => s.trim());
    let output = `*FIB League 2*\n\n*Rodada ${rodada}*\n\n`;

    jogos.forEach((jogo) => {
      const extrairInfo = (timeStr) => {
        const flag = timeStr.split(' ')[0];
        const nome = timeStr.replace(flag, '').trim();
        return { flag, nome };
      };

      const info1 = extrairInfo(jogo.time1);
      const info2 = extrairInfo(jogo.time2);

      const calcularGols = (textoOriginal, isWO) => {
        if (isWO) return { golsTotal: 0, lista: ["*WO*"] };
        
        // Primeiro, limpa o bloco colado para pegar só os nomes e palpites
        const textoLimpo = extrairPalpitesDoBloco(textoOriginal);
        
        const linhas = textoLimpo.split('\n')
          .map(l => l.trim())
          .filter(l => l !== ""); // Remove linhas vazias

        let golsTotal = 0;
        let artilheiros = [];

        // O loop pula de 2 em 2 (Nome e Palpite)
        for (let i = 0; i < linhas.length; i += 2) {
          const nomeRaw = linhas[i];
          const palpiteRaw = linhas[i + 1];
          if (!palpiteRaw) continue;

          const palpitesIndividuais = palpiteRaw.split('/').map(s => s.trim());
          let golsDoJogador = 0;

          palpitesIndividuais.forEach((p, index) => {
            if (resArray[index] && p === resArray[index]) golsDoJogador++;
          });

          if (golsDoJogador > 0) {
            const nomeFormatado = formatarNomeJogador(nomeRaw);
            artilheiros.push(golsDoJogador > 1 ? `${nomeFormatado} (${golsDoJogador})` : nomeFormatado);
            golsTotal += golsDoJogador;
          }
        }
        return { golsTotal, lista: artilheiros };
      };

      const resEquipe1 = calcularGols(jogo.equipe1Palpites, jogo.wo1);
      const resEquipe2 = calcularGols(jogo.equipe2Palpites, jogo.wo2);

      output += `${info1.flag} ${info1.nome} *${resEquipe1.golsTotal}-${resEquipe2.golsTotal}* ${info2.nome} ${info2.flag}\n`;
      output += `⚽${info1.flag}: ${resEquipe1.lista.length > 0 ? resEquipe1.lista.join(', ') : '❌'}\n`;
      output += `⚽${info2.flag}: ${resEquipe2.lista.length > 0 ? resEquipe2.lista.join(', ') : '❌'}\n\n`;
    });

    setResultadoFinal(output.trim());
  }, [jogos, resultadoGlobal, rodada]);

  const handleUpdate = (index, field, value) => {
    const novos = [...jogos];
    novos[index][field] = value;
    setJogos(novos);
  };

  return (
    <div className="app-wrapper">
      <header className="main-header">
        <div className="config-row">
          <div className="input-group">
            <label>Resultado Global:</label>
            <input 
              type="text" 
              placeholder="1-1/2-1/0-0"
              value={resultadoGlobal}
              onChange={(e) => setResultadoGlobal(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Rodada:</label>
            <select value={rodada} onChange={(e) => setRodada(e.target.value)}>
              {[...Array(38)].map((_, i) => <option key={i+1} value={i+1}>Rodada {i+1}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="inputs-section">
          {jogos.map((jogo, index) => (
            <div key={index} className="card-jogo">
              <div className="selecao-confronto">
                <div className="time-col">
                  <select value={jogo.time1} onChange={(e) => handleUpdate(index, 'time1', e.target.value)}>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="wo-label"><input type="checkbox" checked={jogo.wo1} onChange={(e) => handleUpdate(index, 'wo1', e.target.checked)} /> WO</label>
                </div>
                <div className="vs-badge">VS</div>
                <div className="time-col">
                  <select value={jogo.time2} onChange={(e) => handleUpdate(index, 'time2', e.target.value)}>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="wo-label"><input type="checkbox" checked={jogo.wo2} onChange={(e) => handleUpdate(index, 'wo2', e.target.checked)} /> WO</label>
                </div>
              </div>
              <div className="palpites-grid">
                <textarea 
                  disabled={jogo.wo1} 
                  value={jogo.wo1 ? "" : jogo.equipe1Palpites} 
                  onChange={(e) => handleUpdate(index, 'equipe1Palpites', e.target.value)} 
                  placeholder="Cole o bloco aqui..." 
                />
                <textarea 
                  disabled={jogo.wo2} 
                  value={jogo.wo2 ? "" : jogo.equipe2Palpites} 
                  onChange={(e) => handleUpdate(index, 'equipe2Palpites', e.target.value)} 
                  placeholder="Cole o bloco aqui..." 
                />
              </div>
            </div>
          ))}
        </section>

        <section className="preview-section">
          <div className="preview-sticky">
            <div className="preview-header">
              <span>Resultado formatado</span>
              <button className="copy-button" onClick={() => navigator.clipboard.writeText(resultadoFinal)}>Copiar</button>
            </div>
            <div className="preview-box">
              <pre>{resultadoFinal}</pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App