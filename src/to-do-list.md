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
- [] Adicionar nas informações das outorgas o tipo de uso, se prévia, direito de uso ou registro. Verificar se é possível adicionar se vendida, arquivado etc.


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



