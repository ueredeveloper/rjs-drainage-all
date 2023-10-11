## Junho/2023

### Tipos de Interferências e Cores de Marcadores

Coordenada inical: 
```
latlng: {
    color: red
}
```

Outras coordenadas por tipo de outorga:
```
[
superficial: {
    color: green
}, 
subterraneo: {
    ti_id: 1 - manual    || 2 - tubular
    color: 1 - brown     || 2 - blue
}
lancamento efluente: {
    color: purple
},
lançamento pluvial: {
    color: pink
}
barragem: {
    color: orange
}
]
```
## Julho/2023

1. Tabela Barragem - Coluna `to_tipo_outorga`

   - Renomear esta coluna na tabela de barragem para "Tipo de Outorga" em vez de "Barragem". A coluna deve conter o ID do tipo de outorga (`to_id`) e a descrição (`to_descricao`).
   

2. Animação do Marcador

   - Adicionar a opção de remover a animação do marcador inicial.

        |             | Fraturado | Poroso | Bacias... | Unidades...
        |------------ | --------- | ------ | --------- | --------
        | Checkbox    | [ ]       | [ ]    | [ ]       | [ ]  

## Agosto/2023

1. Parte Geral
    * Criar um buscador de outorgas a partir de uma coordenada. 
    Buscar todas as  outorgas em uma raio de 100 metros.
2. Unidades Hidrográficas e Bacias Hidrográficas
    A Rosângela pediu as informações das UHs e BHs no inforwindow de cada marcador (outorga). Verificar se está sendo trazido o código de cada UH e BH e não só o nome. Lembrando que  o código não é  o mesmo que o id de cada bacia.
    É preciso adicionar a coluna uh_codigo em cada usuário cadastrado no supabase.


    [centralização do mapa](./map-center-marker)

## Setembro/2023

1. Adicionar slide de escolha de raio da circunferência.
    * Resolvido em 11/09/23.
        * Foi adicionado um slider que percorre os valores de 100 a 2000 metros ao lado das coordenadas (CoordPaper.js).

2. Adicionar cálculos superficiais e subterrâneos

3. Adicionar cópia de coordenadas

4. Ao limpar o mapa atualizar o gráfico com o valor inicial (ElemGrantsChart)

    * 12/09/23 
        Não vou fazer agora.