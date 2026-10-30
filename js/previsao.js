// Transforma a resposta da API nos dados que a tela precisa.
// Funções puras, testadas em tests/previsao.test.js.
import { descreverTempo } from './clima.js';

// As próximas N horas a partir da hora atual da cidade.
export function proximasHoras(hourly, horaAtual, quantidade = 24) {
  // horaAtual vem como "2026-10-30T15:45"; a lista horária usa "2026-10-30T15:00".
  const inicioDaHora = horaAtual.slice(0, 13) + ':00';
  let inicio = hourly.time.indexOf(inicioDaHora);
  if (inicio === -1) inicio = hourly.time.findIndex((t) => t >= inicioDaHora);
  if (inicio === -1) return [];
  return hourly.time.slice(inicio, inicio + quantidade).map((hora, i) => ({
    hora: hora.slice(11, 16),
    temperatura: Math.round(hourly.temperature_2m[inicio + i]),
    chuva: hourly.precipitation_probability?.[inicio + i] ?? 0,
    ...descreverTempo(hourly.weather_code[inicio + i], hourly.is_day?.[inicio + i] !== 0),
  }));
}

const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function nomeDoDia(dataISO, indice) {
  if (indice === 0) return 'Hoje';
  if (indice === 1) return 'Amanhã';
  const [a, m, d] = dataISO.split('-').map(Number);
  return DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
}

// Previsão da semana com a posição de cada barra de mínima/máxima
// em relação à menor e à maior temperatura da semana (0 a 100%).
export function semana(daily) {
  const minimas = daily.temperature_2m_min.map(Math.round);
  const maximas = daily.temperature_2m_max.map(Math.round);
  const menor = Math.min(...minimas);
  const maior = Math.max(...maximas);
  const faixa = maior - menor || 1;
  return daily.time.map((data, i) => ({
    dia: nomeDoDia(data, i),
    minima: minimas[i],
    maxima: maximas[i],
    chuva: daily.precipitation_probability_max?.[i] ?? 0,
    inicio: ((minimas[i] - menor) / faixa) * 100,
    largura: ((maximas[i] - minimas[i]) / faixa) * 100,
    ...descreverTempo(daily.weather_code[i], true),
  }));
}

export function horario(isoDataHora) {
  return isoDataHora ? isoDataHora.slice(11, 16) : '--:--';
}

// Pontos do gráfico de temperatura (coordenadas SVG).
export function pontosDoGrafico(horas, largura, altura, margem = 24) {
  if (!horas.length) return [];
  const temps = horas.map((h) => h.temperatura);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const faixa = max - min || 1;
  const passo = horas.length > 1 ? (largura - margem * 2) / (horas.length - 1) : 0;
  return horas.map((h, i) => ({
    x: margem + i * passo,
    y: margem + (1 - (h.temperatura - min) / faixa) * (altura - margem * 2),
  }));
}

// Curva suave passando pelos pontos (para o "d" de um <path>).
export function caminhoSuave(pontos) {
  if (!pontos.length) return '';
  let d = `M${pontos[0].x.toFixed(1)},${pontos[0].y.toFixed(1)}`;
  for (let i = 1; i < pontos.length; i++) {
    const a = pontos[i - 1];
    const b = pontos[i];
    const meio = (a.x + b.x) / 2;
    d += ` C${meio.toFixed(1)},${a.y.toFixed(1)} ${meio.toFixed(1)},${b.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
  }
  return d;
}
