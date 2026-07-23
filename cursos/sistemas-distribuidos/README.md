# Plataforma de Ensino — Sistemas Distribuídos (SLTSIDO)

Plataforma web estática (apenas **HTML, CSS e JavaScript** — sem dependências nem build)
para apoio à disciplina **Sistemas Distribuídos** do curso de Tecnologia em Análise e
Desenvolvimento de Sistemas (IFSP — Campus Salto), baseada no plano de ensino SLTSIDO.

Funciona aberta **direto do disco** (duplo clique em `index.html`) ou servida por qualquer
servidor estático (ex.: `npx serve app` ou a extensão *Live Server* do VS Code).

## Funcionalidades previstas na estrutura

| Funcionalidade | Onde está |
|---|---|
| Trilha com 12 tópicos do conteúdo programático | `content/course.js` (manifesto) + `content/topics/` |
| Modo apresentação para o docente (slides, tela cheia, setas do teclado) | `assets/js/ui/presentation.js` |
| Quiz de autoavaliação por tópico com correção automática | `assets/js/ui/quiz.js` |
| Progresso salvo por **cookie** (tópico concluído ao responder o quiz) | `assets/js/core/store.js` + `assets/js/ui/progress.js` |
| Tema claro/escuro persistido por cookie | `assets/css/tokens.css` + `assets/js/ui/theme.js` |
| Glossário geral agregado dos tópicos | `assets/js/views/glossary.js` |
| Demonstrações interativas por tópico (1ª: "Caiu ou está lenta?", Tópico 1) | `assets/js/demos/` + `.demo-area[data-demo]` nos tópicos |

## Estrutura de pastas

```
app/
├── index.html                  # Única página (SPA); carrega CSS e JS na ordem correta
├── assets/
│   ├── css/
│   │   ├── tokens.css          # ⭐ Design tokens (cores, fontes, espaçamentos, temas)
│   │   ├── base.css            # Reset e elementos básicos
│   │   ├── layout.css          # Cabeçalho, sidebar, área principal, rodapé
│   │   ├── components.css      # Cards, botões, quiz, glossário, progresso etc.
│   │   ├── demos.css           # Demonstrações interativas
│   │   └── presentation.css    # Modo apresentação (slides)
│   ├── img/                    # Imagens e diagramas (vazia por enquanto)
│   └── js/
│       ├── app.js              # Inicialização: tema → layout → rotas → roteador
│       ├── core/
│       │   ├── store.js        # Cookies (tema e progresso)
│       │   ├── router.js       # Roteador por hash (#/, #/topico/01, ...)
│       │   └── loader.js       # Carrega tópicos sob demanda via <script>
│       ├── demos/
│       │   └── caracterizacao-falhas.js  # Demo do Tópico 1: "Caiu ou está lenta?"
│       ├── ui/
│       │   ├── theme.js        # Alternância claro/escuro
│       │   ├── layout.js       # Renderiza cabeçalho, sidebar e rodapé
│       │   ├── progress.js     # Regras e barra de progresso
│       │   ├── quiz.js         # Renderização e correção do quiz
│       │   └── presentation.js # Modo apresentação
│       └── views/
│           ├── home.js         # Página inicial (trilha de tópicos)
│           ├── topic.js        # Página de um tópico
│           ├── glossary.js     # Glossário geral
│           └── about.js        # Sobre a disciplina (plano de ensino)
└── content/
    ├── course.js               # ⭐ Manifesto: dados da disciplina e lista de tópicos
    └── topics/
        ├── topic-01.js         # ⭐ MODELO comentado de arquivo de tópico
        └── topic-02.js ... topic-12.js
```

## Os 12 tópicos (derivados do conteúdo programático)

1. Caracterização de Sistemas Distribuídos
2. Modelos de Sistema
3. Redes de Computadores e Interligação em Rede
4. Comunicação entre Processos
5. Objetos Distribuídos e Invocação Remota
6. Sistemas Operacionais Distribuídos
7. Segurança
8. Sistemas de Arquivos Distribuídos
9. Serviços de Nomes
10. Replicação
11. Computação em Nuvem
12. Computação Móvel e Ubíqua

> O item "Computação móvel e ubíqua" do plano de ensino foi desdobrado em tópico
> próprio (12), mantendo o total dentro do limite de 15 tópicos.

## Como inserir o conteúdo real (próxima etapa)

1. Abra `content/topics/topic-XX.js` do tópico desejado (use `topic-01.js` como modelo).
2. Preencha:
   - `sections[]` — cada seção tem `title` e `html` (string com o HTML do conteúdo).
     **Não numere os títulos**: o app numera sozinho no estilo livro didático
     (tópico N vira capítulo N; seções viram N.1, N.2…, na página e nos slides);
   - `slides[]` (opcional, dentro de cada seção) — versões enxutas `{ title, html }`
     para o modo apresentação (~5 bullets curtos por slide; uma seção pode gerar vários
     slides). Sem elas, a seção inteira vira um único slide e tende a estourar a tela;
   - `quiz[]` — questões `{ question, options, answer (índice), explanation }`;
   - `glossary[]` — termos `{ term, definition }` (alimentam também o glossário geral);
   - `references[]` — bibliografia específica do tópico.
3. Para imagens, salve em `assets/img/` e referencie no HTML da seção.
4. **Não** é preciso mexer em mais nada: navegação, quiz, glossário, progresso e modo
   apresentação funcionam automaticamente a partir desses dados.

### Para adicionar/reordenar tópicos

Edite a lista `topics` em `content/course.js` e crie o arquivo `topic-XX.js`
correspondente. A sidebar, a home, a paginação e o progresso se ajustam sozinhos.

### Para mudar o visual

Edite **apenas** `assets/css/tokens.css` (cores, fontes, espaçamentos, raios, sombras).
Todos os componentes consomem essas variáveis; os temas claro/escuro são os blocos
`[data-theme="light"]` e `[data-theme="dark"]`.

### Demonstrações interativas

Cada tópico reserva blocos `.demo-area` com `data-demo="nome-da-demo"`. Para implementar
uma demo: crie `assets/js/demos/<nome>.js` registrando
`SD.demos["nome"] = { mount: function (container) { ... } }` e inclua o script no
`index.html` — `views/topic.js` monta o módulo no lugar do placeholder automaticamente
(sem módulo registrado, o placeholder permanece). O gancho `content.initDemos` segue
disponível para demos que precisem de dados do próprio tópico.

A primeira demo é a do Tópico 1 (`caracterizacao-falhas`; plano e fundamentação em
`docs/demos/2026-07-13-demo-caracterizacao-falhas-plano.md`). Parâmetros de URL para
teste: `?demo-seed=<int>` torna a simulação determinística e `?demo-fast=1` acelera o
tempo — úteis na verificação automatizada com Playwright.

## Persistência (cookies)

| Cookie | Conteúdo |
|---|---|
| `sd_theme` | `light` ou `dark` |
| `sd_progress` | JSON `{ "01": { visited, quizScore, done }, ... }` |

O progresso pode ser apagado pelo usuário na página **Sobre a disciplina**.

> **Observação:** alguns navegadores (Chrome/Edge) não persistem cookies quando a
> página é aberta direto do disco (`file://`). Nesse cenário a navegação funciona
> normalmente, mas o progresso/tema podem não ser salvos entre sessões — sirva o site
> por um servidor estático (ex.: `npx serve app`) para a persistência completa.
