const normalizar = (texto) => texto
  .replace(/[*_`]/g, '')
  .replace(/&#x20;|&nbsp;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const BANDEIRAS_BRITANICAS = {
  inglaterra: '🏴\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}',
  escocia: '🏴\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}',
  paisDeGales: '🏴\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}',
};

const BANDEIRAS_BRITANICAS_VISUAIS = {
  inglaterra: '🇽🇪',
  escocia: '🇽🇸',
  paisDeGales: '🇽🇼',
};

const TIMES_BRITANICOS = {
  inglaterra: new Set([
    'arsenal', 'aston villa', 'birmingham city', 'brighton', 'chelsea', 'corinthian-casuals',
    'derby county', 'leicester city', 'liverpool', 'manchester city', 'millwall', 'southampton',
    'west ham', 'wolverhampton', 'inglaterra',
  ]),
  escocia: new Set(['celtic', 'dundee fc', 'rangers', 'escócia', 'escocia']),
  paisDeGales: new Set(['swansea city', 'wrexham', 'país de gales', 'pais de gales']),
};

const corrigirBandeiraBritanica = (time) => {
  if (!time.startsWith('🏴')) return time;
  const nome = time.slice('🏴'.length).trim().toLowerCase();
  const pais = Object.entries(TIMES_BRITANICOS).find(([, times]) => times.has(nome))?.[0];
  return pais ? `${BANDEIRAS_BRITANICAS[pais]} ${time.slice('🏴'.length).trim()}` : time;
};

// O Windows não desenha estas bandeiras regionais em muitos navegadores.
// No ecrã usamos os indicadores visuais antigos; a cópia preserva o emoji oficial.
export const formatarTimeParaExibicao = (time) => {
  const pais = Object.keys(BANDEIRAS_BRITANICAS)
    .find((chave) => time.includes(BANDEIRAS_BRITANICAS[chave]));
  return pais ? time.replace(BANDEIRAS_BRITANICAS[pais], BANDEIRAS_BRITANICAS_VISUAIS[pais]) : time;
};

// Aceita bandeira antes ou depois do nome, mas guarda-a sempre antes do time.
const normalizarTime = (time) => {
  const partes = time.trim().split(/\s+/);
  const primeiro = partes[0];
  const ultimo = partes.at(-1);
  const eBandeira = (parte) => /^(?:\p{Regional_Indicator}{2}|🏴)/u.test(parte);

  let timeNormalizado = time.trim();
  if (eBandeira(primeiro)) timeNormalizado = `${primeiro} ${partes.slice(1).join(' ')}`.trim();
  else if (eBandeira(ultimo)) timeNormalizado = `${ultimo} ${partes.slice(0, -1).join(' ')}`.trim();
  return corrigirBandeiraBritanica(timeNormalizado);
};

const identificarCompeticao = (titulo) => {
  const texto = titulo.toLowerCase();
  if (texto.includes('conference')) return 'CONF';
  if (texto.includes('europa league')) return 'EL';
  if (texto.includes('nations league')) return 'NL';
  if (texto.includes('cup') && /grupos?\s*(a\s*[-–]\s*h|a\s*[-–]\s*h)/i.test(titulo)) return 'CUP_1';
  if (texto.includes('cup') && /grupos?\s*(i\s*[-–]\s*p|i\s*[-–]\s*p)/i.test(titulo)) return 'CUP_2';
  if (texto.includes('cup')) return 'CUP';

  const league = texto.match(/league\s*(\d+)/i);
  return league ? `L${league[1]}` : 'L2';
};

// Lê o formato publicado no WhatsApp: título, rodada e uma linha "Time vs Time" por jogo.
export const lerConfrontos = (bloco) => {
  const linhas = bloco
    .split(/\r?\n/)
    .map(normalizar)
    .filter(Boolean);

  const confrontos = linhas
    .filter((linha) => /\s+vs\s+/i.test(linha))
    .map((linha) => {
      const resultadoIda = linha.match(/\((\d+\s*-\s*\d+)\)\s*$/)?.[1]?.replace(/\s/g, '');
      const confrontoSemIda = linha.replace(/\s*\(\d+\s*-\s*\d+\)\s*$/, '');
      const [time1, time2] = confrontoSemIda.split(/\s+vs\s+/i).map((time) => time.trim());
      return time1 && time2
        ? { time1: normalizarTime(time1), time2: normalizarTime(time2), resultadoIda: resultadoIda || '0-0' }
        : null;
    })
    .filter(Boolean);

  const primeiraLinhaDeJogo = linhas.findIndex((linha) => /\s+vs\s+/i.test(linha));
  const cabecalho = primeiraLinhaDeJogo === -1 ? linhas : linhas.slice(0, primeiraLinhaDeJogo);
  const titulo = cabecalho[0] || '';
  const rodada = cabecalho[1] || '';

  return {
    competicao: identificarCompeticao(titulo),
    titulo,
    rodada,
    confrontos,
  };
};
