import { useState, useMemo } from 'react';
import './index.css';
import { ConfigHeader } from './components/ConfigHeader';
import { MatchCard } from './components/MatchCard';
import { ResultPreview } from './components/ResultPreview';
import { TIMES_L2, TIMES_L3,TIMES_L4, TIMES_EL } from './utils/constants';
import { formatarNomeJogador, extrairPalpitesDoBloco } from './utils/formatters';

function App() {
  const [config, setConfig] = useState({ competicao: "L2", rodada: "1", resultadoGlobal: "" });
  const [jogos, setJogos] = useState(
    Array(14).fill(null).map(() => ({ 
      time1: "", time2: "", equipe1Palpites: "", equipe2Palpites: "",
      wo1: false, wo2: false, resultadoIda: "0-0"
    }))
  );

  const handleUpdate = (index, field, value) => {
    const novos = [...jogos];
    novos[index][field] = value;
    setJogos(novos);
  };

  const getQtdJogos = () => {
    const { competicao, rodada } = config;
    if (competicao === "L2" || competicao === "L3" || competicao === "L4") return 10;
    if (!isNaN(rodada) && parseInt(rodada) <= 5) return 12;
    if (rodada === "Final") return 1;
    if (rodada.includes("Semifinais")) return 2;
    if (rodada.includes("Quartas")) return 4;
    if (rodada.includes("Oitavas")) return 8;
    return 10;
  };

  // O "Motor" de Cálculo via useMemo (Performance)
  const resultadoFormatado = useMemo(() => {
    const { competicao, rodada, resultadoGlobal } = config;
    const resArray = resultadoGlobal.split('/').map(s => s.trim());
    const isVolta = rodada.includes("Volta") || rodada === "Final";
    const isGrupos = competicao === "EL" && !isNaN(rodada) && parseInt(rodada) <= 5;

    let output = "";
    if (competicao === "L2") output = "*🇵🇭 FIB League 2 🇵🇭*";
    else if (competicao === "L3") output = "*🇵🇭 FIB League 3 🇵🇭*";
    else if (competicao === "L4") output = "*🇵🇭 FIB League 4 🇵🇭*";
    else output = "🇪🇺⚜ *FIB Europa League* ⚜🇪🇺";
    output += `\n\n${isGrupos ? `*Fase de Grupos - Rodada ${rodada}*` : `*Rodada ${rodada}*`}\n\n`;

    const calcular = (txt, wo, start, end) => {
      if (wo) return { gols: 0, lista: ["*WO*"] };
      const texto = extrairPalpitesDoBloco(txt);
      const linhas = texto.split('\n').map(l => l.trim()).filter(l => l !== "");
      let gols = 0; let lista = [];
      for (let i = 0; i < linhas.length; i += 2) {
        const paps = (linhas[i+1] || "").split('/').map(s => s.trim());
        let pts = 0;
        paps.forEach((p, idx) => { if (idx >= start && idx <= end && resArray[idx] && p === resArray[idx]) pts++; });
        if (pts > 0) {
          const nf = formatarNomeJogador(linhas[i]);
          lista.push(pts > 1 ? `${nf} (${pts})` : nf);
          gols += pts;
        }
      }
      return { gols, lista };
    };

    jogos.slice(0, getQtdJogos()).forEach((jogo, index) => {
      if (!jogo.time1 || !jogo.time2) return;
      
      if (isGrupos && index % 2 === 0) {
        output += `*Grupo ${["A","B","C","D","E","F"][Math.floor(index/2)]}*\n\n`;
      }

      const f = (t) => ({ flag: t.split(' ')[0], nome: t.replace(t.split(' ')[0], '').trim() });
      const t1 = f(jogo.time1); const t2 = f(jogo.time2);
      
      const r1 = calcular(jogo.equipe1Palpites, jogo.wo1, 0, 4);
      const r2 = calcular(jogo.equipe2Palpites, jogo.wo2, 0, 4);

      const [ida1, ida2] = jogo.resultadoIda.split('-').map(n => parseInt(n) || 0);
      const aggN1 = r1.gols + ida1; const aggN2 = r2.gols + ida2;

      let houveP = isVolta && aggN1 === aggN2 && resArray.length > 5;
      let rp1 = { gols: 0, lista: [] }, rp2 = { gols: 0, lista: [] };
      
      if (houveP) {
        rp1 = calcular(jogo.equipe1Palpites, jogo.wo1, 5, 7);
        rp2 = calcular(jogo.equipe2Palpites, jogo.wo2, 5, 7);
      }

      let finAgg1 = aggN1 + rp1.gols, finAgg2 = aggN2 + rp2.gols;
      
      let n1 = t1.nome, n2 = t2.nome, nP1 = t1.nome, nP2 = t2.nome;

      if (isVolta) {
        if (houveP) {
          if (finAgg1 > finAgg2) nP1 = `*${t1.nome}*`; 
          else if (finAgg2 > finAgg1) nP2 = `*${t2.nome}*`;
        } else {
          if (aggN1 > aggN2) n1 = `*${t1.nome}*`; 
          else if (aggN2 > aggN1) n2 = `*${t2.nome}*`;
        }
      }

      // MONTAGEM DA LINHA DE PLACAR
      if (isVolta) {
        output += `${t1.flag} ${n1} *${r1.gols}-${r2.gols}* ${n2} ${t2.flag} (${aggN1}-${aggN2})\n`;
      } else {
        output += `${t1.flag} ${t1.nome} *${r1.gols}-${r2.gols}* ${t2.nome} ${t2.flag}\n`;
      }

      output += `⚽${t1.flag}: ${r1.lista.join(', ') || '❌'}\n⚽${t2.flag}: ${r2.lista.join(', ') || '❌'}\n`;

      if (houveP) {
        output += `\n*Prorrogação*\n${t1.flag} ${nP1} *${rp1.gols}-${rp2.gols}* ${nP2} ${t2.flag} (${finAgg1}-${finAgg2})\n`;
        output += `⚽${t1.flag}: ${rp1.lista.join(', ') || '❌'}\n⚽${t2.flag}: ${rp2.lista.join(', ') || '❌'}\n`;
      }
      
      output += `\n`;
    });
    return output.trim();
  }, [config, jogos]);

  return (
    <div className="app-wrapper">
      <ConfigHeader config={config} setConfig={setConfig} />
      <main className="main-content">
        <section className="inputs-section">
          {jogos.slice(0, getQtdJogos()).map((jogo, index) => (
            <MatchCard 
              key={index} index={index} jogo={jogo} 
              onUpdate={handleUpdate} 
              times={
                config.competicao === "L2" ? TIMES_L2 : 
                config.competicao === "L3" ? TIMES_L3 :
                config.competicao === "L4" ? TIMES_L4 :
                TIMES_EL
              }
              showIda={config.rodada.includes("Volta") || config.rodada === "Final"}
            />
          ))}
        </section>
        <ResultPreview texto={resultadoFormatado} />
      </main>
    </div>
  );
}

export default App;