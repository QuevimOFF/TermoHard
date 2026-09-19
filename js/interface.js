export function criarGrelha(
  containerId,
  maxTentativas,
  tamanhoPalavra,
  boardId = "board-0",
  aoClicarCelula,
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const board = document.createElement("div");
  board.className = "board";
  board.id = boardId;
  board.style.gridTemplateColumns = `repeat(${tamanhoPalavra}, 1fr)`;

  for (let linha = 0; linha < maxTentativas; linha++) {
    for (let col = 0; col < tamanhoPalavra; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `${boardId}-cell-${linha}-${col}`;

      cell.addEventListener("click", () => {
        if (aoClicarCelula) aoClicarCelula(linha, col);
      });

      board.appendChild(cell);
    }
  }

  container.appendChild(board);
}

export function atualizarLinhaVisivel(
  palpiteArray,
  linhaAtual,
  tamanhoPalavra,
  cursorAtivo,
  boardId = "board-0",
) {
  for (let col = 0; col < tamanhoPalavra; col++) {
    const cell = document.getElementById(
      `${boardId}-cell-${linhaAtual}-${col}`,
    );
    if (!cell) continue;

    const letraAnterior = cell.textContent || "";
    const letraNova = palpiteArray[col] || "";

    cell.textContent = letraNova;
    cell.classList.remove("filled", "ativa", "pop");

    if (letraNova !== "") {
      cell.classList.add("filled");
      if (letraAnterior === "") {
        cell.classList.add("pop");
        setTimeout(() => cell.classList.remove("pop"), 150);
      }
    }

    if (col === cursorAtivo) {
      cell.classList.add("ativa");
    }
  }
}

export function pintarCores(
  palpiteArray,
  resultados,
  linhaAtual,
  tamanhoPalavra,
  boardId = "board-0",
  imediato = false,
) {
  for (let col = 0; col < tamanhoPalavra; col++) {
    const cell = document.getElementById(
      `${boardId}-cell-${linhaAtual}-${col}`,
    );
    const keyBtn = document.getElementById(`key-${palpiteArray[col]}`);

    const aplicarEfeito = () => {
      if (!cell) return;
      if (!imediato) cell.classList.add("flip");
      cell.classList.add(resultados[col]);

      if (!keyBtn) return;

      if (
        resultados[col] === "correct" ||
        (resultados[col] === "present" && !keyBtn.classList.contains("correct"))
      ) {
        keyBtn.className = `key ${resultados[col]}`;
      } else if (
        resultados[col] === "absent" &&
        !keyBtn.classList.contains("correct") &&
        !keyBtn.classList.contains("present")
      ) {
        keyBtn.classList.add("absent");
      }
    };

    if (imediato) {
      aplicarEfeito();
    } else {
      setTimeout(aplicarEfeito, col * 250);
    }
  }
}

export function animarErro(linhaAtual, tamanhoPalavra, boardId = "board-0") {
  for (let col = 0; col < tamanhoPalavra; col++) {
    const cell = document.getElementById(
      `${boardId}-cell-${linhaAtual}-${col}`,
    );
    if (!cell) continue;
    cell.classList.add("shake");
    setTimeout(() => cell.classList.remove("shake"), 600);
  }
}

export function animarVitoria(linhaAtual, tamanhoPalavra, boardId = "board-0") {
  for (let col = 0; col < tamanhoPalavra; col++) {
    const cell = document.getElementById(
      `${boardId}-cell-${linhaAtual}-${col}`,
    );
    if (!cell) continue;
    setTimeout(() => {
      cell.classList.add("bounce");
    }, col * 100);
  }
}

export function criarTeclado(containerId, funcaoDeClique) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  const linhas = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
  ];

  linhas.forEach((linha) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "keyboard-row";
    linha.forEach((tecla) => {
      const btn = document.createElement("button");
      btn.className = "key";
      if (tecla === "ENTER" || tecla === "BACK") btn.classList.add("wide");
      btn.textContent = tecla === "BACK" ? "⌫" : tecla;
      btn.id = `key-${tecla}`;
      btn.addEventListener("click", () => funcaoDeClique(tecla));
      rowDiv.appendChild(btn);
    });
    container.appendChild(rowDiv);
  });
}

export function mostrarMensagem(texto) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = texto;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
