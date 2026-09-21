import { z } from 'zod'
import {
  emptyCodeErrorMessage,
  emptyDescriptionErrorMessage,
  emptyLabelErrorMessage,
  invalidTypeErrorMessage,
  minLengthLabelErrorMessage
} from "@/utils/literals/permissionsLiterals";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createPermission } from "@/services/permissionService";
import { PERMISSION_LISTING_PAGE } from "@/utils/routes/routes";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { zodResolver } from "@hookform/resolvers/zod";

const PermissionCreate = ({ currentUser }) => {

  // router
  const router = useRouter()

  // validation schema
  const validationSchema = z.object({
    label: z.string({
      required_error    : emptyLabelErrorMessage,
      invalid_type_error: invalidTypeErrorMessage
    }).min(3,
      { message: minLengthLabelErrorMessage }
    ).nonempty({
      message: emptyLabelErrorMessage
    }),

    code: z.string({
      required_error    : emptyCodeErrorMessage,
      invalid_type_error: invalidTypeErrorMessage
    }).nonempty({
      message: emptyCodeErrorMessage
    }).transform((val) => val.toUpperCase()),

    description: z.string({
      required_error    : emptyDescriptionErrorMessage,
      invalid_type_error: invalidTypeErrorMessage
    }).nonempty({
      message: emptyDescriptionErrorMessage
    })

  })

  // form hook
  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm({
    resolver: zodResolver(validationSchema)
  })

  // on form submission
  const onSubmit = async data => {

    const token = currentUser.token

    // request the api
    const res = await createPermission(token, data)

    // if created
    if (res.status === 201) {
      // redirect to permissions listing page
      router.push(PERMISSION_LISTING_PAGE)
    }
    else {
      throw new Error("Une erreur est survenue lors de la crétion du de la permission")
    }
  }

  return (
    <>
      <Paper
        elevation={ 3 }
        sx={ { borderRadius: 2, padding: '40px 24px' } }
      >
        <Typography variant="h5" component="h5" sx={ { mb: 3 } }>
          Créer une nouvelle permission
        </Typography>
        <Box component="form" onSubmit={ handleSubmit(onSubmit) }>
          <Grid container spacing={ 2 }>
            <Grid xs={ 12 } md={ 6 } lg={ 4 } xl={ 4 }>
              <TextField
                variant="outlined"
                type="text"
                id="label"
                label="Label *" { ...register('label') }
                error={ errors.label && true }
                helperText={ errors.label ? errors.label.message : "" }
                sx={ { width: '100%' } }
              />
            </Grid>
            <Grid xs={ 12 } md={ 6 } lg={ 4 } xl={ 4 }>
              <TextField
                variant="outlined"
                type="text"
                id="code"
                label="Code *" { ...register('code') }
                error={ errors.code && true }
                helperText={ errors.code ? errors.code.message : "" }
                sx={ { width: '100%' } }
              />
            </Grid>
            <Grid xs={ 12 } md={ 6 } lg={ 4 } xl={ 4 }>
              <TextField
                variant="outlined"
                type="description"
                id="description"
                label="Description *" { ...register('description') }
                error={ errors.description && true }
                helperText={ errors.description ? errors.description.message : "" }
                sx={ { width: '100%' } }
              />
            </Grid>
          </Grid>
          <Grid container>
            <Grid xs={ 12 } md={ 3 } lg={ 4 } xl={ 3 }>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={ { mt: 3, mb: 2, alignSelf: 'center' } }
              >Créer</Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </>
  );
};

export default PermissionCreate;