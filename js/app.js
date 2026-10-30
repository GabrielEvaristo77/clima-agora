// Ponto de entrada: liga a busca, os botões e desenha a tela.
import { buscarCidades, buscarPrevisao } from './api.js';
import { descreverTempo, temaDoCeu } from './clima.js';
import { proximasHoras, semana, horario, pontosDoGrafico, caminhoSuave } from './previsao.js';
import { carregarPreferencias, salvarPreferencias, alternarFavorito } from './favoritos.js';
import { icone } from './icones.js';

const CIDADE_PADRAO = { id: 3448439, nome: 'São Paulo', regiao: 'São Paulo, Brasil', lat: -23.5475, lon: -46.63611 };

const estado = {
  ...carregarPreferencias(),
  cidade: null,
  dados: null,
  sugestoes: [],
  selecionada: -1,
  requisicao: 0, // evita que uma resposta antiga sobrescreva uma mais nova
};

const $ = (id) => document.getElementById(id);
const conteudo = $('conteudo');
const campoBusca = $('campo-busca');
const listaSugestoes = $('sugestoes');

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const grau = () => '°';

function salvar() {
  salvarPreferencias({ favoritos: estado.favoritos, ultima: estado.cidade, unidade: estado.unidade });
}

// ---------- Carregamento ----------

async function carregar(cidade) {
  estado.cidade = cidade;
  const minhaRequisicao = ++estado.requisicao;
  desenharCarregando();
  try {
    const dados = await buscarPrevisao(cidade.lat, cidade.lon, estado.unidade);
    if (minhaRequisicao !== estado.requisicao) return;
    estado.dados = dados;
    salvar();
    desenhar();
  } catch (erro) {
    if (minhaRequisicao !== estado.requisicao) return;
    desenharErro(erro.message);
  }
}

// ---------- Telas ----------

function desenharCarregando() {
  conteudo.innerHTML = `
    <section class="cartao atual esqueleto" aria-busy="true">
      <div class="linha l1"></div><div class="linha l2"></div><div class="linha l3"></div>
    </section>
    <section class="cartao esqueleto"><div class="linha l4"></div></section>
    <section class="cartao esqueleto"><div class="linha l4"></div></section>`;
}

function desenharErro(mensagem) {
  document.body.dataset.ceu = 'nublado';
  conteudo.innerHTML = `
    <section class="cartao erro" role="alert">
      ${icone('nuvem', 48)}
      <h2>Não foi possível carregar a previsão</h2>
      <p>${esc(mensagem)}</p>
      <button class="botao" id="btn-tentar" type="button">Tentar de novo</button>
    </section>`;
  $('btn-tentar').addEventListener('click', () => carregar(estado.cidade));
}

function desenhar() {
  const { current, hourly, daily } = estado.dados;
  const ehDia = current.is_day === 1;
  const tempo = descreverTempo(current.weather_code, ehDia);
  const favorita = estado.favoritos.some((f) => f.id === estado.cidade.id);

  document.body.dataset.ceu = temaDoCeu(current.weather_code, ehDia);
  document.title = `${Math.round(current.temperature_2m)}° em ${estado.cidade.nome} · Clima Agora`;

  conteudo.innerHTML = `
    <section class="cartao atual">
      <div class="atual-topo">
        <div>
          <h1 class="cidade">${esc(estado.cidade.nome)}</h1>
          <p class="regiao">${esc(estado.cidade.regiao || 'Coordenadas atuais')}</p>
        </div>
        <button class="botao-icone favoritar ${favorita ? 'ativo' : ''}" id="btn-favorito" type="button"
          aria-pressed="${favorita}" title="${favorita ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
          ${icone('estrela', 22)}
        </button>
      </div>
      <div class="atual-corpo">
        <div class="atual-icone">${icone(tempo.icone, 96)}</div>
        <div>
          <p class="temperatura">${Math.round(current.temperature_2m)}<span>${grau()}</span></p>
          <p class="descricao">${tempo.descricao}</p>
          <p class="minmax">Máx. ${Math.round(daily.temperature_2m_max[0])}° · Mín. ${Math.round(daily.temperature_2m_min[0])}°</p>
        </div>
      </div>
      <p class="atualizado">Horário local: ${horario(current.time)}</p>
    </section>

    <section class="detalhes">
      ${detalhe('termometro', 'Sensação', `${Math.round(current.apparent_temperature)}°`)}
      ${detalhe('gota', 'Umidade', `${current.relative_humidity_2m}%`)}
      ${detalhe('vento', 'Vento', `${Math.round(current.wind_speed_10m)} km/h`)}
      ${detalhe('nascer', 'Nascer do sol', horario(daily.sunrise[0]))}
      ${detalhe('por', 'Pôr do sol', horario(daily.sunset[0]))}
      ${detalhe('chuva', 'Chance de chuva', `${daily.precipitation_probability_max[0] ?? 0}%`)}
    </section>

    <section class="cartao">
      <h2 class="titulo-secao">Próximas 24 horas</h2>
      ${graficoHoras(proximasHoras(hourly, current.time, 24))}
    </section>

    <section class="cartao">
      <h2 class="titulo-secao">Próximos 7 dias</h2>
      <ul class="semana">${semana(daily).map(linhaDia).join('')}</ul>
    </section>`;

  $('btn-favorito').addEventListener('click', () => {
    estado.favoritos = alternarFavorito(estado.favoritos, estado.cidade);
    salvar();
    desenhar();
    desenharFavoritos();
  });
  desenharFavoritos();
}

