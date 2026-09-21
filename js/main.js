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
let listaSolucoes = [];
let modoAtual = "unico";

async function arrancarJogo() {
  const carregouDicionario = await carregarJSON();
  if (!carregouDicionario) {
    mostrarMensagem("Não foi possível carregar o dicionário.");
    return;
  }
  iniciarContadorDiario();
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

  if (modoAtual === "unico") iniciarModoUnico(bancoDePalavras, listaSolucoes);
  else if (modoAtual === "dueto")
    iniciarModoDueto(bancoDePalavras, listaSolucoes);
  else if (modoAtual === "quarteto")
    iniciarModoQuarteto(bancoDePalavras, listaSolucoes);
  else if (modoAtual === "octeto")
    iniciarModoOcteto(bancoDePalavras, listaSolucoes);
  else if (modoAtual === "hexateto")
    iniciarModoHexateto(bancoDePalavras, listaSolucoes);
}

async function carregarJSON() {
  try {
    const [resValidas, resSolucoes] = await Promise.all([
      fetch("./js/palavras5.json"),
      fetch("./js/soluções.json"),
    ]);

    if (!resValidas.ok || !resSolucoes.ok)
      throw new Error("Erro na rede ao carregar JSON");

    const dadosValidas = await resValidas.json();
    const dadosSolucoes = await resSolucoes.json();

    const listaPalavras = Array.isArray(dadosValidas)
      ? dadosValidas
      : dadosValidas["5"];
    if (!Array.isArray(listaPalavras) || listaPalavras.length === 0) {
      throw new Error("O dicionário não contém palavras de cinco letras");
    }

    bancoDePalavras = { ...dadosValidas, 5: listaPalavras };
    listaSolucoes = dadosSolucoes;
    return true;
  } catch (erro) {
    console.error("Erro fatal ao carregar JSON:", erro);
    return false;
  }
}

function processarInputGeral(tecla) {
  if (modoAtual === "unico") receberTeclaUnico(tecla);
  else if (modoAtual === "dueto") receberTeclaDueto(tecla);
  else if (modoAtual === "quarteto") receberTeclaQuarteto(tecla);
  else if (modoAtual === "octeto") receberTeclaOcteto(tecla);
  else if (modoAtual === "hexateto") receberTeclaHexateto(tecla);
}

function escutarTecladoFisico() {
  document.addEventListener("keydown", (e) => {
    const tecla = e.key.toUpperCase();
    if (tecla === "ENTER") processarInputGeral("ENTER");
    else if (tecla === "BACKSPACE") processarInputGeral("BACK");
    else if (/^[A-Z]$/.test(tecla)) processarInputGeral(tecla);
  });
}

function iniciarContadorDiario() {
  const elementoContador = document.getElementById("contador-diario");
  if (!elementoContador) return;

  function atualizarContador() {
    const agora = new Date();
    const utc = agora.getTime() + agora.getTimezoneOffset() * 60000;
    const dataBrasilia = new Date(utc - 3600000 * 3);

    const proximaMeiaNoite = new Date(dataBrasilia);
    proximaMeiaNoite.setHours(24, 0, 0, 0);

    const diferenca = proximaMeiaNoite - dataBrasilia;

    const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24)
      .toString()
      .padStart(2, "0");
    const minutos = Math.floor((diferenca / 1000 / 60) % 60)
      .toString()
      .padStart(2, "0");
    const segundos = Math.floor((diferenca / 1000) % 60)
      .toString()
      .padStart(2, "0");

    elementoContador.textContent = `${horas}:${minutos}:${segundos}`;
  }

  atualizarContador();
  setInterval(atualizarContador, 1000);
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
