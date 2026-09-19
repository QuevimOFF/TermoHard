import {
  avaliarPalpite,
  palavraExiste,
  sortearPalavrasDoDia,
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
  palpiteAtual: [],
  linhaAtual: 0,
  cursorAtivo: 0,
  tamanhoPalavra: 5,
  maxTentativas: 6,
  jogoTerminado: false,
};

export function iniciarModoUnico(bancoDePalavras) {
  estado.banco = bancoDePalavras;
  const palavras5 = bancoDePalavras["5"];

  estado.palavraAlvo = sortearPalavrasDoDia(palavras5, 1)[0];
  console.log("Modo Único - Alvo:", estado.palavraAlvo);

  estado.palpiteAtual = Array(estado.tamanhoPalavra).fill("");
  estado.linhaAtual = 0;
  estado.cursorAtivo = 0;
  estado.jogoTerminado = false;

  criarGrelha(
    "board-container",
    estado.maxTentativas,
    estado.tamanhoPalavra,
    "unico",
    aoClicarCelula,
  );
  atualizarInterface();
}

function aoClicarCelula(linhaClicada, colunaClicada) {
  if (estado.jogoTerminado || linhaClicada !== estado.linhaAtual) return;
  estado.cursorAtivo = colunaClicada;
  atualizarInterface();
}

export function receberTeclaUnico(tecla) {
  if (estado.jogoTerminado) return;

  if (tecla === "BACK") {
    lidarComBackspace();
  } else if (tecla === "ENTER") {
    lidarComEnter();
  } else {
    lidarComLetra(tecla);
  }
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

  if (proximoVazio !== -1) {
    estado.cursorAtivo = proximoVazio;
  } else {
    const primeiroVazio = estado.palpiteAtual.findIndex((l) => l === "");
    if (primeiroVazio !== -1) {
      estado.cursorAtivo = primeiroVazio;
    } else if (estado.cursorAtivo < estado.tamanhoPalavra - 1) {
      estado.cursorAtivo++;
    }
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

  pintarCores(
    estado.palpiteAtual,
    resultadosCores,
    estado.linhaAtual,
    estado.tamanhoPalavra,
    "unico",
  );

  if (palpiteString === estado.palavraAlvo) {
    estado.jogoTerminado = true;
    setTimeout(
      () => animarVitoria(estado.linhaAtual, estado.tamanhoPalavra, "unico"),
      1500,
    );
    setTimeout(() => mostrarMensagem("Esplêndido!"), 2500);
  } else {
    estado.linhaAtual++;

    if (estado.linhaAtual >= estado.maxTentativas) {
      estado.jogoTerminado = true;
      setTimeout(() => mostrarMensagem(estado.palavraAlvo), 1500);
    } else {
      estado.palpiteAtual = Array(estado.tamanhoPalavra).fill("");
      estado.cursorAtivo = 0;
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
