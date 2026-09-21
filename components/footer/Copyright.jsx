import React from 'react'
import { Box, Typography } from '@mui/material'
import moment from 'moment'
import Link from '@mui/material/Link'
// style
import styles from '@/styles/copyright.module.scss'

// current year
const currentYear = moment().year()

const Copyright = () => {
  return (
    <>
      <Box
        className={ [styles.copyrightBox].join(' ') }
        sx={ { mt: 5, p: 2 } }
      >
        <Typography variant="body1" component="p">
          { ' ' }
          { currentYear } &copy; OpenLife V. 2.0. Tous droits reservés.
                                 Développé par{ ' ' }
          <Link
            href="https://www.karbura.com"
            underline="none"
            color="error"
          >
            { 'KARBURA S.A.' }
          </Link>
        </Typography>
      </Box>
    </>
  )
}

export default Copyright
