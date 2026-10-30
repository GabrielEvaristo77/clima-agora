// Ícones desenhados em SVG, sem imagens externas.
// Todos usam "currentColor", então herdam a cor do texto.

const NUVEM = '<path d="M7 18h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.1 9.2 4.4 4.4 0 0 0 7 18z"/>';
const SOL_PEQUENO = '<circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.5M2.5 8H1.5M3.4 3.4l1 1M12.6 3.4l-1 1"/>';
const LUA_PEQUENA = '<path d="M10.5 3.2A4.2 4.2 0 1 0 12.8 9a3.4 3.4 0 0 1-2.3-5.8z"/>';

const DESENHOS = {
  sol: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  lua: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  'sol-nuvem': SOL_PEQUENO + '<path d="M9 19h8.5a3.5 3.5 0 0 0 .5-6.96A4.8 4.8 0 0 0 9.1 11a3.9 3.9 0 0 0-.1 8z"/>',
  'lua-nuvem': LUA_PEQUENA + '<path d="M9 19h8.5a3.5 3.5 0 0 0 .5-6.96A4.8 4.8 0 0 0 9.1 11a3.9 3.9 0 0 0-.1 8z"/>',
  nuvem: NUVEM,
  neblina: '<path d="M7 13h10a3.5 3.5 0 0 0 .5-6.96A4.8 4.8 0 0 0 7.1 5.2 3.9 3.9 0 0 0 7 13z"/><path d="M4 17h16M6 20.5h12"/>',
  garoa: '<path d="M7 14h10a3.5 3.5 0 0 0 .5-6.96A4.8 4.8 0 0 0 7.1 6.2 3.9 3.9 0 0 0 7 14z"/><path d="M9 17.5v1M13 17.5v1M17 17.5v1M11 20.5v1M15 20.5v1"/>',
  chuva: '<path d="M7 14h10a3.5 3.5 0 0 0 .5-6.96A4.8 4.8 0 0 0 7.1 6.2 3.9 3.9 0 0 0 7 14z"/><path d="M9 17l-1 3M13 17l-1 3M17 17l-1 3"/>',
  neve: '<path d="M7 14h10a3.5 3.5 0 0 0 .5-6.96A4.8 4.8 0 0 0 7.1 6.2 3.9 3.9 0 0 0 7 14z"/><path d="M9 18h.01M13 18h.01M17 18h.01M11 21h.01M15 21h.01" stroke-width="2.6"/>',
  tempestade: '<path d="M7 14h10a3.5 3.5 0 0 0 .5-6.96A4.8 4.8 0 0 0 7.1 6.2 3.9 3.9 0 0 0 7 14z"/><path d="M13 14l-2.5 4h3L11 22"/>',
  gota: '<path d="M12 3.5s6 6.5 6 10.5a6 6 0 0 1-12 0c0-4 6-10.5 6-10.5z"/>',
  vento: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h7"/>',
  termometro: '<path d="M14 14.8V4.5a2 2 0 0 0-4 0v10.3a4 4 0 1 0 4 0z"/>',
  nascer: '<path d="M4 18h16M7 14a5 5 0 0 1 10 0M12 3v4M9.5 5.5 12 3l2.5 2.5"/>',
  por: '<path d="M4 18h16M7 14a5 5 0 0 1 10 0M12 3v4M9.5 4.5 12 7l2.5-2.5"/>',
  estrela: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  local: '<path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  busca: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
};

export function icone(nome, tamanho = 24, extra = '') {
  return `<svg class="icone ${extra}" width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${DESENHOS[nome] || DESENHOS.nuvem}</svg>`;
}
