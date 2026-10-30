// Tradução dos códigos de tempo (padrão WMO) que a Open-Meteo devolve.
// Cada código vira uma descrição em português e um ícone.

const CODIGOS = {
  0: ['Céu limpo', 'sol'],
  1: ['Poucas nuvens', 'sol-nuvem'],
  2: ['Parcialmente nublado', 'sol-nuvem'],
  3: ['Nublado', 'nuvem'],
  45: ['Neblina', 'neblina'],
  48: ['Neblina com geada', 'neblina'],
  51: ['Garoa fraca', 'garoa'],
  53: ['Garoa', 'garoa'],
  55: ['Garoa forte', 'garoa'],
  56: ['Garoa congelante', 'garoa'],
  57: ['Garoa congelante forte', 'garoa'],
  61: ['Chuva fraca', 'chuva'],
  63: ['Chuva', 'chuva'],
  65: ['Chuva forte', 'chuva'],
  66: ['Chuva congelante', 'chuva'],
  67: ['Chuva congelante forte', 'chuva'],
  71: ['Neve fraca', 'neve'],
  73: ['Neve', 'neve'],
  75: ['Neve forte', 'neve'],
  77: ['Grãos de neve', 'neve'],
  80: ['Pancadas de chuva fracas', 'chuva'],
  81: ['Pancadas de chuva', 'chuva'],
  82: ['Pancadas de chuva fortes', 'chuva'],
  85: ['Pancadas de neve', 'neve'],
  86: ['Pancadas de neve fortes', 'neve'],
  95: ['Trovoada', 'tempestade'],
  96: ['Trovoada com granizo', 'tempestade'],
  99: ['Trovoada com granizo forte', 'tempestade'],
};

export function descreverTempo(codigo, ehDia = true) {
  const [descricao, icone] = CODIGOS[codigo] || ['Tempo indefinido', 'nuvem'];
  // À noite, "sol" vira "lua".
  const iconeFinal = ehDia ? icone : icone.replace('sol', 'lua');
  return { descricao, icone: iconeFinal };
}

// Tema de cores do fundo conforme o tempo e o horário.
export function temaDoCeu(codigo, ehDia) {
  if (!ehDia) return 'noite';
  if (codigo >= 95) return 'tempestade';
  if (codigo >= 51) return 'chuva';
  if (codigo >= 3) return 'nublado';
  return 'ensolarado';
}
