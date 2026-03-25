# CLAUDE.md — RJS Drainage All

## Visão Geral do Projeto

Aplicação web React para busca e análise de outorgas de uso de água (ADASA/DF). Permite pesquisar outorgas por formas geográficas no mapa (polígono, retângulo, círculo) ou por dados do usuário (nome, CPF/CNPJ, endereço, número de processo).

**Versão:** 1.27.0
**Órgão:** ADASA — Agência Reguladora de Águas, Energia e Saneamento do DF

---

## Comandos Essenciais

```bash
npm start          # Servidor de desenvolvimento
npm run build      # Build de produção
npm test           # Testes (com --watchAll=false)
npm run docs       # Gera documentação JSDoc em docs/
```

> Instalar dependências: `npm install --legacy-peer-deps` (necessário por conflito entre better-docs e React 18)

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| UI | React 18 + Material-UI v5 |
| Mapas | Google Maps API (@react-google-maps/api) |
| Geoespacial | Turf.js |
| Gráficos | Chart.js + ECharts |
| Estilo | Emotion (CSS-in-JS) |
| Export | XLSX (Excel) |
| Backend | REST API Azure |
| Docs | JSDoc + better-docs |

---

## Arquitetura

```
src/
├── App.js                  # Componente raiz
├── initials-states.js      # Estado inicial global
├── hooks/
│   └── analyse-hooks.js    # Context (DataProvider + useData)
├── services/               # Integração com a API backend
│   ├── connection/         # Usuários e demandas
│   ├── shapes/             # Consultas por forma geográfica
│   ├── geolocation/        # Serviços de localização
│   ├── barrage/            # Sistema de barragem
│   └── users/              # Gestão de usuários
├── components/
│   ├── Commom/             # Componentes reutilizáveis
│   │   ├── map/            # Wrappers Google Maps (ElemMap, ElemMarker, etc.)
│   │   ├── Subterranean/   # Análise de poços
│   │   └── General/        # Gráficos gerais
│   └── MainFlow/           # Fluxo principal da aplicação
│       ├── General/        # Painel principal + busca
│       ├── Subterranean/   # Análise subterrânea
│       ├── Surface/        # Análise superficial
│       └── Barrage/        # Análise de barragem
├── tools/
│   ├── index.js            # Utilitários geoespaciais
│   └── surface-tools.js    # Ferramentas de análise superficial
└── assets/                 # Ícones PNG/SVG
```

### Fluxo de Dados

1. Usuário interage com o mapa (desenha forma ou busca por dados)
2. `DataProvider` (Context) gerencia estado global via `useData()`
3. `services/` buscam dados no backend Azure
4. Componentes de análise exibem resultados em abas (Geral, Subterrânea, Superficial, Barragem)
5. Gráficos (Chart.js / ECharts) visualizam os dados
6. Exportação para Excel via XLSX

---

## Convenções de Código

- **Linguagem:** JavaScript (sem TypeScript)
- **Componentes:** arquivos `.js` com React Hooks
- **Nomenclatura de arquivos:** PascalCase para componentes, camelCase para utilitários
- **Pasta `Commom/`:** é um typo histórico do projeto — manter assim para não quebrar imports
- **Estado global:** usar o hook `useData()` do Context em vez de props drilling
- **Comentários:** em português com padrão jsdoc

---

## Subsistemas Principais

| Subsistema | Descrição |
|---|---|
| Pluvial | Águas pluviais |
| Subterrânea | Poços artesianos e subterrâneos |
| Superficial | Rios e mananciais superficiais |
| Efluente | Lançamento de efluentes |
| Barragem | Reservatórios e barragens |

---

## Backend

- URL base configurada em `src/services/connection/index.js`
- Hospedado no Azure (`app-sis-out-srh-backend-01...`)
- Comunicação via REST API (fetch nativo)
- Não há arquivo `.env` de exemplo — verificar variáveis de ambiente antes de rodar

---

## Observações Importantes

- O projeto usa `--legacy-peer-deps` na instalação por conflito entre `better-docs` e React 18
- A pasta `docs/` é gerada automaticamente — não editar manualmente
- A pasta `build/` é o output de produção — não versionar
- O arquivo `revisions.md` serve como log informal de bugs/correções
