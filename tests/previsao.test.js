import { test } from 'node:test';
import assert from 'node:assert/strict';
import { proximasHoras, semana, nomeDoDia, pontosDoGrafico, caminhoSuave } from '../js/previsao.js';
import { descreverTempo, temaDoCeu } from '../js/clima.js';
import { urlBusca, urlPrevisao, buscarCidades, buscarPrevisao } from '../js/api.js';
import { alternarFavorito } from '../js/favoritos.js';
import { respostaExemplo } from './fixture.js';

test('próximas horas começam na hora atual da cidade', () => {
  const { hourly, current } = respostaExemplo();
  const horas = proximasHoras(hourly, current.time, 24);
  assert.equal(horas.length, 24);
  assert.equal(horas[0].hora, '15:00');
  assert.equal(horas[9].hora, '00:00');
  assert.equal(typeof horas[0].temperatura, 'number');
});

test('próximas horas devolve lista vazia se a hora não existe', () => {
  const { hourly } = respostaExemplo();
  assert.deepEqual(proximasHoras(hourly, '2027-01-01T10:00'), []);
});

test('nomes dos dias', () => {
  assert.equal(nomeDoDia('2026-10-30', 0), 'Hoje');
  assert.equal(nomeDoDia('2026-10-31', 1), 'Amanhã');
  assert.equal(nomeDoDia('2026-11-01', 2), 'dom');
});

test('semana: barras ficam entre 0% e 100%', () => {
  const dias = semana(respostaExemplo().daily);
  assert.equal(dias.length, 7);
  for (const d of dias) {
    assert.ok(d.inicio >= 0 && d.inicio + d.largura <= 100.0001, `${d.dia} fora da faixa`);
    assert.ok(d.minima <= d.maxima);
  }
  // O dia com a menor mínima começa em 0%, e o com a maior máxima termina em 100%.
  assert.ok(dias.some((d) => d.inicio === 0));
  assert.ok(dias.some((d) => Math.abs(d.inicio + d.largura - 100) < 0.0001));
});

test('códigos de tempo viram descrição e ícone', () => {
  assert.deepEqual(descreverTempo(0, true), { descricao: 'Céu limpo', icone: 'sol' });
  assert.equal(descreverTempo(0, false).icone, 'lua');
  assert.equal(descreverTempo(2, false).icone, 'lua-nuvem');
  assert.equal(descreverTempo(63).descricao, 'Chuva');
  assert.equal(descreverTempo(1234).descricao, 'Tempo indefinido');
});

test('tema do céu', () => {
  assert.equal(temaDoCeu(0, true), 'ensolarado');
  assert.equal(temaDoCeu(3, true), 'nublado');
  assert.equal(temaDoCeu(61, true), 'chuva');
  assert.equal(temaDoCeu(95, true), 'tempestade');
  assert.equal(temaDoCeu(95, false), 'noite');
});

test('pontos do gráfico ficam dentro da área', () => {
  const { hourly, current } = respostaExemplo();
  const pontos = pontosDoGrafico(proximasHoras(hourly, current.time), 720, 150, 28);
  for (const p of pontos) {
    assert.ok(p.x >= 28 && p.x <= 692);
    assert.ok(p.y >= 28 - 0.0001 && p.y <= 122 + 0.0001);
  }
  assert.match(caminhoSuave(pontos), /^M[\d.]+,[\d.]+( C[\d., ]+)+$/);
});

test('temperatura constante não quebra o gráfico', () => {
  const horas = [{ temperatura: 20 }, { temperatura: 20 }];
  const pontos = pontosDoGrafico(horas, 100, 100, 10);
  assert.ok(pontos.every((p) => Number.isFinite(p.y)));
});

test('URLs da API', () => {
  assert.match(urlBusca('São Paulo'), /name=S%C3%A3o\+Paulo/);
  const u = new URL(urlPrevisao(-23.5, -46.6, 'fahrenheit'));
  assert.equal(u.searchParams.get('temperature_unit'), 'fahrenheit');
  assert.equal(u.searchParams.get('forecast_days'), '7');
  assert.equal(u.searchParams.get('timezone'), 'auto');
});

test('busca de cidades converte a resposta da API', async () => {
  const fetchFalso = async () => ({
    ok: true,
    json: async () => ({ results: [{ id: 1, name: 'Campinas', admin1: 'São Paulo', country: 'Brasil', latitude: -22.9, longitude: -47.06 }] }),
  });
  const cidades = await buscarCidades('Camp', fetchFalso);
  assert.deepEqual(cidades, [{ id: 1, nome: 'Campinas', regiao: 'São Paulo, Brasil', lat: -22.9, lon: -47.06 }]);
  assert.deepEqual(await buscarCidades('a', fetchFalso), []);
});

test('erro da API vira mensagem amigável', async () => {
  const fetchErro = async () => ({ ok: false, status: 500 });
  await assert.rejects(buscarPrevisao(0, 0, 'celsius', fetchErro), /erro 500/);
  const semRede = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(buscarPrevisao(0, 0, 'celsius', semRede), /Sem conexão/);
});

test('favoritos: adiciona, remove e guarda no máximo 8', () => {
  const sp = { id: 1, nome: 'São Paulo' };
  let favs = alternarFavorito([], sp);
  assert.equal(favs.length, 1);
  favs = alternarFavorito(favs, sp);
  assert.equal(favs.length, 0);
  for (let i = 0; i < 10; i++) favs = alternarFavorito(favs, { id: i, nome: `C${i}` });
  assert.equal(favs.length, 8);
  assert.equal(favs[0].id, 2);
});
