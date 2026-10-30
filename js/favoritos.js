// Cidades favoritas, última cidade vista e unidade, salvas no navegador.

const CHAVE = 'clima-agora';

function ler() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || {};
  } catch {
    return {};
  }
}

function gravar(dados) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
  } catch {
    // Armazenamento bloqueado: o app funciona, só não lembra das escolhas.
  }
}

export function carregarPreferencias() {
  const d = ler();
  return { favoritos: d.favoritos || [], ultima: d.ultima || null, unidade: d.unidade || 'celsius' };
}

export function salvarPreferencias(prefs) {
  gravar(prefs);
}

export function alternarFavorito(favoritos, cidade) {
  const existe = favoritos.some((f) => f.id === cidade.id);
  return existe ? favoritos.filter((f) => f.id !== cidade.id) : [...favoritos, cidade].slice(-8);
}
