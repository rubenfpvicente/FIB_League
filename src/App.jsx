import { useState, useMemo, useEffect } from 'react';
import './index.css';
import { ConfigHeader } from './components/ConfigHeader';
import { MatchCard } from './components/MatchCard';
import { ResultPreview } from './components/ResultPreview';
import { formatarNomeJogador, extrairPalpitesDoBloco } from './utils/formatters';
import { lerConfrontos } from './utils/fixtures';

function App() {
  const [confrontosTexto, setConfrontosTexto] = useState('');
  const [resultadoGlobal, setResultadoGlobal] = useState('');
  const [jogos, setJogos] = useState([]);
  const dadosConfrontos = useMemo(() => lerConfrontos(confrontosTexto), [confrontosTexto]);

  useEffect(() => {
    setJogos((anteriores) => {
      const existentes = new Map(anteriores.map((jogo) => [`${jogo.time1}|${jogo.time2}`, jogo]));
      return dadosConfrontos.confrontos.map(({ time1, time2, resultadoIda }) => {
        const anterior = existentes.get(`${time1}|${time2}`);
        return anterior ? { ...anterior, resultadoIda } : {
          time1, time2, equipe1Palpites: '', equipe2Palpites: '',
          wo1: false, wo2: false, resultadoIda,
        };
      });
    });
  }, [dadosConfrontos]);

  const handleUpdate = (index, field, value) => {
    const novos = [...jogos];
    novos[index][field] = value;
    setJogos(novos);
  };

  // O "Motor" de Cálculo via useMemo (Performance)
  const resultadoFormatado = useMemo(() => {
    const { competicao, titulo, rodada } = dadosConfrontos;
    const resArray = resultadoGlobal
      .replace(/[()]/g, '/')
      .split('/')
      .map(s => s.trim())
      .filter(s => s !== "");
    const isVolta = rodada.includes("Volta") || rodada === "Final";

    let output = "";
    if (titulo) output = `*${titulo}*`;
    else if (competicao === "EL") output = "🇪🇺 *FIB Europa League* 🇪🇺";
    else if (competicao === "CONF") output = "🇪🇺 *FIB Conference League* 🇪🇺";
    else if (competicao === "CUP_1" || competicao === "CUP_2" || competicao === "CUP") output = "🇵🇭 *FIB Cup* 🇵🇭";
    else if (competicao === "NL") output = "🇵🇭 *FIB Nations League* 🇵🇭";
    else output = `*🇵🇭 FIB League ${competicao.replace("L", "")} 🇵🇭*`;

    const linhaSubtitulo = `*${rodada || 'Rodada'}*`;

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

    jogos.forEach((jogo, index) => {
      if (!jogo.time1 || !jogo.time2) return;

      // Adicionar nome do grupo a cada 2 jogos para CUP_1 e CUP_2
      if ((competicao === "CUP_1" || competicao === "CUP_2") && index % 2 === 0) {
        const grupos_cup1 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const grupos_cup2 = ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
        const grupos = competicao === "CUP_1" ? grupos_cup1 : grupos_cup2;
        const grupoIndex = Math.floor(index / 2);
        output += `*Grupo ${grupos[grupoIndex]}*\n\n`;
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
  }, [dadosConfrontos, jogos, resultadoGlobal]);

  return (
    <div className="app-wrapper">
      <ConfigHeader
        confrontosTexto={confrontosTexto}
        setConfrontosTexto={setConfrontosTexto}
        resultadoGlobal={resultadoGlobal}
        setResultadoGlobal={setResultadoGlobal}
      />
      <main className="main-content">
        <section className="inputs-section">
          {jogos.map((jogo, index) => (
            <MatchCard 
              key={index} index={index} jogo={jogo} 
              onUpdate={handleUpdate} 
            />
          ))}
        </section>
        <ResultPreview texto={resultadoFormatado} />
      </main>
    </div>
  );
}

export default App;
