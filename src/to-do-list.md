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

---

## 🔧 **Código Implementado**

-------------------------------------------------------------------------------------------------

# 📌 To-Do List - Alerta para Coordenadas Inválidas  

📅 **Data:** 21 de março de 2025  
👨‍💻 **Responsável:** [Luan Carvalho]  

## ✅ Objetivo  
Criar uma mensagem de alerta para avisar ao usuário sobre o formato correto das coordenadas inseridas.

---

## 🔹 Tarefas  

### 1️⃣ **Verificar Formato de Coordenada**  
- [x] Implementar função de validação de coordenadas 

### 2️⃣ **Implementar Alerta de Formato Incorreto**  
- [x] Exibir alerta quando a coordenada inserida não corresponder ao formato esperado (ex: texto ou caracteres não numéricos)  
- [x] Criar mensagem de erro clara para o usuário, explicando o formato correto das coordenadas  

### 3️⃣ **Testar Validação e Alertas**  
- [x] Testar entradas válidas (ex: `-23.45678`, `45,6789`, `-12.345`)  
- [x] Testar entradas inválidas (ex: `invalid123`, `abc,xyz`, `123xyz`)  
- [x] Validar se a mensagem de erro é exibida corretamente nas entradas inválidas  
- [x] Testar se a função de alerta é acionada corretamente sem interferir no fluxo de outras funcionalidades  

### 4️⃣ **Integrar ao Sistema de Coordenadas do Mapa**  
- [x] Verificar se o alerta de coordenadas inválidas não interfere no funcionamento do mapa (clique para obter coordenadas, etc.)  
- [x] Garantir que as coordenadas extraídas do mapa continuem sendo tratadas corretamente, sem gerar erros  

### 5️⃣ **Documentação e Exemplos**  
- [x] Atualizar a documentação do sistema, explicando como o usuário deve inserir coordenadas corretamente  
- [x] Incluir exemplos de entradas válidas e inválidas para ajudar o usuário a entender o formato esperado  

### 6️⃣ **Revisão e Validação**  
- [x] Revisar implementação do alerta com a equipe de desenvolvimento para garantir que o sistema esteja funcionando conforme esperado  
- [x] Validar se as mensagens de alerta estão claras e compreensíveis para os usuários  

## 🔧 **Código Implementado**