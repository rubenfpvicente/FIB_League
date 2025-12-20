import { useState, useEffect } from 'react'
import './index.css'

const TIMES_L2 = [
  "🇫🇷 Monaco", "🇩🇪 Borussia Dortmund", "🇽🇪 Aston Villa", "🇮🇹 Pescara",
  "🇵🇹 FC Porto", "🇽🇼 Swansea City", "🇪🇸 Sevilla", "🇮🇹 Como",
  "🇵🇹 Braga", "🇽🇪 West Ham", "🇫🇷 Marseille", "🇫🇴 KÍ Klaksvík",
  "🇳🇱 Ajax", "🇰🇿 FC Astana", "🇮🇹 Palermo", "🇩🇪 Bayern",
  "🇮🇹 AC Milan", "🇽🇪 Manchester City", "🇧🇪 Anderlecht", "🇵🇹 Rio Ave"
].sort();

const TIMES_EL = [
  "🇩🇪 Werder Bremen", "🇭🇺 Ferencváros", "🇬🇷 AEK Athens", "🇵🇹 Rio Ave", "🇮🇹 Parma",
  "🇮🇹 Chievo Verona", "🇽🇪 Millwall", "🇵🇹 Braga", "🇪🇸 Real Bétis", "🇹🇷 Galatasaray",
  "🇩🇰 Copenhagen", "🇺🇦 Shakhtar Donetsk", "🇽🇪 Dundee FC", "🇮🇹 Internazionale",
  "🇮🇹 Como", "🇽🇪 West Ham", "🇽🇪 Chelsea", "🇦🇲 Pyunik Yerevan", "🇽🇪 Derby County",
  "🇲🇩 Sheriff Tiraspol", "🇽🇼 Swansea City", "🇫🇷 Marseille", "🇽🇪 Liverpool",
  "🇪🇸 Real Madrid", "🇳🇴 Bodø/Glimt", "🇪🇸 Sevilla", "🇪🇸 Celta de Vigo",
  "🇫🇴 KÍ Klaksvík", "🇽🇪 Wolverhampton", "🇮🇹 AS Roma"
].sort();

const RODADAS_EL = [
  "1", "2", "3", "4", "5",
  "Oitavas - Ida", "Oitavas - Volta", 
  "Quartas - Ida", "Quartas - Volta", 
  "Semifinais - Ida", "Semifinais - Volta", 
  "Final"
];

