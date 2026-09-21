'use client'

import { Box, Button, Link, Paper, TextField, Typography, } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import Image from 'next/image'
import { logo } from '@/utils/assets/assets'
import { LOGIN_PAGE } from '@/utils/routes/routes'
import { register } from '@/services/registerService'
import { useState } from "react";

const signUpPage = () => {

  // user info
  /*const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [profilePhoto, setProfilePhoto] = useState('')*/

  const [formData, setFormData] = useState({
    first_name   : '',
    last_name    : '',
    email        : '',
    phone_number : '',
    password     : '',
    profile_photo: ''
  })

  // Update form data handler
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // handle the form submission
  const handleSubmit = e => {
    e.preventDefault()

    // const data = new FormData(e.currentTarget)

    // send the form data to api
    register(formData)
  }

  return (
    <Box
      sx={ {
        width         : '100vw',
        height        : '100vh',
        display       : 'flex',
        flexFlow      : 'column nowrap',
        alignItems    : 'center',
        justifyContent: 'center',
      } }
    >
      <Image
        src={ logo }
        alt="OpenLife logo"
        width={ 250 }
        height={ 120 }
        style={ { marginBottom: '40px' } }
      />

      {/* <Typography
				variant="h3"
				component="h1"
				align="center"
				sx={{ mb: 5, fontWeight: 700 }}
			>
				inscription
			</Typography> */ }

      <Paper
        elevation={ 3 }
        sx={ { borderRadius: 3, padding: '40px 24px', width: 700 } }
      >
        <Typography
          variant="h5"
          component="h5"
          sx={ { mb: 3, fontWeight: 700 } }
          align="center"
        >
          Créer un compte
        </Typography>
        <Box component="form" onSubmit={ handleSubmit }>
          <Grid container spacing={ 2 }>
            <Grid xs={ 6 }>
              <TextField
                id="first_name"
                label="Nom"
                name="first_name"
                onChange={ handleInputChange }
                required
                fullWidth
              />
            </Grid>
            <Grid xs={ 6 }>
              <TextField
                id="last_name"
                label="Prénom"
                name="last_name"
                onChange={ handleInputChange }
                required
                fullWidth
              />
            </Grid>
            <Grid xs={ 6 }>
              <TextField
                id="email"
                label="Adresse e-mail"
                name="email"
                type="email"
                onChange={ handleInputChange }
                required
                fullWidth
              />
            </Grid>
            <Grid xs={ 6 }>
              <TextField
                id="phone_number"
                label="Numéro de téléphone"
                name="phone_number"
                type="number"
                onChange={ handleInputChange }
                required
                fullWidth
              />
            </Grid>
            <Grid xs={ 6 }>
              <TextField
                id="password"
                label="Mot de passe"
                name="password"
                type="password"
                variant="outlined"
                onChange={ handleInputChange }
                required
                fullWidth
              />
            </Grid>
            <Grid xs={ 6 }>
              <TextField
                id="password_confirm"
                label="Confirmer le mot de passe"
                name="password_confirm"
                type="password"
                variant="outlined"
                required
                fullWidth
              />
            </Grid>
            <Grid xs={ 12 }>
              <TextField
                id="profile_photo"
                name="profile_photo"
                type="file"
                label="Photo de profil"
                onChange={ handleInputChange }
                fullWidth
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={ {
              mt          : 3,
              mb          : 3,
              display     : 'block',
              marginInline: 'auto',
            } }
          >
            Créer le compte
          </Button>
          <Link
            href={ LOGIN_PAGE }
            variant="body1"
            underline="none"
            color="primary"
            sx={ { display: 'block', textAlign: 'center' } }
          >
            { 'Je souhaite me connecter' }
          </Link>
        </Box>
      </Paper>
    </Box>
  )
}

export default signUpPage