function detalhe(nomeIcone, rotulo, valor) {
  return `<div class="detalhe">${icone(nomeIcone, 20)}<span class="rotulo">${rotulo}</span><strong>${valor}</strong></div>`;
}

function graficoHoras(horas) {
  if (!horas.length) return '<p class="vazio">Sem dados por hora.</p>';
  const L = 720;
  const A = 150;
  const pontos = pontosDoGrafico(horas, L, A, 28);
  const linha = caminhoSuave(pontos);
  const area = `${linha} L${pontos.at(-1).x},${A} L${pontos[0].x},${A} Z`;

  // Pontos e rótulos ficam em HTML por cima do SVG, posicionados em %,
  // para não ficarem esticados quando o gráfico muda de largura.
  const pct = (v, total) => ((v / total) * 100).toFixed(2);
  const marcados = horas.map((h, i) => ({ ...h, ...pontos[i] })).filter((_, i) => i % 3 === 0);

  const marcas = marcados.map((m) => `
    <span class="marca-temp" style="left:${pct(m.x, L)}%;top:${pct(m.y, A)}%">
      <b>${m.temperatura}°</b><i></i>
    </span>`).join('');

  const colunas = marcados.map((m) => `
    <div class="hora" style="left:${pct(m.x, L)}%">
      <span>${i18nHora(m.hora)}</span>
      ${icone(m.icone, 22)}
      <small class="${m.chuva >= 50 ? 'chuva-alta' : ''}">${icone('gota', 11)}${m.chuva}%</small>
    </div>`).join('');

  return `
    <div class="grafico">
      <div class="area-grafico">
        <svg viewBox="0 0 ${L} ${A}" preserveAspectRatio="none" role="img"
          aria-label="Temperatura nas próximas 24 horas, de ${horas[0].temperatura}° a ${horas.at(-1).temperatura}°">
          <defs>
            <linearGradient id="preench" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#ffffff" stop-opacity=".35"/>
              <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="${area}" fill="url(#preench)"/>
          <path d="${linha}" class="linha-temp"/>
        </svg>
        ${marcas}
      </div>
      <div class="horas">${colunas}</div>
    </div>`;
}

const i18nHora = (h) => (h === '00:00' ? '0h' : `${Number(h.slice(0, 2))}h`);

function linhaDia(d) {
  return `
    <li class="dia">
      <span class="dia-nome">${d.dia}</span>
      <span class="dia-icone" title="${d.descricao}">${icone(d.icone, 24)}</span>
      <span class="dia-chuva ${d.chuva >= 50 ? 'chuva-alta' : ''}">${d.chuva ? `${icone('gota', 12)}${d.chuva}%` : ''}</span>
      <span class="dia-min">${d.minima}°</span>
      <span class="faixa"><span style="left:${d.inicio.toFixed(1)}%;width:${Math.max(d.largura, 4).toFixed(1)}%"></span></span>
      <span class="dia-max">${d.maxima}°</span>
    </li>`;
}

