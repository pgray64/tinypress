/*
Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/

import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CustomSnackbar from "../../partials/global/customSnackbar";
import AccountAppBar from "../../partials/account/accountAppBar";
import { addUser } from "../../services/api/admin/manageUsers";
import { Button } from "@mui/material";

import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import CheckFeatureAccess from "../../partials/account/checkFeatureAccess";
import ProductFeatures from "../../enums/productFeatures/productFeatures";
import TextField from "@mui/material/TextField";
import UserRoleMultiselect from "../../partials/admin/userRoleMultiselect";
import { validateFormData } from "../../helpers/validation/validateFormData";

const theme = createTheme();

export default function AddUser() {
  const [serverError, setServerError] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedRoles, setSelectedRoles] = React.useState([]);
  const [errors, setErrors] = React.useState({});
  const validationRules = {
    displayName: [
      { required: true, message: "Enter a display name" },
      {
        maxLength: 100,
        message: "Max length is 100",
      },
    ],
    username: [
      { required: true, message: "Enter a username name" },
      {
        pattern: "[a-zA-Z0-9]+",
        message: "Username can only contain letters and numbers",
      },
      {
        maxLength: 100,
        message: "Max length is 100",
      },
    ],
    email: [
      { required: true, message: "Enter an email address" },
      { email: true, message: "Email address is invalid" },
      {
        maxLength: 255,
        message: "Max length is 255",
      },
    ],
    password: [
      { required: true, message: "Enter a password" },
      { minLength: 8, message: "Password should be at least 8 characters" },
    ],
  };

  const closeErrorSnackbar = () => {
    setServerError(null);
  };
  const closeSuccessSnackbar = () => {
    setSuccessMessage(null);
  };
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/admin/manage-users", { replace: false });
  };

  const handleRolesChange = (event) => {
    const {
      target: { value },
    } = event;
    event.preventDefault();
    setSelectedRoles(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const validationErrors = validateFormData(data, validationRules);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    setSubmitting(true);
    addUser({
      displayName: data.get("displayName"),
      username: data.get("username"),
      email: data.get("email"),
      password: data.get("password"),
      selectedRoles: selectedRoles,
    }).then(
      () => {
        navigate("/admin/manage-users", {
          replace: false,
          state: { successMessage: "User created." },
        });
      },
      (err) => {
        setServerError(err.response?.data?.message ?? "An error occurred.");
        setSubmitting(false);
      }
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CheckFeatureAccess feature={ProductFeatures.ManageUsers} />
      <AccountAppBar />
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <CustomSnackbar
          message={serverError}
          severity="error"
          open={serverError}
          onClose={closeErrorSnackbar}
        />
        <CustomSnackbar
          message={successMessage}
          severity="success"
          open={successMessage}
          onClose={closeSuccessSnackbar}
        />
        <Box sx={{ mt: 3 }}>
          <Typography component="h2" variant="h5">
            Add user
          </Typography>
        </Box>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="off"
                name="displayName"
                required
                fullWidth
                id="displayName"
                label="Display Name"
                autoFocus
                helperText={errors.displayName}
                error={errors.displayName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                helperText={errors.username}
                error={errors.username}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                type="email"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                helperText={errors.email}
                error={errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                helperText={errors.password}
                error={errors.password}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <UserRoleMultiselect
                handleRolesChange={handleRolesChange}
                selectedRoles={selectedRoles}
                theme={theme}
              />
            </Grid>
          </Grid>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button
                type="button"
                variant="outlined"
                sx={{ mt: 3, mb: 2, mr: 1 }}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={submitting}
              >
                Add user
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
