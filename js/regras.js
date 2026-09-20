export function palavraExiste(palpite, tamanho, bancoDePalavras) {
  const palavraString = Array.isArray(palpite) ? palpite.join("") : palpite;
  if (palavraString.length !== tamanho) return false;
  const listaPermitida = bancoDePalavras[tamanho];
  if (!listaPermitida) return false;
  return listaPermitida.includes(palavraString.toLowerCase());
}

export function avaliarPalpite(palpite, alvo) {
  const tamanho = alvo.length;
  const resultados = Array(tamanho).fill("absent");
  const contagemLetras = {};

  const palpiteStr = Array.isArray(palpite) ? palpite.join("") : palpite;
  const alvoStr = Array.isArray(alvo) ? alvo.join("") : alvo;

  for (let i = 0; i < tamanho; i++) {
    const letra = alvoStr[i];
    contagemLetras[letra] = (contagemLetras[letra] || 0) + 1;
  }

  for (let i = 0; i < tamanho; i++) {
    if (palpiteStr[i] === alvoStr[i]) {
      resultados[i] = "correct";
      contagemLetras[palpiteStr[i]] -= 1;
    }
  }

  for (let i = 0; i < tamanho; i++) {
    const letraDigitada = palpiteStr[i];
    if (resultados[i] !== "correct" && contagemLetras[letraDigitada] > 0) {
      resultados[i] = "present";
      contagemLetras[letraDigitada] -= 1;
    }
  }

  return resultados;
}

// NOVA FUNÇÃO: Devolve o número exato do dia (Fuso de Brasília)
export function obterDiaAtual() {
  return Math.floor((Date.now() - 10800000) / 86400000);
}

// js/regras.js

// LCG (Linear Congruential Generator) para gerar números pseudo-aleatórios baseados numa semente
function randomComSemente(semente) {
  return function () {
    semente = (semente * 9301 + 49297) % 233280;
    return semente / 233280;
  };
}

export function sortearPalavrasDoDia(lista, qtd, offsetIndice = 0) {
  if (!Array.isArray(lista) || lista.length === 0 || qtd <= 0) return [];

  const diaAtual = obterDiaAtual();
  const rng = randomComSemente(diaAtual + 99999);
  const indices = Array.from({ length: lista.length }, (_, i) => i);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const inicio =
    ((offsetIndice % indices.length) + indices.length) % indices.length;
  return Array.from({ length: qtd }, (_, i) =>
    lista[indices[(inicio + i) % indices.length]].toUpperCase(),
  );
}
