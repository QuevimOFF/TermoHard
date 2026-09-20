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
  palavrasAlvo: [],
  statusBoards: [],
  historico: [],
  palpiteAtual: [],
  linhaAtual: 0,
  cursorAtivo: 0,
  tamanhoPalavra: 5,
  maxTentativas: 7,
  qtdBoards: 2,
  jogoTerminado: false,
};

function salvarProgresso() {
  const save = {
    dia: obterDiaAtual(),
    historico: estado.historico,
    linhaAtual: estado.linhaAtual,
    jogoTerminado: estado.jogoTerminado,
    statusBoards: estado.statusBoards,
  };
  localStorage.setItem("termo_dueto", JSON.stringify(save));
}

export function iniciarModoDueto(bancoDePalavras, listaSolucoes) {
  estado.banco = bancoDePalavras;
  estado.palavrasAlvo = sortearPalavrasDoDia(
    listaSolucoes,
    estado.qtdBoards,
    10,
  );
  estado.statusBoards = Array(estado.qtdBoards).fill("jogando");
  estado.palpiteAtual = Array(estado.tamanhoPalavra).fill("");
  estado.linhaAtual = 0;
  estado.cursorAtivo = 0;
  estado.jogoTerminado = false;
  estado.historico = [];

  const container = document.getElementById("board-container");
  if (container) container.innerHTML = "";

  for (let i = 0; i < estado.qtdBoards; i++) {
    criarGrelha(
      "board-container",
      estado.maxTentativas,
      estado.tamanhoPalavra,
      `board-${i}`,
      (linha, col) => aoClicarCelula(linha, col, i),
    );
  }

  let save = null;
  try {
    save = JSON.parse(localStorage.getItem("termo_dueto"));
  } catch {
    localStorage.removeItem("termo_dueto");
  }

  const diaHoje = obterDiaAtual();

  if (save && save.dia === diaHoje) {
    estado.historico = save.historico || [];
    estado.linhaAtual = save.linhaAtual ?? 0;
    estado.jogoTerminado = Boolean(save.jogoTerminado);
    estado.statusBoards =
      Array.isArray(save.statusBoards) &&
      save.statusBoards.length === estado.qtdBoards
        ? save.statusBoards
        : Array(estado.qtdBoards).fill("jogando");

    estado.historico.forEach((palavra, linha) => {
      const palpiteArray = palavra.split("");
      for (let i = 0; i < estado.qtdBoards; i++) {
        const resultados = avaliarPalpite(palpiteArray, estado.palavrasAlvo[i]);
        atualizarLinhaVisivel(
          palpiteArray,
          linha,
          estado.tamanhoPalavra,
          -1,
          `board-${i}`,
        );
        pintarCores(
          palpiteArray,
          resultados,
          linha,
          estado.tamanhoPalavra,
          `board-${i}`,
          true,
        );
      }
    });

    for (let i = 0; i < estado.qtdBoards; i++) {
      if (estado.statusBoards[i] === "venceu") {
        const board = document.getElementById(`board-${i}`);
        if (board) board.classList.add("vencido");
      }
    }
  } else {
    estado.historico = [];
    estado.linhaAtual = 0;
    estado.jogoTerminado = false;
    estado.statusBoards = Array(estado.qtdBoards).fill("jogando");
    localStorage.removeItem("termo_dueto");
  }

  if (!estado.jogoTerminado) atualizarInterface();
}

function aoClicarCelula(linhaClicada, colunaClicada, boardIndex) {
  if (
    estado.jogoTerminado ||
    linhaClicada !== estado.linhaAtual ||
    estado.statusBoards[boardIndex] !== "jogando"
  )
    return;
  estado.cursorAtivo = colunaClicada;
  atualizarInterface();
}

export function receberTeclaDueto(tecla) {
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
    (l, i) => i > estado.cursorAtivo && l === "",
  );

  if (proximoVazio !== -1) {
    estado.cursorAtivo = proximoVazio;
  } else {
    const primeiroVazio = estado.palpiteAtual.findIndex((l) => l === "");
    if (primeiroVazio !== -1) estado.cursorAtivo = primeiroVazio;
    else if (estado.cursorAtivo < estado.tamanhoPalavra - 1)
      estado.cursorAtivo++;
  }
  atualizarInterface();
}

function lidarComEnter() {
  if (estado.palpiteAtual.includes("")) {
    animarTodosErros();
    mostrarMensagem("Atenção: Faltam letras!");
    return;
  }
  if (
    !palavraExiste(estado.palpiteAtual, estado.tamanhoPalavra, estado.banco)
  ) {
    animarTodosErros();
    mostrarMensagem("Palavra não reconhecida");
    return;
  }
  submeterPalpite();
}

function submeterPalpite() {
  const palpiteString = estado.palpiteAtual.join("");
  estado.historico.push(palpiteString);
  let todosVencidos = true;

  for (let i = 0; i < estado.qtdBoards; i++) {
    if (estado.statusBoards[i] !== "jogando") continue;

    const alvo = estado.palavrasAlvo[i];
    const resultadosCores = avaliarPalpite(estado.palpiteAtual, alvo);

    pintarCores(
      estado.palpiteAtual,
      resultadosCores,
      estado.linhaAtual,
      estado.tamanhoPalavra,
      `board-${i}`,
    );

    if (palpiteString === alvo) {
      estado.statusBoards[i] = "venceu";
      setTimeout(
        () =>
          animarVitoria(estado.linhaAtual, estado.tamanhoPalavra, `board-${i}`),
        1500,
      );
      setTimeout(() => {
        document.getElementById(`board-${i}`).classList.add("vencido");
      }, 2500);
    } else {
      todosVencidos = false;
    }
  }

  if (
    todosVencidos ||
    estado.statusBoards.every((status) => status === "venceu")
  ) {
    estado.jogoTerminado = true;
    salvarProgresso();
    setTimeout(() => mostrarMensagem("Incrível! Venceu o Dueto!"), 3000);
  } else {
    estado.linhaAtual++;
    if (estado.linhaAtual >= estado.maxTentativas) {
      estado.jogoTerminado = true;
      salvarProgresso();
      setTimeout(
        () =>
          mostrarMensagem(
            `Fim! As palavras eram: ${estado.palavrasAlvo.join(" e ")}`,
          ),
        2500,
      );
    } else {
      estado.palpiteAtual = Array(estado.tamanhoPalavra).fill("");
      estado.cursorAtivo = 0;
      salvarProgresso();
      atualizarInterface();
    }
  }
}

function atualizarInterface() {
  for (let i = 0; i < estado.qtdBoards; i++) {
    if (estado.statusBoards[i] === "jogando") {
      atualizarLinhaVisivel(
        estado.palpiteAtual,
        estado.linhaAtual,
        estado.tamanhoPalavra,
        estado.cursorAtivo,
        `board-${i}`,
      );
    }
  }
}

function animarTodosErros() {
  for (let i = 0; i < estado.qtdBoards; i++) {
    if (estado.statusBoards[i] === "jogando")
      animarErro(estado.linhaAtual, estado.tamanhoPalavra, `board-${i}`);
  }
}
