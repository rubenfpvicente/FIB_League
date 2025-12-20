export const formatarNomeJogador = (nome) => {
  return nome
    .replace(/[^\p{L}']/gu, ' ')
    .toLowerCase()
    .split(' ')
    .filter(p => p !== '')
    .map(palavra =>
      palavra.split("'").map(parte =>
        parte ? parte.charAt(0).toUpperCase() + parte.slice(1) : ''
      ).join("'")
    )
    .join(' ');
};

export const extrairPalpitesDoBloco = (texto) => {
  const marcadorInicio = "*Palpites 🏆⬇:*";
  const marcadorFim = "- - - - - - - - - - - - - - - - - - -";
  if (texto.includes(marcadorInicio)) {
    let p = texto.split(marcadorInicio)[1];
    if (p.includes(marcadorFim)) p = p.split(marcadorFim)[0];
    return p.trim();
  }
  return texto.trim();
};