import { criarTeclado } from "./interface.js";
import { iniciarModoUnico, receberTeclaUnico } from "./Classicos/unico.js";
import { iniciarModoDueto, receberTeclaDueto } from "./Classicos/dueto.js";
import {
  iniciarModoQuarteto,
  receberTeclaQuarteto,
} from "./Classicos/quarteto.js"; // Importámos o Quarteto!

let bancoDePalavras = {};
let modoAtual = "unico";

async function arrancarJogo() {
  await carregarJSON();
  configurarMenu();
  iniciarModoSelecionado();
  escutarTecladoFisico();
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
  }

  if (modoAtual === "unico") iniciarModoUnico(bancoDePalavras);
  else if (modoAtual === "dueto") iniciarModoDueto(bancoDePalavras);
  else if (modoAtual === "quarteto") iniciarModoQuarteto(bancoDePalavras);
}

async function carregarJSON() {
  try {
    const resposta = await fetch("./js/palavras.json");
    if (!resposta.ok) throw new Error("Erro na rede ao carregar JSON");
    bancoDePalavras = await resposta.json();
  } catch (erro) {
    console.error("Erro fatal ao carregar palavras.json:", erro);
  }
}

function processarInputGeral(tecla) {
  if (modoAtual === "unico") receberTeclaUnico(tecla);
  else if (modoAtual === "dueto") receberTeclaDueto(tecla);
  else if (modoAtual === "quarteto") receberTeclaQuarteto(tecla);
}

function escutarTecladoFisico() {
  document.addEventListener("keydown", (e) => {
    const tecla = e.key.toUpperCase();
    if (tecla === "ENTER") processarInputGeral("ENTER");
    else if (tecla === "BACKSPACE") processarInputGeral("BACK");
    else if (/^[A-Z]$/.test(tecla)) processarInputGeral(tecla);
  });
}

arrancarJogo();
