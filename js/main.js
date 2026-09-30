import { criarTeclado, mostrarMensagem } from "./interface.js";
import { iniciarModoUnico, receberTeclaUnico } from "./Classicos/unico.js";
import { iniciarModoDueto, receberTeclaDueto } from "./Classicos/dueto.js";
import {
  iniciarModoQuarteto,
  receberTeclaQuarteto,
} from "./Classicos/quarteto.js";
import { iniciarModoOcteto, receberTeclaOcteto } from "./Classicos/octeto.js";
import {
  iniciarModoHexateto,
  receberTeclaHexateto,
} from "./Classicos/hexateto.js";

let bancoDePalavras = {};
let listaRespostas = [];
let modoAtual = "unico";
let inicioCronometro = null;
let intervaloCronometro = null;
let tempoDecorrido = 0;
let cronometroEncerrado = false;

async function arrancarJogo() {
  const carregouBancos = await carregarJSON();
  if (!carregouBancos) {
    mostrarMensagem("Não foi possível carregar os bancos de palavras.");
    return;
  }
  configurarMenu();
  iniciarModoSelecionado();
  escutarTecladoFisico();
  gerirTutorial();
}

function configurarMenu() {
  const seletor = document.getElementById("seletor-modo");
  seletor.addEventListener("change", (e) => {
    modoAtual = e.target.value;
    iniciarModoSelecionado();
    seletor.blur();
  });
}

function iniciarModoSelecionado() {
  criarTeclado("keyboard-container", processarInputGeral);

  const container = document.getElementById("board-container");
  if (container) {
    container.innerHTML = "";
    container.className = `layout-${modoAtual}`;
    container.scrollTop = 0;
  }

  if (modoAtual === "unico")
    iniciarModoUnico(bancoDePalavras, listaRespostas);
  else if (modoAtual === "dueto")
    iniciarModoDueto(bancoDePalavras, listaRespostas);
  else if (modoAtual === "quarteto")
    iniciarModoQuarteto(bancoDePalavras, listaRespostas);
  else if (modoAtual === "octeto")
    iniciarModoOcteto(bancoDePalavras, listaRespostas);
  else if (modoAtual === "hexateto")
    iniciarModoHexateto(bancoDePalavras, listaRespostas);

  sincronizarCronometro();
}

async function carregarJSON() {
  try {
    const [respostaPalavras, respostaRespostas] = await Promise.all([
      fetch("./js/palavras.json"),
      fetch("./js/respostas.json"),
    ]);
    if (!respostaPalavras.ok || !respostaRespostas.ok)
      throw new Error("Erro na rede ao carregar os bancos de palavras");

    const dadosPalavras = await respostaPalavras.json();
    const dadosRespostas = await respostaRespostas.json();

    const listaPalavras = Array.isArray(dadosPalavras)
      ? dadosPalavras
      : dadosPalavras["5"];
    if (!Array.isArray(listaPalavras) || listaPalavras.length === 0) {
      throw new Error("O dicionário não contém palavras de cinco letras");
    }
    if (!Array.isArray(dadosRespostas) || dadosRespostas.length === 0) {
      throw new Error("O banco de respostas está vazio ou inválido");
    }

    listaRespostas = dadosRespostas.map((palavra) =>
      palavra
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase(),
    );
    const palavrasPermitidas = new Set([
      ...listaPalavras.map((palavra) => palavra.toLowerCase()),
      ...listaRespostas,
    ]);
    bancoDePalavras = { ...dadosPalavras, 5: [...palavrasPermitidas] };
    return true;
  } catch (erro) {
    console.error("Erro fatal ao carregar JSON:", erro);
    return false;
  }
}

function processarInputGeral(tecla) {
  if (/^[A-Z]$/.test(tecla)) iniciarCronometro();

  if (modoAtual === "unico") receberTeclaUnico(tecla);
  else if (modoAtual === "dueto") receberTeclaDueto(tecla);
  else if (modoAtual === "quarteto") receberTeclaQuarteto(tecla);
  else if (modoAtual === "octeto") receberTeclaOcteto(tecla);
  else if (modoAtual === "hexateto") receberTeclaHexateto(tecla);

  verificarConclusao();
}

