# 📌 To-Do List - Padronização de Coordenadas

📅 **Data:** 18 de março de 2025  
👨‍💻 **Responsável:** [Luan Carvalho]  

## ✅ Objetivo  
Criar um padrão para coordenadas geográficas, aceitando valores em formato decimal com ponto ou vírgula e removendo espaços desnecessários.

---

## 🔹 Tarefas  

### 1️⃣ **Definir o formato padrão das coordenadas**  
- [x] Aceitar valores decimais usando ponto (`.`) como separador  
- [x] Aceitar valores decimais usando vírgula (`,`), convertendo para ponto (`.`)  
- [x] Remover espaços extras antes, depois e no meio do valor  

### 2️⃣ **Implementar a normalização das coordenadas**  
- [x] Criar uma função para limpar o input do usuário  
- [x] Substituir vírgulas (``,``) por pontos (`.`)  
- [x] Remover espaços extras  
- [x] Garantir que o valor final seja um número válido  

### 3️⃣ **Testar diferentes entradas**  
- [x] `-23.45678` → `-23.45678`  
- [x] ` 45,6789 ` → `45.6789`  
- [x] `  -12.345  ` → `-12.345`  
- [x] `90,1234 ` → `90.1234`  
- [x] `invalid123` → ❌ Erro  

### 4️⃣ **testar se as funções do mapa não foram interferidas pala nova padronização**
- [x] Trazer coordenadas ao clicar no mapa
- [x] Conferir se as coordenadas trazidas estão corretas


### 5️⃣ **Documentação e Padronização**  
- [x] Adicionar explicação sobre o novo formato aceito  
- [x] Criar exemplos para o usuário final  
- [x] Revisar e validar com a equipe

-------------------------------------------------------------------------------------------------

📅 **Data:** 21 de março de 2025  
👨‍💻 **Responsável:** [Luan Carvalho]  

## ✅ Objetivo  
Criar uma mensagem de alerta para avisar ao usuário sobre o formato correto das coordenadas inseridas.

---

## 🔹 Tarefas  

### 2️⃣ **Implementar Alerta de Formato de Coordenada Incorreto**  
- [x] Exibir alerta quando a coordenada inserida não corresponder ao formato esperado (ex: texto ou caracteres não numéricos)  
- [x] Criar mensagem de erro clara para o usuário, explicando o formato correto das coordenadas  

-------------------------------------------------------------------------------------------------