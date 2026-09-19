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

export function sortearPalavrasDoDia(listaDePalavras, quantidadeDePalavras) {
  const diasPassados = Math.floor((Date.now() - 10800000) / 86400000);
  const palavrasEscolhidas = [];

  for (let i = 0; i < quantidadeDePalavras; i++) {
    const indice = (diasPassados + i) % listaDePalavras.length;
    palavrasEscolhidas.push(listaDePalavras[indice].toUpperCase());
  }

  return palavrasEscolhidas;
}