function desenharFavoritos() {
  const nav = $('favoritos');
  if (!estado.favoritos.length) {
    nav.innerHTML = '';
    return;
  }
  nav.innerHTML = estado.favoritos.map((f) => `
    <button type="button" class="chip ${estado.cidade && f.id === estado.cidade.id ? 'ativo' : ''}" data-id="${f.id}">
      ${icone('estrela', 14)}${esc(f.nome)}
    </button>`).join('');
  nav.querySelectorAll('.chip').forEach((b) =>
    b.addEventListener('click', () => carregar(estado.favoritos.find((f) => String(f.id) === b.dataset.id)))
  );
}

// ---------- Busca com sugestões ----------

let esperaDigitacao;
campoBusca.addEventListener('input', () => {
  clearTimeout(esperaDigitacao);
  const termo = campoBusca.value;
  if (termo.trim().length < 2) return fecharSugestoes();
  // Espera o usuário parar de digitar por 300 ms antes de chamar a API.
  esperaDigitacao = setTimeout(async () => {
    try {
      estado.sugestoes = await buscarCidades(termo);
      estado.selecionada = -1;
      desenharSugestoes();
    } catch {
      estado.sugestoes = [];
      listaSugestoes.innerHTML = '<li class="sem-resultado">Não foi possível buscar agora.</li>';
      abrirSugestoes();
    }
  }, 300);
});

function desenharSugestoes() {
  if (!estado.sugestoes.length) {
    listaSugestoes.innerHTML = '<li class="sem-resultado">Nenhuma cidade encontrada.</li>';
  } else {
    listaSugestoes.innerHTML = estado.sugestoes.map((c, i) => `
      <li role="option" id="sug-${i}" data-i="${i}" aria-selected="${i === estado.selecionada}">
        <strong>${esc(c.nome)}</strong><span>${esc(c.regiao)}</span>
      </li>`).join('');
  }
  abrirSugestoes();
}

function abrirSugestoes() {
  listaSugestoes.hidden = false;
  campoBusca.setAttribute('aria-expanded', 'true');
}

function fecharSugestoes() {
  listaSugestoes.hidden = true;
  campoBusca.setAttribute('aria-expanded', 'false');
  estado.selecionada = -1;
}

function escolher(i) {
  const cidade = estado.sugestoes[i];
  if (!cidade) return;
  campoBusca.value = '';
  fecharSugestoes();
  campoBusca.blur();
  carregar(cidade);
}

listaSugestoes.addEventListener('mousedown', (e) => {
  const item = e.target.closest('li[data-i]');
  if (item) {
    e.preventDefault();
    escolher(Number(item.dataset.i));
  }
});

campoBusca.addEventListener('keydown', (e) => {
  if (listaSugestoes.hidden || !estado.sugestoes.length) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const total = estado.sugestoes.length;
    estado.selecionada = (estado.selecionada + (e.key === 'ArrowDown' ? 1 : -1) + total) % total;
    desenharSugestoes();
    campoBusca.setAttribute('aria-activedescendant', `sug-${estado.selecionada}`);
  } else if (e.key === 'Escape') {
    fecharSugestoes();
  }
});

$('form-busca').addEventListener('submit', (e) => {
  e.preventDefault();
  if (estado.sugestoes.length) escolher(Math.max(estado.selecionada, 0));
});

campoBusca.addEventListener('blur', () => setTimeout(fecharSugestoes, 150));

// ---------- Botões do topo ----------

$('icone-busca').innerHTML = icone('busca', 18);
$('btn-local').innerHTML = icone('local', 20);

$('btn-local').addEventListener('click', () => {
  if (!navigator.geolocation) return desenharErro('Seu navegador não permite usar a localização.');
  desenharCarregando();
  navigator.geolocation.getCurrentPosition(
    (pos) => carregar({ id: 'local', nome: 'Sua localização', regiao: '', lat: pos.coords.latitude, lon: pos.coords.longitude }),
    () => desenharErro('Não foi possível acessar sua localização. Verifique a permissão do navegador.'),
    { timeout: 10000 }
  );
});

const botaoUnidade = $('btn-unidade');
function atualizarBotaoUnidade() {
  botaoUnidade.textContent = estado.unidade === 'celsius' ? '°C' : '°F';
}
botaoUnidade.addEventListener('click', () => {
  estado.unidade = estado.unidade === 'celsius' ? 'fahrenheit' : 'celsius';
  atualizarBotaoUnidade();
  carregar(estado.cidade);
});

// ---------- Início ----------

atualizarBotaoUnidade();
carregar(estado.ultima || CIDADE_PADRAO);
