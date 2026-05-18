# 🎰 Roleta da Sorte

> Projeto educativo sobre manipulação psicológica em jogos de apostas.

---

## Sobre o projeto

**Roleta da Sorte** é um jogo de roleta de cassino desenvolvido como trabalho acadêmico para expor, de forma interativa, as técnicas psicológicas usadas por plataformas de apostas para criar e manter o vício.

O jogo é **propositalmente injusto** — exatamente como cassinos reais — e o código é aberto para que você possa ver exatamente como a manipulação funciona por baixo dos panos.

---

## Como jogar

1. Abra `index.html` em qualquer navegador moderno
2. Clique em **Entrar no Cassino**
3. Escolha o valor da aposta (50, 100, 200 ou 500 chips)
4. Aposte no **Vermelho** ou no **Preto**
5. Clique em **Girar Roleta** e observe onde a bola para

---

## Mecânicas de manipulação (expostas)

Este projeto existe para mostrar o que acontece "por baixo" dos jogos de azar. Abaixo estão as técnicas implementadas **intencionalmente**:

### 1. Gancho inicial
Nas primeiras 2 rodadas, a chance de vitória é de **78%**. Isso cria uma sensação falsa de que o jogo é fácil de ganhar. A partir da rodada 3, a taxa cai para 22% e, após a rodada 7, para apenas 14%.

```
Rodadas 1–2:  78% de vitória  ← "Você vai ganhar fácil!"
Rodadas 3–7:  22% de vitória  ← A armadilha se fecha
Rodadas 8+:   14% de vitória  ← O cassino domina
```

### 2. Near-miss (quase acertou)
Em 40% das derrotas, a bola para propositalmente no setor **ao lado** de um número vencedor. Isso ativa o mesmo circuito cerebral de recompensa que uma vitória real, fazendo o jogador querer tentar de novo.

### 3. Mensagens encorajadoras na derrota
Ao perder, o jogo exibe frases como:
- *"Tente dobrar a aposta na próxima para recuperar!"*
- *"A sorte vai virar!"*
- *"Você estava tão perto!"*

Essas frases espelham o que plataformas de apostas reais fazem para manter o jogador na mesa.

### 4. Histórico de números
A tira de números anteriores cria a ilusão de que há um padrão a ser detectado. Na realidade, cada giro é independente — o que saiu antes não influencia o próximo resultado.

---

## Tecnologias

| Tecnologia | Uso |
|-----------|-----|
| HTML5 Canvas API | Desenho e animação da roleta |
| CSS3 | Tema dark casino, animações, layout responsivo |
| JavaScript (ES2020) | Lógica do jogo, probabilidades, manipulação de DOM |

Sem dependências externas. Funciona abrindo diretamente no navegador.

---

## Estrutura de arquivos

```
projeto_jogo_da_sorte/
├── index.html   — Estrutura das 3 telas (início, jogo, game over)
├── style.css    — Tema visual dark casino
├── script.js    — Lógica do jogo e roleta via Canvas
└── CLAUDE.md    — Documentação técnica para desenvolvimento
```

---

## Rodando o projeto

Sem servidor necessário — basta abrir o arquivo:

```bash
# Opção 1: abrir direto no navegador
open index.html

# Opção 2: servidor local (opcional)
npx serve .
# ou
python3 -m http.server 8080
```

---

## Mensagem educativa

> Jogos de azar são matematicamente projetados para que o cassino sempre vença no longo prazo. A sensação de "quase ganhar", as vitórias iniciais e as mensagens motivacionais são técnicas deliberadas de manipulação. Se você ou alguém que você conhece tem problemas com apostas, procure o **CVV (188)** ou o **CAPS** mais próximo.

---

## Autor

Desenvolvido por **Luis Eduardo Bezerra Cavalcanti de Carvalho** para projeto acadêmico de faculdade.

---

*Este projeto não promove apostas. Seu objetivo é o oposto: mostrar como elas manipulam.*
