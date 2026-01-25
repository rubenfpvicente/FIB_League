import { useState, useMemo } from 'react';
import './index.css';
import { ConfigHeader } from './components/ConfigHeader';
import { MatchCard } from './components/MatchCard';
import { ResultPreview } from './components/ResultPreview';
import { TIMES_L2, TIMES_L3,TIMES_L4, TIMES_EL,TIMES_CONF, TIMES_CUP } from './utils/constants';
import { formatarNomeJogador, extrairPalpitesDoBloco } from './utils/formatters';

function App() {
  const [config, setConfig] = useState({ competicao: "L2", rodada: "1", resultadoGlobal: "" });
  const [jogos, setJogos] = useState(
    Array(18).fill(null).map(() => ({ 
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
    if (["L2", "L3", "L4"].includes(competicao)) return 10;
    
    // Lógica da Cup
    if (competicao === "CUP") {
      if (!isNaN(rodada) && parseInt(rodada) <= 5) return 18; // 6 Grupos x 3 jogos
      if (rodada.includes("16 Avos")) return 16;
      if (rodada.includes("Oitavas")) return 8;
      if (rodada.includes("Quartas")) return 4;
      if (rodada.includes("Semifinais")) return 2;
      if (rodada === "Final") return 1;
    }

    // Lógica da Europa League
    if (competicao === "EL" || competicao === "CONF") {
      if (!isNaN(rodada) && parseInt(rodada) <= 5) return 12; // 6 Grupos x 2 jogos
      if (rodada.includes("Oitavas")) return 8;
      if (rodada.includes("Quartas")) return 4;
      if (rodada.includes("Semifinais")) return 2;
      if (rodada === "Final") return 1;
    }
    return 10;
  };

  // O "Motor" de Cálculo via useMemo (Performance)
  const resultadoFormatado = useMemo(() => {
    const { competicao, rodada, resultadoGlobal } = config;
    const resArray = resultadoGlobal
      .replace(/[()]/g, '/')
      .split('/')
      .map(s => s.trim())
      .filter(s => s !== "");
    const isVolta = rodada.includes("Volta") || rodada === "Final";
    const isGrupos = competicao === "EL" && !isNaN(rodada) && parseInt(rodada) <= 5;

    let output = "";
    if (competicao === "EL") output = "🇪🇺⚜ *FIB Europa League* ⚜🇪🇺";
    else if (competicao === "CONF") output = "🇪🇺⚜ *FIB Conference League* ⚜🇪🇺";
    else if (competicao === "CUP") output = "🇵🇭 FIB Cup 🇵🇭";
    else output = `*🇵🇭 FIB League ${competicao.replace("L", "")} 🇵🇭*`;

    const ehRodadaNumerica = !isNaN(rodada);

    let linhaSubtitulo = "";
    if (ehRodadaNumerica) {
      linhaSubtitulo = `*Rodada ${rodada}*`;
    } else {
      linhaSubtitulo = `*${rodada}*`; // Aqui entra "Oitavas - Ida", "Final", etc.
    }

    output += `\n\n${linhaSubtitulo}\n\n`;

    const calcular = (txt, wo, start, end) => {
      if (wo) return { gols: 0, lista: ["*WO*"] };
      const texto = extrairPalpitesDoBloco(txt);
      const linhas = texto.split('\n').map(l => l.trim()).filter(l => l !== "");
      let gols = 0; let lista = [];
      for (let i = 0; i < linhas.length; i += 2) {
        const paps = (linhas[i+1] || "")
          .replace(/[()]/g, '/')      // Substitui "(" e ")" por "/"
          .split('/')                 // Divide pelas barras
          .map(s => s.trim())         // Remove espaços de cada palpite
          .filter(s => s !== "");  
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
      
      if (isGrupos) {
        // Europa League: Grupo muda a cada 2 jogos
        if (competicao === "EL" && index % 2 === 0) {
          output += `*Grupo ${["A","B","C","D","E","F"][Math.floor(index/2)]}*\n\n`;
        }
        // FIB Cup: Grupo muda a cada 3 jogos
        if (competicao === "CUP" && index % 3 === 0) {
          output += `*Grupo ${["A","B","C","D","E","F"][Math.floor(index/3)]}*\n\n`;
        }
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

  const listaTimesAtual = () => {
    switch(config.competicao) {
      case "L2": return TIMES_L2;
      case "L3": return TIMES_L3;
      case "L4": return TIMES_L4;
      case "EL": return TIMES_EL;
      case "CONF": return TIMES_CONF;
      case "CUP": return TIMES_CUP;
      default: return TIMES_L2;
    }
  };

  return (
    <div className="app-wrapper">
      <ConfigHeader config={config} setConfig={setConfig} />
      <main className="main-content">
        <section className="inputs-section">
          {jogos.slice(0, getQtdJogos()).map((jogo, index) => (
            <MatchCard 
              key={index} index={index} jogo={jogo} 
              onUpdate={handleUpdate} 
              times={listaTimesAtual()}
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