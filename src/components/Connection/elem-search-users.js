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

function ElemSearchUsers({ search, setSearch, setUsers }) {

  // mostrar barra de progresso ao clicar
  const [loading, setLoading] = useState(false);

  const handleUserChange = (event) => {

    setSearch(prev => {
      return {
        ...prev,
        [event.target.name]: event.target.value
      }
    });
  };

  /**
  * Buscar pontos de outorga no banco de dados azure, utilizado para criar parecer e outros atos.
  * @param {string} us_nome Nome do usuário.
  * @param {string} us_cpf_cnpj CPF ou CNPJ do usuário.
  * @param {string} doc_sei Documento no sistema SEI.
  * @param {string} prc_sei Processo.
  */
  async function searchUsers() {
    setLoading((prevLoading) => !prevLoading);

    let keyword = search.us_nome || search.us_cpf_cnpj || search.doc_sei || search.proc_sei;

    await getUsers(keyword)
      .then((users) => {

        if (users.length>0){
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
        <Box sx={{ display: 'flex', flexDirection: 'flex-row' }}>
          <Box sx={{ marginLeft: '1rem', marginRight: '1rem' }}>
            <TextField id="us_nome"
              color="secondary"
              name="us_nome"
              value={search.us_nome}
              label="Usuário"
              variant="standard"
              onChange={handleUserChange} />
          </Box>
          <Box sx={{ marginLeft: '1rem', marginRight: '1rem' }}>
            <TextField id="us_cpf_cnpj"
              color="secondary"
              name="us_cpf_cnpj"
              value={search.us_cpf_cnpj}
              label="CPF/CNPJ"
              variant="standard"
              onChange={handleUserChange} />
          </Box>
          <Box sx={{ marginLeft: '1rem', marginRight: '1rem' }}>
            <TextField id="doc_sei"
              color="secondary"
              name="doc_sei"
              value={search.doc_sei}
              label="Documento"
              variant="standard"
              onChange={handleUserChange} />
          </Box>
          <Box sx={{ marginLeft: '1rem', marginRight: '1rem' }}>
            <TextField id="proc_sei"
              color="secondary"
              name="proc_sei"
              value={search.proc_sei}
              label="Processo"
              variant="standard"
              onChange={handleUserChange} />
          </Box>
          <Box sx={{ display: 'flex' }}>
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