function App() {
  const [competicao, setCompeticao] = useState("L2");
  const [rodada, setRodada] = useState("1");
  const [resultadoGlobal, setResultadoGlobal] = useState("");
  const [jogos, setJogos] = useState(
    Array(14).fill(null).map(() => ({ 
      time1: "", time2: "", 
      equipe1Palpites: "", equipe2Palpites: "",
      wo1: false, wo2: false,
      resultadoIda: "0-0"
    }))
  );
  const [resultadoFinal, setResultadoFinal] = useState("");

  const formatarNomeJogador = (nome) => {
    return nome.replace(/[^\p{L}']/gu, ' ').toLowerCase().split(' ').filter(p => p !== '')
      .map(palavra => palavra.split("'").map(parte => parte ? parte.charAt(0).toUpperCase() + parte.slice(1) : '').join("'"))
      .join(' ');
  };

  const extrairPalpitesDoBloco = (texto) => {
    const marcadorInicio = "*Palpites 🏆⬇:*";
    const marcadorFim = "- - - - - - - - - - - - - - - - - - -";
    if (texto.includes(marcadorInicio)) {
      let p = texto.split(marcadorInicio)[1];
      if (p.includes(marcadorFim)) p = p.split(marcadorFim)[0];
      return p.trim();
    }
    return texto.trim();
  };

  const getQtdJogos = () => {
    if (competicao === "L2") return 10;
    if (rodada === "Final") return 1;
    if (rodada.includes("Semifinais")) return 2;
    if (rodada.includes("Quartas")) return 4;
    if (rodada.includes("Oitavas")) return 8;
    return 14;
  };

useEffect(() => {
    const resArray = resultadoGlobal.split('/').map(s => s.trim());
    const isEliminatoriaVolta = rodada.includes("Volta") || rodada === "Final";
    
    let titulo = competicao === "L2" ? "*FIB League 2*" : "*FIB Europa League*";
    let subTitulo = (competicao === "EL" && !isNaN(rodada) && parseInt(rodada) <= 5) 
                    ? `*Fase de Grupos - Rodada ${rodada}*` : `*Rodada ${rodada}*`;

    let output = `${titulo}\n\n${subTitulo}\n\n`;

    jogos.slice(0, getQtdJogos()).forEach((jogo) => {
      if (!jogo.time1 || !jogo.time2) return;

      const f = (t) => ({ flag: t.split(' ')[0], nome: t.replace(t.split(' ')[0], '').trim() });
      const t1 = f(jogo.time1); const t2 = f(jogo.time2);

      const calcularGols = (txt, wo, startIndex, endIndex) => {
        if (wo) return { gols: 0, lista: [] };
        const textoLimpo = extrairPalpitesDoBloco(txt);
        const linhas = textoLimpo.split('\n').map(l => l.trim()).filter(l => l !== "");
        let gols = 0; let lista = [];

        for (let i = 0; i < linhas.length; i += 2) {
          const nome = linhas[i]; 
          const palpites = (linhas[i+1] || "").split('/').map(s => s.trim());
          let pts = 0;
          palpites.forEach((p, idx) => {
            if (idx >= startIndex && idx <= endIndex && resArray[idx] && p === resArray[idx]) pts++;
          });
          if (pts > 0) {
            const nF = formatarNomeJogador(nome);
            lista.push(pts > 1 ? `${nF} (${pts})` : nF);
            gols += pts;
          }
        }
        return { gols, lista };
      };

      // 1. TEMPO NORMAL (Palpites 1 a 5)
      const res1 = calcularGols(jogo.equipe1Palpites, jogo.wo1, 0, 4);
      const res2 = calcularGols(jogo.equipe2Palpites, jogo.wo2, 0, 4);

      // 2. CÁLCULO DO AGREGADO DO TEMPO NORMAL
      const [ida1, ida2] = jogo.resultadoIda.split('-').map(n => parseInt(n) || 0);
      const aggNormal1 = res1.gols + ida1;
      const aggNormal2 = res2.gols + ida2;

      // 3. VERIFICAÇÃO DE PRORROGAÇÃO (Palpites 6 a 8)
      let finalAgg1 = aggNormal1;
      let finalAgg2 = aggNormal2;
      let houveProrrogacao = false;
      let resP1 = { gols: 0, lista: [] };
      let resP2 = { gols: 0, lista: [] };

      if (isEliminatoriaVolta && aggNormal1 === aggNormal2 && resArray.length > 5) {
        houveProrrogacao = true;
        resP1 = calcularGols(jogo.equipe1Palpites, jogo.wo1, 5, 7);
        resP2 = calcularGols(jogo.equipe2Palpites, jogo.wo2, 5, 7);
        finalAgg1 = aggNormal1 + resP1.gols;
        finalAgg2 = aggNormal2 + resP2.gols;
      }

      // 4. LÓGICA DE NOMES (NEGRITO)
      let nomeExibicao1 = t1.nome;
      let nomeExibicao2 = t2.nome;
      let nomeExtra1 = t1.nome;
      let nomeExtra2 = t2.nome;

      if (isEliminatoriaVolta) {
        if (houveProrrogacao) {
          // Na prorrogação, o negrito só vai para a seção de baixo
          if (finalAgg1 > finalAgg2) nomeExtra1 = `*${t1.nome}*`;
          else if (finalAgg2 > finalAgg1) nomeExtra2 = `*${t2.nome}*`;
        } else {
          // Se não houve prorrogação, o vencedor do tempo normal já ganha negrito
          if (aggNormal1 > aggNormal2) nomeExibicao1 = `*${t1.nome}*`;
          else if (aggNormal2 > aggNormal1) nomeExibicao2 = `*${t2.nome}*`;
        }
      }

      // 5. MONTAGEM DO TEXTO - TEMPO NORMAL
      if (isEliminatoriaVolta) {
        output += `${t1.flag} ${nomeExibicao1} *${res1.gols}-${res2.gols}* ${nomeExibicao2} ${t2.flag} (${aggNormal1}-${aggNormal2})\n`;
      } else {
        // Formato padrão para League 2 ou Ida (tudo em negrito na linha do placar)
        output += `${t1.flag} ${t1.nome} *${res1.gols}-${res2.gols}* ${t2.nome} ${t2.flag}\n`;
      }
      
      output += `⚽${t1.flag}: ${res1.lista.join(', ') || '❌'}\n`;
      output += `⚽${t2.flag}: ${res2.lista.join(', ') || '❌'}\n`;

      // 6. MONTAGEM DO TEXTO - PRORROGAÇÃO
      if (houveProrrogacao) {
        output += `\n*Prorrogação*\n`;
        output += `${t1.flag} ${nomeExtra1} *${resP1.gols}-${resP2.gols}* ${nomeExtra2} ${t2.flag} (${finalAgg1}-${finalAgg2})\n`;
        output += `⚽${t1.flag}: ${resP1.lista.join(', ') || '❌'}\n`;
        output += `⚽${t2.flag}: ${resP2.lista.join(', ') || '❌'}\n`;
      }
      
      output += `\n`;
    });

    setResultadoFinal(output.trim());
  }, [jogos, resultadoGlobal, rodada, competicao]);

  const handleUpdate = (index, field, value) => {
    const novos = [...jogos]; novos[index][field] = value; setJogos(novos);
  };

  return (
    <div className="app-wrapper">
      <header className="main-header">
        <div className="config-row">
          <div className="input-group">
            <label>Competição:</label>
            <select value={competicao} onChange={(e) => { setCompeticao(e.target.value); setRodada("1"); }}>
              <option value="L2">League 2</option>
              <option value="EL">Europa League</option>
            </select>
          </div>
          <div className="input-group">
            <label>Rodada:</label>
            <select value={rodada} onChange={(e) => setRodada(e.target.value)}>
              {competicao === "L2" ? [...Array(38)].map((_, i) => <option key={i+1} value={i+1}>Rodada {i+1}</option>) 
               : RODADAS_EL.map(r => <option key={r} value={r}>{isNaN(r) ? r : `Rodada ${r}`}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Global (1-1/2-0/etc):</label>
            <input type="text" value={resultadoGlobal} onChange={(e) => setResultadoGlobal(e.target.value)} placeholder="0-0/0-0/0-0/0-0/0-0 / 0-0/0-0/0-0" />
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="inputs-section">
          {jogos.slice(0, getQtdJogos()).map((jogo, index) => (
            <div key={index} className="card-jogo">
              <div className="selecao-confronto">
                <div className="time-col">
                  <select value={jogo.time1} onChange={(e) => handleUpdate(index, 'time1', e.target.value)}>
                    <option value="">-- Selecione --</option>
                    {(competicao === "L2" ? TIMES_L2 : TIMES_EL).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="wo-label"><input type="checkbox" checked={jogo.wo1} onChange={(e) => handleUpdate(index, 'wo1', e.target.checked)} /> WO</label>
                </div>
                <div className="vs-badge">
                  {(rodada.includes("Volta") || rodada === "Final") && (
                    <div className="ida-input">
                      <small>Ida:</small>
                      <input type="text" value={jogo.resultadoIda} onChange={(e) => handleUpdate(index, 'resultadoIda', e.target.value)} />
                    </div>
                  )}
                  <span>VS</span>
                </div>
                <div className="time-col">
                  <select value={jogo.time2} onChange={(e) => handleUpdate(index, 'time2', e.target.value)}>
                    <option value="">-- Selecione --</option>
                    {(competicao === "L2" ? TIMES_L2 : TIMES_EL).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="wo-label"><input type="checkbox" checked={jogo.wo2} onChange={(e) => handleUpdate(index, 'wo2', e.target.checked)} /> WO</label>
                </div>
              </div>
              <div className="palpites-grid">
                <textarea disabled={jogo.wo1} value={jogo.wo1 ? "" : jogo.equipe1Palpites} onChange={(e) => handleUpdate(index, 'equipe1Palpites', e.target.value)} placeholder="5 ou 8 palpites..." />
                <textarea disabled={jogo.wo2} value={jogo.wo2 ? "" : jogo.equipe2Palpites} onChange={(e) => handleUpdate(index, 'equipe2Palpites', e.target.value)} placeholder="5 ou 8 palpites..." />
              </div>
            </div>
          ))}
        </section>
        <section className="preview-section">
          <div className="preview-sticky">
            <div className="preview-header">
              <span>Resultado formatado</span>
              <button className="copy-button" onClick={() => navigator.clipboard.writeText(resultadoFinal)}>Copiar WhatsApp</button>
            </div>
            <div className="preview-box"><pre>{resultadoFinal}</pre></div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App