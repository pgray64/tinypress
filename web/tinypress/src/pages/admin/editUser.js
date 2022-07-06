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
import {
  deleteUser,
  getUser,
  updateUser,
} from "../../services/api/admin/manageUsers";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useNavigate, useParams } from "react-router-dom";
import CheckFeatureAccess from "../../partials/account/checkFeatureAccess";
import ProductFeatures from "../../enums/productFeatures/productFeatures";
import TextField from "@mui/material/TextField";
import UserRoleMultiselect from "../../partials/admin/userRoleMultiselect";
import { Delete } from "@mui/icons-material";
import { validateFormData } from "../../helpers/validation/validateFormData";

const theme = createTheme();

export default function EditUser() {
  const [serverError, setServerError] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [profileData, setProfileData] = React.useState(null);
  const [selectedRoles, setSelectedRoles] = React.useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
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
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  const { id } = useParams();

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
  React.useEffect(() => {
    loadUser(parseInt(id));
  }, []);
  const loadUser = (id) => {
    getUser({ id }).then(
      (res) => {
        setProfileData(res.data ?? {});
        setSelectedRoles(res.data?.userRoles ?? []);
        setLoading(false);
      },
      (err) => {
        setServerError(err.response?.data?.message ?? "An error occurred.");
        setLoading(false);
      }
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
    updateUser({
      id: parseInt(id),
      displayName: data.get("displayName"),
      username: data.get("username"),
      email: data.get("email"),
      selectedRoles: selectedRoles,
    }).then(
      () => {
        navigate("/admin/manage-users", {
          replace: false,
          state: { successMessage: "User updated." },
        });
      },
      (err) => {
        setServerError(err.response?.data?.message ?? "An error occurred.");
        setSubmitting(false);
      }
    );
  };
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  const performDelete = () => {
    setSubmitting(true);
    deleteUser({ id: parseInt(id) }).then(
      () => {
        navigate("/admin/manage-users", {
          replace: false,
          state: { successMessage: "User deleted." },
        });
      },
      (err) => {
        setServerError(err.response?.data?.message ?? "An error occurred.");
        setSubmitting(false);
        setDeleteDialogOpen(false);
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
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Delete this user?</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Confirm that you want to delete this user.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button onClick={performDelete} autoFocus>
              Delete user
            </Button>
          </DialogActions>
        </Dialog>
        <Grid container sx={{ mt: 3 }}>
          <Grid item xs={12} sm={9}>
            <Typography component="h2" variant="h5">
              Edit user
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3} sx={{ textAlign: { sm: "right" } }}>
            <Button
              variant="outlined"
              sx={{ mt: { xs: 1, sm: 0 } }}
              startIcon={<Delete fontSize="small" />}
              onClick={handleDeleteClick}
              color="error"
            >
              Delete user
            </Button>
          </Grid>
        </Grid>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="off"
                  name="displayName"
                  required
                  fullWidth
                  id="displayName"
                  label="displayName"
                  autoFocus
                  defaultValue={profileData.displayName}
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
                  defaultValue={profileData.username}
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
                  defaultValue={profileData.email}
                  helperText={errors.email}
                  error={errors.email}
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
                  Save changes
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}
