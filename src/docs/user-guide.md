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
        - Resolvido: Foi adicionado animação do tipo saltar (bounce) no marcador inicial.

   - Adicionar checkbox com shapes necessárias na avaliação de outorgas.

        |             | Fraturado | Poroso | Bacias... | Unidades...
        |------------ | --------- | ------ | --------- | --------
        | Checkbox    | [ ]       | [ ]    | [ ]       | [ ]  
        - Resovido

## Agosto/2023

1. Parte Geral
    - Criar um buscador de outorgas a partir de uma coordenada. Buscar todas as  outorgas em uma raio de 100 metros.
        - Resolvido: Foi adicionado um slider que percorre valores de 100 a 2000 metros.

2. Unidades Hidrográficas e Bacias Hidrográficas
    - A Rosângela pediu as informações das UHs e BHs no inforwindow de cada marcador (outorga). Verificar se está sendo trazido o código de cada UH e BH e não só o nome. Lembrando que  o código não é  o mesmo que o id de cada bacia.
    É preciso adicionar a coluna uh_codigo em cada usuário cadastrado no supabase.
        - Resolivido: No infowindows está sendo mostrado a unidade hidrográfica e bacia.


    [centralização do mapa](./map-center-marker)

## Setembro/2023

1. Adicionar slide de escolha de raio da circunferência.
    - Resolvido em 11/09/23: Foi adicionado um slider que percorre os valores de 100 a 2000 metros ao lado das coordenadas (CoordPaper.js).

2. Adicionar cálculos superficiais e subterrâneos

3. Adicionar cópia de coordenadas

4. Ao limpar o mapa atualizar o gráfico com o valor inicial (ElemGrantsChart)

    - 12/09/23 
        Não vou fazer agora.


## Outubro/2023

1. Subterrâneo - Exposição nas Tabelas
    - Melhorar a exposição das tabelas, no caso da tab subterrânea só mostrar a tabela subterrânea. 
        - 17/10/2023
            - É possível deixar mostrar todas as outorgas nas tabelas, porém no mapa mostrar apenas as outorgas subterrâneas. Por este motivo não vou mexer agora no sentido de mostrar apenas a tabela subterrânea.
2. Subterrâneo - Somente Resultados Subterrâneos
    - Verificar a possibilidade de trazer somente os resultados específicos no caso da tab subterrânea e se o usuário solicitar trazer as demais outorgas, como superficial, barragens etc...
        - 17/10/2023
            - Deixarei paralisado no momento.

3. Subterrâneo - Marcador Inicial e Vazão 
    - Adicionar um marcador inicial, sendo este a busca do usuário pelas coordenadas, que gera uma vazão nula, ou a busca no cadastro do banco de dados azure que dá uma vazão específica.
    17/10/2023
        Iniciando hoje este trabalho.



