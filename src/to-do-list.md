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
--------------------------------------------------------------------------------------------------------------------------------------------------

📅 **Data:** 16 de junho de 2025  
👨‍💻 **Responsável:** [Fabrício Barrozo]  

- [X] Cálculos Superficiais
- [X] Atualização dos cálculos ao digitar um valor em todas as linhas necessárias
- [X] Adicionar rios do DF.
- [] Inserir infowindow nas polylines dos rios.
- [] Permitir números float nos inpust de tabelas e cálculos
- [X] Adicionar nas informações das outorgas o tipo de uso, se prévia, direito de uso ou registro. Verificar se é possível adicionar se vendida, arquivado etc.


------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

📅 **Data:** 23 de junho de 2025 
👨‍💻 **Responsável:** [Luan Carvalho]

✅ Objetivo
Implementar e integrar o InfoWindow personalizado para formas desenhadas no Google Maps, com suporte completo a estilos e interações.

🔹 Tarefas

[x] Criar componente ElemDrawManager para gerenciar desenhos no mapa

[x] Implementar lógica de detecção e captura de overlaycomplete

[x] Identificar tipo de shape desenhada e calcular propriedades específicas (área, posição, marcadores)

[x] Criar InfoWindow customizado com conteúdo dinâmico (ElemDrawInfoWindow)

[x] Abrir InfoWindow ao clicar sobre a shape desenhada

[x] Adicionar listeners interativos dentro do InfoWindow (cor, opacidade, cálculo de área)

[x] Armazenar referência ao InfoWindow na shape desenhada para controle

[x] Atualizar estado global de overlays após cada desenho

[x] Garantir o encerramento adequado do DrawingManager no unmount do componente

[x] Padronização do código para react

-----------------------------------------------------------------------------------------------

📅 **Data:** 04 de julho de 2025  
👨‍💻 **Responsável:** [Luan Carvalho]  

## ✅ Objetivo  
Permitir números float no Superficial, na aba de tabelas, QSS

---

## 🔹 Tarefas

### 1️⃣ Permitir a digitação de números com casas decimais (float) nos inputs das tabelas de QSS  
- [x] Ajustar os campos para aceitar ponto e vírgula como separador decimal  
- [x] Garantir que a validação aceite valores float (ex: `12.5`, `7,25`, `0.75`)  
- [x] Atualizar mensagens de erro e tooltips para informar o novo formato aceito  

### 2️⃣ Ajustar cálculos e exibição  
- [x] Garantir que os cálculos e atualizações funcionem corretamente com valores float  
- [x] Padronizar a exibição dos valores nas tabelas (usar sempre ponto como separador)  



📅 **Data:** 01 de Agosto de 2025 

- [] Testar o salvamento de documento quando há duas interferências cadastradas

📅 **Data:** 12 de Setembro de 2025 
- [] A busca por endereço está fucionando, mas é preciso verificar como mostar o polígono do endereço quando
pesquisado pelo input. Está pesquisando, clicando, mas não está aparecendo no mapa.

📅 **Data:** 16 de Setembro de 2025 
- [] Melhorar a busca por rios, melhorar a performance de pesquisa
- [] Nos polígonos de endereço, buscar o centro do polígono para centralizar o mapa.
- [] Adicionar no polígono de endereço busca por outorgas.
- [] Verificar polilinhas das ottobacias, se estão ficando mais largas ao dar o zoom

📅 **Data:** 06 de Outubro de 2025 
- [X] Mover o botão de camadas mais para a esquerda. Está atrapalhando o botão do streetview. 


📅 **Data:** 04 de Dezembro de 2025 
- [X] Aumentar o raio de busca do abastecimento da Caesb (10000 e 20000) - v1.26.1


📅 **Data:** 09 de Janeiro de 2026
- [] Há três endpoints finais para migrar para o azure.