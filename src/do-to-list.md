# 📌 To-Do List - Padronização de Coordenadas

📅 **Data:** 18 de março de 2025  
👨‍💻 **Responsável:** [Seu Nome]  

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

### 4️⃣ **Documentação e Padronização**  
- [x] Adicionar explicação sobre o novo formato aceito  
- [x] Criar exemplos para o usuário final  
- [x] Revisar e validar com a equipe  

---

## 🔧 **Código Implementado**

