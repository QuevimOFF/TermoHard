import {
  avaliarPalpite,
  palavraExiste,
  sortearPalavrasDoDia,
  obterDiaAtual,
} from "../regras.js";
import {
  criarGrelha,
  atualizarLinhaVisivel,
  pintarCores,
  animarErro,
  animarVitoria,
  mostrarMensagem,
} from "../interface.js";

const estado = {
  banco: {},
  palavraAlvo: "",
  historico: [], // Guarda as palavras já submetidas
  palpiteAtual: [],
  linhaAtual: 0,
  cursorAtivo: 0,
  tamanhoPalavra: 5,
  maxTentativas: 6,
  jogoTerminado: false,
};

// Guarda o estado atual no disco do navegador
function salvarProgresso() {
  const save = {
    dia: obterDiaAtual(),
    historico: estado.historico,
    linhaAtual: estado.linhaAtual,
    jogoTerminado: estado.jogoTerminado,
  };
  localStorage.setItem("termo_unico", JSON.stringify(save));
}

export function iniciarModoUnico(bancoDePalavras, listaSolucoes) {
  estado.banco = bancoDePalavras;
  estado.palavraAlvo = sortearPalavrasDoDia(listaSolucoes, 1, 0)[0];
  estado.palpiteAtual = Array(estado.tamanhoPalavra).fill("");
  estado.cursorAtivo = 0;
  estado.historico = [];
  estado.linhaAtual = 0;
  estado.jogoTerminado = false;

  const container = document.getElementById("board-container");
  if (container) container.innerHTML = "";

  criarGrelha(
    "board-container",
    estado.maxTentativas,
    estado.tamanhoPalavra,
    "unico",
    aoClicarCelula,
  );

  let save = null;
  try {
    save = JSON.parse(localStorage.getItem("termo_unico"));
  } catch {
    localStorage.removeItem("termo_unico");
  }

  const diaHoje = obterDiaAtual();

  if (save && save.dia === diaHoje) {
    estado.historico = save.historico || [];
    estado.linhaAtual = save.linhaAtual ?? 0;
    estado.jogoTerminado = Boolean(save.jogoTerminado);

    estado.historico.forEach((palavra, linha) => {
      const palpiteArray = palavra.split("");
      const resultados = avaliarPalpite(palpiteArray, estado.palavraAlvo);
      atualizarLinhaVisivel(
        palpiteArray,
        linha,
        estado.tamanhoPalavra,
        -1,
        "unico",
      );
      pintarCores(
        palpiteArray,
        resultados,
        linha,
        estado.tamanhoPalavra,
        "unico",
        true,
      );
    });
  } else {
    estado.historico = [];
    estado.linhaAtual = 0;
    estado.jogoTerminado = false;
    localStorage.removeItem("termo_unico");
  }

  if (!estado.jogoTerminado) {
    atualizarInterface();
  }
}

function aoClicarCelula(linhaClicada, colunaClicada) {
  if (estado.jogoTerminado || linhaClicada !== estado.linhaAtual) return;
  estado.cursorAtivo = colunaClicada;
  atualizarInterface();
}

export function receberTeclaUnico(tecla) {
  if (estado.jogoTerminado) return;

  if (tecla === "BACK") lidarComBackspace();
  else if (tecla === "ENTER") lidarComEnter();
  else lidarComLetra(tecla);
}

function lidarComBackspace() {
  if (estado.palpiteAtual[estado.cursorAtivo] !== "") {
    estado.palpiteAtual[estado.cursorAtivo] = "";
  } else if (estado.cursorAtivo > 0) {
    estado.cursorAtivo--;
    estado.palpiteAtual[estado.cursorAtivo] = "";
  }
  atualizarInterface();
}

function lidarComLetra(letra) {
  estado.palpiteAtual[estado.cursorAtivo] = letra;
  const proximoVazio = estado.palpiteAtual.findIndex(
    (l, index) => index > estado.cursorAtivo && l === "",
  );
  if (proximoVazio !== -1) estado.cursorAtivo = proximoVazio;
  else {
    const primeiroVazio = estado.palpiteAtual.findIndex((l) => l === "");
    if (primeiroVazio !== -1) estado.cursorAtivo = primeiroVazio;
    else if (estado.cursorAtivo < estado.tamanhoPalavra - 1)
      estado.cursorAtivo++;
  }
  atualizarInterface();
}

function lidarComEnter() {
  if (estado.palpiteAtual.includes("")) {
    animarErro(estado.linhaAtual, estado.tamanhoPalavra, "unico");
    mostrarMensagem("Atenção: Faltam letras!");
    return;
  }
  if (
    !palavraExiste(estado.palpiteAtual, estado.tamanhoPalavra, estado.banco)
  ) {
    animarErro(estado.linhaAtual, estado.tamanhoPalavra, "unico");
    mostrarMensagem("Palavra não reconhecida");
    return;
  }
  submeterPalpite();
}

function submeterPalpite() {
  const palpiteString = estado.palpiteAtual.join("");
  const resultadosCores = avaliarPalpite(
    estado.palpiteAtual,
    estado.palavraAlvo,
  );

  // Guarda o histórico
  estado.historico.push(palpiteString);

  pintarCores(
    estado.palpiteAtual,
    resultadosCores,
    estado.linhaAtual,
    estado.tamanhoPalavra,
    "unico",
  );

  if (palpiteString === estado.palavraAlvo) {
    estado.jogoTerminado = true;
    salvarProgresso(); // Grava a vitória na memória
    setTimeout(
      () => animarVitoria(estado.linhaAtual, estado.tamanhoPalavra, "unico"),
      1500,
    );
    setTimeout(() => mostrarMensagem("Esplêndido!"), 2500);
  } else {
    estado.linhaAtual++;

    if (estado.linhaAtual >= estado.maxTentativas) {
      estado.jogoTerminado = true;
      salvarProgresso(); // Grava a derrota na memória
      setTimeout(() => mostrarMensagem(estado.palavraAlvo), 1500);
    } else {
      estado.palpiteAtual = Array(estado.tamanhoPalavra).fill("");
      estado.cursorAtivo = 0;
      salvarProgresso(); // Grava as tentativas feitas
      atualizarInterface();
    }
  }
}

function atualizarInterface() {
  atualizarLinhaVisivel(
    estado.palpiteAtual,
    estado.linhaAtual,
    estado.tamanhoPalavra,
    estado.cursorAtivo,
    "unico",
  );
}
