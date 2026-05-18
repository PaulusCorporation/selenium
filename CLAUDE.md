# CLAUDE.md — Roleta da Sorte

Guia de contexto para o assistente de IA continuar o trabalho exatamente de onde parou.

---

## O que é este projeto

Jogo de roleta de cassino desenvolvido como **projeto acadêmico educativo** sobre vício em apostas. O objetivo é expor, de forma interativa, como os jogos de azar manipulam o jogador psicologicamente. O código é propositalmente viesado para o cassino ganhar, simulando o que acontece na realidade.

**Finalidade:** Trabalho de faculdade. Não é um cassino real.

---

## Estrutura de arquivos

```
projeto_jogo_da_sorte/
├── index.html   — Estrutura HTML (3 telas: início, jogo, game over)
├── style.css    — Tema dark casino com ouro e felt verde
├── script.js    — Lógica do jogo + desenho da roleta via Canvas API
├── CLAUDE.md    — Este arquivo
└── README.md    — Documentação pública do projeto
```

---

## Arquitetura do script.js

### Constantes
- `WHEEL_ORDER` — Ordem real da roleta europeia (37 números: 0–36)
- `RED_NUMBERS` — Set com os números vermelhos da roleta europeia
- `WIN_RATES` — Probabilidades por fase: `{ early: 0.78, mid: 0.22, late: 0.14 }`
- `STARTING_BALANCE` — 1000 chips
- `CANVAS_SIZE` — 340px

### Fluxo de uma rodada
1. `playRound()` — Desconta a aposta, incrementa rodada, chama `pickTargetIndex()`
2. `pickTargetIndex(shouldWin)` — Decide o setor onde a bola para (com near-miss 40% nas perdas)
3. `spinTo(targetIndex, callback)` — Anima a roleta com `easeOut` até o setor certo
4. `showResult(num, color, didWin)` — Exibe mensagem psicológica + confete se ganhou
5. `addHistory(num)` — Atualiza a tira de histórico visual

### Lógica de probabilidade (manipulação educativa)
| Rodada | Taxa de vitória |
|--------|----------------|
| 1–2    | 78% (gancho inicial) |
| 3–7    | 22% |
| 8+     | 14% |

**Near-miss:** 40% das derrotas fazem a bola parar no setor adjacente a um número vencedor, criando ilusão de "quase ganhou".

### Canvas / Roleta
- `drawWheel(angle)` — Redesenha o canvas inteiro com a roleta na posição `angle` (radianos)
- `computeTargetAngle(targetIndex)` — Calcula o ângulo final para o setor alvo, garantindo 6–9 voltas completas
- `easeOut(t)` — Curva de desaceleração cúbica (`1 - (1-t)^4`)

### Telas
- `showGame()` — Reseta estado e exibe tela de jogo
- `showStart()` — Volta à tela inicial
- `showGameOver()` — Exibe estatísticas finais com total perdido

---

## Design visual (style.css)

- **Tema:** Dark casino — fundo quase preto `#0b0b0e`, felt verde `#0c3a20`
- **Paleta dourada:** `#d4af37` (ouro principal), `#f0d060` (claro), `#8b6914` (escuro)
- **Botão primário:** Gradiente dourado com sombra e efeito `translateY` no hover
- **Chips:** Círculos coloridos (azul 50, vermelho 100, verde 200, ouro 500)
- **Roleta:** Canvas com setores, anel externo dourado, hub central, ponteiro triangular CSS
- **Confete:** Peças absolutas com `animation: confetti-fall` — removidas após 2.2s

---

## O que ainda pode ser feito

- [ ] Adicionar sons (giro, vitória, derrota)
- [ ] Exibir "bola" animada no canvas durante o giro
- [ ] Tela de tutorial explicando as mecânicas manipulativas
- [ ] Contador de "sequência de perdas" para mostrar dados reais
- [ ] Gráfico de evolução do saldo ao longo das rodadas
- [ ] Opção de apostas em números específicos (paga 36x)
- [ ] Texto educativo visível durante/após o jogo (tipo overlay)

---

## Decisões de design notáveis

1. **Probabilidades reveladas no código** — diferentemente de um cassino real, aqui o código é aberto para o aluno ver a manipulação.
2. **Mensagens de near-miss** — implementadas explicitamente para o usuário entender a técnica.
3. **Saldo visivelmente reduzindo** — o contador de perdas na UI é intencional para chocar o jogador.
4. **Game over educativo** — a tela final mostra o total perdido com uma frase explicativa sobre o vício.
