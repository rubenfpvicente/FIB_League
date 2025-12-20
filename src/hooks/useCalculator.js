import { formatarNomeJogador, extrairPalpitesDoBloco } from '../utils/formatters';

export const useCalculator = (competicao, rodada, resultadoGlobal, jogos) => {
  
  const calcularGols = (txt, wo, resArray, startIndex, endIndex) => {
    if (wo) return { gols: 0, lista: ["*WO*"] };
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

  const gerarResultado = () => {
    const resArray = resultadoGlobal.split('/').map(s => s.trim());
    const isEliminatoriaVolta = rodada.includes("Volta") || rodada === "Final";
    const isELGrupos = competicao === "EL" && !isNaN(rodada) && parseInt(rodada) <= 5;

    let titulo = competicao === "L2" ? "*FIB League 2*" : "🇪🇺⚜ *FIB Europa League* ⚜🇪🇺";
    let subTitulo = isELGrupos ? `*Rodada ${rodada}*` : `*${rodada}*`;
    let output = `${titulo}\n\n${subTitulo}\n\n`;

    jogos.forEach((jogo, index) => {
      if (!jogo.time1 || !jogo.time2) return;

      if (isELGrupos && index % 2 === 0) {
        const letra = ["A", "B", "C", "D", "E", "F"][Math.floor(index / 2)];
        output += `*Grupo ${letra}*\n\n`;
      }

      const f = (t) => ({ flag: t.split(' ')[0], nome: t.replace(t.split(' ')[0], '').trim() });
      const t1 = f(jogo.time1); const t2 = f(jogo.time2);

      const res1 = calcularGols(jogo.equipe1Palpites, jogo.wo1, resArray, 0, 4);
      const res2 = calcularGols(jogo.equipe2Palpites, jogo.wo2, resArray, 0, 4);

      const [ida1, ida2] = (jogo.resultadoIda || "0-0").split('-').map(n => parseInt(n) || 0);
      const agg1 = res1.gols + ida1; const agg2 = res2.gols + ida2;

      // ... Lógica de Prorrogação e Negrito ...
      // (Aqui você insere o restante da lógica que já construímos)
      
      output += `${t1.flag} ${t1.nome} *${res1.gols}-${res2.gols}* ${t2.nome} ${t2.flag}\n\n`;
    });

    return output.trim();
  };

  return gerarResultado();
};