function escutarTecladoFisico() {
  document.addEventListener("keydown", (e) => {
    const tecla = e.key.toUpperCase();
    if (tecla === "ENTER") processarInputGeral("ENTER");
    else if (tecla === "BACKSPACE") processarInputGeral("BACK");
    else if (/^[A-Z]$/.test(tecla)) processarInputGeral(tecla);
  });
}

function sincronizarCronometro() {
  clearInterval(intervaloCronometro);
  inicioCronometro = null;
  tempoDecorrido = 0;

  let progresso = null;
  try {
    progresso = JSON.parse(localStorage.getItem(`termo_${modoAtual}`));
  } catch {
    localStorage.removeItem(`termo_${modoAtual}`);
  }

  cronometroEncerrado = Boolean(progresso?.jogoTerminado);
  const tempoSalvo = localStorage.getItem(`termo_speedrun_${modoAtual}`);
  const tempoNumerico = Number(tempoSalvo);
  if (
    cronometroEncerrado &&
    tempoSalvo !== null &&
    Number.isFinite(tempoNumerico) &&
    tempoNumerico >= 0
  ) {
    tempoDecorrido = tempoNumerico;
    atualizarCronometro(tempoDecorrido);
  } else {
    atualizarCronometro(null);
  }
}

function iniciarCronometro() {
  if (inicioCronometro !== null || cronometroEncerrado) return;

  inicioCronometro = performance.now();
  intervaloCronometro = setInterval(() => {
    atualizarCronometro(tempoDecorrido + performance.now() - inicioCronometro);
  }, 30);
}

function verificarConclusao() {
  if (inicioCronometro === null) return;

  try {
    const progresso = JSON.parse(localStorage.getItem(`termo_${modoAtual}`));
    if (progresso?.jogoTerminado) pararCronometro();
  } catch {
    // O progresso inválido não deve interromper a partida.
  }
}

function pararCronometro() {
  tempoDecorrido += performance.now() - inicioCronometro;
  inicioCronometro = null;
  cronometroEncerrado = true;
  clearInterval(intervaloCronometro);
  atualizarCronometro(tempoDecorrido);
  localStorage.setItem(`termo_speedrun_${modoAtual}`, String(tempoDecorrido));
}

function atualizarCronometro(milissegundos) {
  const elemento = document.getElementById("cronometro-speedrun");
  if (!elemento) return;
  if (milissegundos === null) {
    elemento.textContent = "--:--.--";
    return;
  }

  const centesimosTotais = Math.floor(milissegundos / 10);
  const minutos = Math.floor(centesimosTotais / 6000)
    .toString()
    .padStart(2, "0");
  const segundos = (Math.floor(centesimosTotais / 100) % 60)
    .toString()
    .padStart(2, "0");
  const centesimos = (centesimosTotais % 100).toString().padStart(2, "0");
  elemento.textContent = `${minutos}:${segundos}.${centesimos}`;
}

function gerirTutorial() {
  const modal = document.getElementById("modal-tutorial");
  const btnFechar = document.getElementById("fechar-tutorial");
  const btnAbrir = document.getElementById("btn-tutorial");

  function abrirModal() {
    modal.classList.remove("hidden");
    btnAbrir.blur(); // Tira o foco do botão para o jogador não fechar e abrir clicando no ENTER do teclado físico
  }

  function fecharModal() {
    modal.classList.add("hidden");
    localStorage.setItem("termo_tutorial_lido", "true");
  }

  btnAbrir.addEventListener("click", abrirModal);
  btnFechar.addEventListener("click", fecharModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });

  if (!localStorage.getItem("termo_tutorial_lido")) {
    abrirModal();
  }
}

arrancarJogo();
