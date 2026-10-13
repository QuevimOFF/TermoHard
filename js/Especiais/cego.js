import {
  palavraExiste,
  sortearPalavrasDoDia,
  obterDiaAtual,
} from "../regras.js";
import {
  atualizarLinhaVisivel,
  animarErro,
  mostrarMensagem,
} from "../interface.js";

const estado = {
  banco: {},
  palavraAlvo: "",
  historico: [],
  palpiteAtual: [],
  linhaAtual: 0,
  cursorAtivo: 0,
  tamanhoPalavra: 5,
  maxTentativas: 6,
  jogoTerminado: false,
};

function sortearLimiteTentativas() {
  return Math.floor(Math.random() * 95) + 6;
}

function mensagemFinal() {
  return `A palavra era: ${estado.palavraAlvo}. Você tinha ${estado.maxTentativas} tentativas.`;
}

function salvarProgresso() {
  localStorage.setItem(
    "termo_cego",
    JSON.stringify({
      dia: obterDiaAtual(),
      historico: estado.historico,
      maxTentativas: estado.maxTentativas,
      jogoTerminado: estado.jogoTerminado,
    }),
  );
}

export function iniciarModoCego(bancoDePalavras, listaSolucoes) {
  estado.banco = bancoDePalavras;
  estado.palavraAlvo = sortearPalavrasDoDia(listaSolucoes, 1)[0];
  estado.historico = [];
  estado.linhaAtual = 0;
  estado.palpiteAtual = Array(estado.tamanhoPalavra).fill("");
  estado.cursorAtivo = 0;
  estado.maxTentativas = sortearLimiteTentativas();
  estado.jogoTerminado = false;

  const container = document.getElementById("board-container");
  if (!container) return;

  container.innerHTML = "";
  const board = document.createElement("div");
  board.className = "board";
  board.id = "cego";
  board.style.gridTemplateColumns = `repeat(${estado.tamanhoPalavra}, 1fr)`;
  container.appendChild(board);

  let save = null;
  try {
    save = JSON.parse(localStorage.getItem("termo_cego"));
  } catch {
    localStorage.removeItem("termo_cego");
  }

  if (save?.dia === obterDiaAtual()) {
    estado.historico = Array.isArray(save.historico)
      ? save.historico.filter(
          (palavra) =>
            typeof palavra === "string" &&
            palavra.length === estado.tamanhoPalavra,
        )
      : [];
    if (
      Number.isInteger(save.maxTentativas) &&
      save.maxTentativas >= 6 &&
      save.maxTentativas <= 100
    ) {
      estado.maxTentativas = save.maxTentativas;
    }
    estado.jogoTerminado = Boolean(save.jogoTerminado);
  } else {
    localStorage.removeItem("termo_cego");
  }

  if (
    !Number.isInteger(save?.maxTentativas) ||
    save.maxTentativas < 6 ||
    save.maxTentativas > 100
  ) {
    salvarProgresso();
  }

  estado.historico.forEach((palavra, linha) => {
    adicionarLinha(linha);
    const palpite = palavra.split("");
    atualizarLinhaVisivel(
      palpite,
      linha,
      estado.tamanhoPalavra,
      -1,
      "cego",
    );
    pintarVerdes(palpite, linha);
  });

  estado.linhaAtual = estado.historico.length;
  if (!estado.jogoTerminado) {
    estado.palpiteAtual = Array(estado.tamanhoPalavra).fill("");
    estado.cursorAtivo = 0;
    adicionarLinha(estado.linhaAtual);
    atualizarInterface();
  } else if (estado.historico.length > 0) {
    mostrarMensagem(mensagemFinal());
  }

  container.scrollTop = container.scrollHeight;
}

function adicionarLinha(linha) {
  const board = document.getElementById("cego");
  if (!board) return;

  for (let coluna = 0; coluna < estado.tamanhoPalavra; coluna++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.id = `cego-cell-${linha}-${coluna}`;
    cell.addEventListener("click", () => {
      if (estado.jogoTerminado || linha !== estado.linhaAtual) return;
      estado.cursorAtivo = coluna;
      atualizarInterface();
    });
    board.appendChild(cell);
  }
}

export function receberTeclaCego(tecla) {
  if (estado.jogoTerminado) return;

  if (tecla === "BACK") lidarComBackspace();
  else if (tecla === "ENTER") lidarComEnter();
  else if (/^[A-Z]$/.test(tecla)) lidarComLetra(tecla);
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
    (valor, index) => index > estado.cursorAtivo && valor === "",
  );
  if (proximoVazio !== -1) estado.cursorAtivo = proximoVazio;
  else {
    const primeiroVazio = estado.palpiteAtual.findIndex((valor) => valor === "");
    if (primeiroVazio !== -1) estado.cursorAtivo = primeiroVazio;
    else if (estado.cursorAtivo < estado.tamanhoPalavra - 1)
      estado.cursorAtivo++;
  }
  atualizarInterface();
}

function lidarComEnter() {
  if (estado.palpiteAtual.includes("")) {
    animarErro(estado.linhaAtual, estado.tamanhoPalavra, "cego");
    mostrarMensagem("Atenção: Faltam letras!");
    return;
  }
  if (!palavraExiste(estado.palpiteAtual, estado.tamanhoPalavra, estado.banco)) {
    animarErro(estado.linhaAtual, estado.tamanhoPalavra, "cego");
    mostrarMensagem("Palavra não reconhecida");
    return;
  }

  const palpite = estado.palpiteAtual.join("");
  estado.historico.push(palpite);
  pintarVerdes(estado.palpiteAtual, estado.linhaAtual);

  if (palpite === estado.palavraAlvo) {
    estado.jogoTerminado = true;
    salvarProgresso();
    setTimeout(
      () => mostrarMensagem(`Esplêndido! ${mensagemFinal()}`),
      500,
    );
    return;
  }

  estado.linhaAtual++;
  if (estado.linhaAtual >= estado.maxTentativas) {
    estado.jogoTerminado = true;
    salvarProgresso();
    setTimeout(
      () => mostrarMensagem(`Fim! ${mensagemFinal()}`),
      500,
    );
    return;
  }

  estado.palpiteAtual = Array(estado.tamanhoPalavra).fill("");
  estado.cursorAtivo = 0;
  adicionarLinha(estado.linhaAtual);
  salvarProgresso();
  atualizarInterface();

  const container = document.getElementById("board-container");
  if (container) container.scrollTop = container.scrollHeight;
}

function pintarVerdes(palpite, linha) {
  for (let coluna = 0; coluna < estado.tamanhoPalavra; coluna++) {
    if (palpite[coluna] !== estado.palavraAlvo[coluna]) continue;

    document
      .getElementById(`cego-cell-${linha}-${coluna}`)
      ?.classList.add("correct");
    document
      .getElementById(`key-${palpite[coluna]}`)
      ?.classList.add("correct");
  }
}

function atualizarInterface() {
  atualizarLinhaVisivel(
    estado.palpiteAtual,
    estado.linhaAtual,
    estado.tamanhoPalavra,
    estado.cursorAtivo,
    "cego",
  );
}