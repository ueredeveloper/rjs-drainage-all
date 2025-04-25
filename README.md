# RJS - DRAINAGE - ALL

Programa de busca de outorgas por camadas (Polígonos, Retângulos, Círculos, Marcadores) e por dados do usuário como nome, CPF/CNPJ, endereço, número do processo ou ato.

## 📚 Gerar Documentação com JSDoc

Este projeto utiliza o [JSDoc](https://jsdoc.app/) com o template [`better-docs`](https://github.com/SoftwareBrothers/better-docs) para gerar a documentação dos componentes e funções.

### ▶️ Atualizar Documentação

Adicione better docs quando precisar atualizar a documentação nod dev dependencies e instale com pois ela necessita do React 17, é preciso
forçar a instalação no React 18.

```
npm install better-docs --save-dev --legacy-peer-deps
```
Como fica o package.json:
```
 "devDependencies": {
    "better-docs": "^2.7.3",
    "cross-env": "^7.0.3",
    "jsdoc": "^4.0.4"
  }
```
Para dar run na documentação e atualizá-la:
```
npm run docs
```


