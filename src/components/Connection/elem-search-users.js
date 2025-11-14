import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
/* icons */
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import { getUsers } from '../../services/connection';
import { blue } from '@mui/material/colors';
import { CircularProgress, Fade } from '@mui/material';

function ElemSearchUsers({ keyword, setKeyword, setUsers }) {

  // mostrar barra de progresso ao clicar
  const [loading, setLoading] = useState(false);

  const handleUserChange = (event) => {

    let keyword = event.target.value;

    setKeyword(keyword);
  };

  /**
  * Buscar pontos de outorga no banco de dados azure, utilizado para criar parecer e outros atos.
  * @param {string} us_nome Nome do usuário.

  */
  async function searchUsers() {

    setLoading((prevLoading) => !prevLoading);

    await getUsers(keyword)
      .then((users) => {

        if (users.length > 0) {
          let _users = users?.map(user => {
            user.dt_demanda = {
              "demandas": [],
              "vol_anual_ma": "0"
            }
            return user;
          })
          setUsers(_users)
        }

      }
      ).then(() =>
        setLoading(false));
  }

  return (
    <Box sx={{ pt: 0 }}>
      <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Pesquisa</FormLabel>
      <Box sx={{ display: 'flex', flexDirection: 'flex-row', justifyContent: 'space-between', marginTop: 2, marginBottom: 2 }}>
        {/* Pesquisa de Usários*/}
        <Box sx={{ display: 'flex', flexDirection: 'flex-row', width: '50%', justifyContent: 'center', alignItems: 'center' }}>
          <Box sx={{ marginLeft: '1rem', marginRight: '1rem', width: '100%' }}>
            <TextField id="us_nome"
              color="secondary"
              name="us_nome"
              value={keyword}
              label="Usuário, Cpf/Cnpj, Documento ou Processo"
              variant="standard"
              onChange={handleUserChange}
              sx={{ width: '100%' }}
            />

          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
            {loading ?
              <Fade
                sx={{ alignSelf: 'center', color: "secondary.main", backgroundColor: blue }}
                in={loading}
                style={{
                  transitionDelay: loading ? '800ms' : '0ms',
                }}
                unmountOnExit
              >
                <CircularProgress size={25} />
              </Fade>
              :
              <IconButton color="secondary" size="large" onClick={() => { searchUsers() }}>
                <SearchIcon />
              </IconButton>}
          </Box>
        </Box>
      </Box>

    </Box>

  )
}


export { ElemSearchUsers }
