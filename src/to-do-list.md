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

----------------------------------------------------------------------------------------------------------------------------------------------


📅 **Data:** 10 de abril de 2025  
👨‍💻 **Responsável:** [Luan Carvalho]  

## ✅ Objetivo  
Criar um alerta para as coordenadas, caso sejam inseridas incorretamente

---

## 🔹 Tarefas  

### 1️⃣ **Exibir alerta ao usuário**

- [x] Criar mensagem clara de erro

- [x] Usar o componente AlertCommom

- [x] Fechar alerta automaticamente após alguns segundos 

--------------------------------------------------------------------------------------------------------------------------------------------------

📅 Data: 14 de abril de 2025
👨‍💻 Responsável: [Luan Carvalho]

✅ Objetivo
Alterar a cor da borda dos polígonos para vermelho.

🔹 Tarefas
1️⃣ Alterar a cor da borda dos polígonos
 Alterar a cor da borda dos polígonos para vermelho.

-----------------------------------------------------------------------------------------------------

🗓️ Data: 20 de abril de 2025👨‍💻 Responsável: [Luan Carvalho]

✅ ObjetivoExibir InfoWindow personalizada ao clicar nas shapes desenhadas no mapa (polígono, retângulo, círculo e linha), permitindo personalizações e cálculo de área.

🔹 Tarefas

1️⃣ Criar componente ElemDrawInfoWindow

 - Integrar InfoWindow ao mapa
 - Gerenciar abertura/fechamento da InfoWindow
 - altera as cores das bordas e do preenchimento dos polígonos criados

