
# Observações

16/06/2023

Divisões das interferências

```
latlng:{
    color: red
}
[
superficial: {
    color: green
}, 
subterraneo: {
   ti_id: 1 - manual || 2 - tubular
   color: 1 - orange || 2 - blue
}
lancamento: {
    color: purple
},
barragem:{
    color: yellow
}
]

```
Cores dos marcadores

É preciso rever as tabelas de superficial, subterrânea, barragem e lançamentos no supabase.

---

21/06/2023

## Painel Geral:

1. O mapa principal é o HYBRID da gmaps api.
    a. Em 21/06/2023, resolvido.
    b. Talvez adicionar opção de seleção de tipo de mapa.
2. Cálculo de Área
3.  Informar ao raio de cada círculo criado
4. Consultar todos os tipos de outorga.
5. Adicionar ferramenta de medição de área e régua
6. Inserir buscas por NOME,CPF/CNPJ, ENDEREÇO, PROCESSO, NÚMERO DE
ATO, BACIA, UH, RA
7. Adicionar infowindow - gmaps api - com informações do marcador.