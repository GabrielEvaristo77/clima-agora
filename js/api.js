// Comunicação com a API gratuita Open-Meteo (https://open-meteo.com).
// Não precisa de cadastro nem de chave de acesso.

const URL_BUSCA = 'https://geocoding-api.open-meteo.com/v1/search';
const URL_PREVISAO = 'https://api.open-meteo.com/v1/forecast';

export function urlBusca(nome) {
  const p = new URLSearchParams({ name: nome, count: '6', language: 'pt', format: 'json' });
  return `${URL_BUSCA}?${p}`;
}

export function urlPrevisao(lat, lon, unidade = 'celsius') {
  const p = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,precipitation_probability,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '7',
    temperature_unit: unidade,
    wind_speed_unit: 'kmh',
  });
  return `${URL_PREVISAO}?${p}`;
}

// fetch com tempo limite: se a API demorar mais de 10 s, desiste e mostra erro.
async function buscarJSON(url, fetchFn = fetch) {
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), 10000);
  try {
    const resposta = await fetchFn(url, { signal: controle.signal });
    if (!resposta.ok) throw new Error(`A API respondeu com erro ${resposta.status}.`);
    return await resposta.json();
  } catch (erro) {
    if (erro.name === 'AbortError') throw new Error('A API demorou demais para responder.');
    if (erro instanceof TypeError) throw new Error('Sem conexão com a internet.');
    throw erro;
  } finally {
    clearTimeout(timer);
  }
}

export async function buscarCidades(nome, fetchFn) {
  if (nome.trim().length < 2) return [];
  const dados = await buscarJSON(urlBusca(nome.trim()), fetchFn);
  return (dados.results || []).map((r) => ({
    id: r.id,
    nome: r.name,
    regiao: [r.admin1, r.country].filter(Boolean).join(', '),
    lat: r.latitude,
    lon: r.longitude,
  }));
}

export async function buscarPrevisao(lat, lon, unidade, fetchFn) {
  return buscarJSON(urlPrevisao(lat, lon, unidade), fetchFn);
}
