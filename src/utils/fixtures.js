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

const CODIGOS_BANDEIRAS_BRITANICAS = {
  inglaterra: 'gb-eng',
  escocia: 'gb-sct',
  paisDeGales: 'gb-wls',
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

const obterCodigoDaBandeira = (bandeira) => {
  const paisBritanico = Object.keys(BANDEIRAS_BRITANICAS)
    .find((chave) => bandeira === BANDEIRAS_BRITANICAS[chave]);
  if (paisBritanico) return CODIGOS_BANDEIRAS_BRITANICAS[paisBritanico];

  const indicadores = Array.from(bandeira)
    .map((caractere) => caractere.codePointAt(0))
    .filter((codigo) => codigo >= 0x1F1E6 && codigo <= 0x1F1FF);

  return indicadores.length === 2
    ? String.fromCodePoint(...indicadores.map((codigo) => codigo - 0x1F1E6 + 97))
    : null;
};

export const separarTime = (time) => {
  const [bandeira, ...partesDoNome] = time.split(' ');
  const codigoBandeira = obterCodigoDaBandeira(bandeira);

  return codigoBandeira
    ? { codigoBandeira, nome: partesDoNome.join(' ') }
    : { codigoBandeira: null, nome: time };
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

// Lê o formato publicado no WhatsApp: título, rodada e uma linha "Time vs Time" por jogo.
export const lerConfrontos = (bloco) => {
  const linhas = bloco
    .split(/\r?\n/)
    .map(normalizar)
    .filter(Boolean);

  let grupoAtual = '';
  const confrontos = linhas.reduce((lista, linha) => {
    if (/^grupo\s+[a-z0-9]+$/i.test(linha)) {
      grupoAtual = linha;
      return lista;
    }

    if (/\s+vs\s+/i.test(linha)) {
      const resultadoIda = linha.match(/\((\d+\s*-\s*\d+)\)\s*$/)?.[1]?.replace(/\s/g, '');
      const confrontoSemIda = linha.replace(/\s*\(\d+\s*-\s*\d+\)\s*$/, '');
      const [time1, time2] = confrontoSemIda.split(/\s+vs\s+/i).map((time) => time.trim());
      if (time1 && time2) {
        lista.push({
          time1: normalizarTime(time1), time2: normalizarTime(time2),
          resultadoIda: resultadoIda || '0-0', grupo: grupoAtual,
        });
      }
    }
    return lista;
  }, []);

  const primeiraLinhaDeJogo = linhas.findIndex((linha) => /\s+vs\s+/i.test(linha));
  const cabecalho = primeiraLinhaDeJogo === -1 ? linhas : linhas.slice(0, primeiraLinhaDeJogo);
  const titulo = cabecalho[0] || '';
  const rodada = cabecalho[1] || '';
  const subtitulos = cabecalho.slice(2).filter((linha) => !/^grupo\s+[a-z0-9]+$/i.test(linha));

  return {
    titulo,
    rodada,
    subtitulos,
    confrontos,
  };
};
