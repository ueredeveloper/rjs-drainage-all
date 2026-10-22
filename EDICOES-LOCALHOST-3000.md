# Edições locais na porta 3000

Guia rápido para rodar e editar o projeto localmente em `http://localhost:3000`.

## Configuração da porta

A porta está definida no arquivo `.env` da raiz:

```
PORT=3000
```

Para iniciar o servidor de desenvolvimento:

```bash
npm start
```

## Chave da API do Google Maps

A chave usada pelo mapa está em `src/new-design/NewDesign.js` (constante `GMAPS_API_KEY`).
Ela tem restrição de referenciadores HTTP no Google Cloud Console, então o mapa
**não carrega em `localhost:3000`** se esse endereço não estiver liberado.

### 1. Antes de começar as edições — ADICIONAR localhost:3000

1. Acesse o [Google Cloud Console → APIs e serviços → Credenciais](https://console.cloud.google.com/apis/credentials).
2. Abra a chave de API usada pelo projeto.
3. Em **Restrições de aplicativo → Referenciadores HTTP (sites)**, adicione:
   ```
   http://localhost:3000/*
   ```
4. Salve. A alteração pode levar alguns minutos para valer.

### 2. Depois das edições prontas — REMOVER localhost:3000

> ⚠️ **Antes de fazer o `git push`, remova `http://localhost:3000/*` da chave de API.**
> Deixar o localhost liberado permite que qualquer pessoa use a chave a partir
> de uma máquina local, consumindo a cota do projeto.

1. Volte em **Credenciais** e abra a mesma chave.
2. Remova a entrada `http://localhost:3000/*` dos referenciadores.
3. Salve.
4. Só então faça o commit/push.

## Checklist antes do push

- [ ] Edições testadas em `http://localhost:3000`
- [ ] `http://localhost:3000/*` **removido** da chave de API no Google Cloud Console
- [ ] Alterações registradas em `revisions.md`
- [ ] `git push`
