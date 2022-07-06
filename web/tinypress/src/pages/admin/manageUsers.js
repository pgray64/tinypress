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
import { listUsers } from "../../services/api/admin/manageUsers";
import {
  Button,
  CircularProgress,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import CheckFeatureAccess from "../../partials/account/checkFeatureAccess";
import ProductFeatures from "../../enums/productFeatures/productFeatures";
import UserRoleChips from "../../partials/admin/userRoleChips";
import { Add } from "@mui/icons-material";
import Link from "@mui/material/Link";

const theme = createTheme();

export default function ManageUsers() {
  const [serverError, setServerError] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [userList, setUserList] = React.useState([]);
  const [uiPage, setUiPage] = React.useState(1); // ui page is 1-index, backend is 0-indexed
  const [pageCount, setPageCount] = React.useState(0);
  const closeErrorSnackbar = () => {
    setServerError(null);
  };
  const closeSuccessSnackbar = () => {
    setSuccessMessage(null);
  };
  const navigate = useNavigate();
  const location = useLocation();

  const handlePageChange = (event, value) => {
    setUiPage(value);
    loadUsers(value - 1);
  };

  React.useEffect(() => {
    loadUsers(0);
  }, []);
  const loadUsers = (page) => {
    listUsers({ page }).then(
      (res) => {
        setUserList(res.data?.userList ?? []);
        setPageCount(res.data?.pageCount ?? 0);
        setLoading(false);
        if (location.state?.successMessage) {
          setSuccessMessage(location.state?.successMessage);
          window.history.replaceState({}, document.title);
        }
      },
      (err) => {
        setServerError(err.response?.data?.message ?? "An error occurred.");
        setLoading(false);
      }
    );
  };

  const gotoAddUser = () => {
    navigate("/admin/manage-users/add", { replace: false });
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
        <Grid container sx={{ mt: 3 }}>
          <Grid item xs={12} sm={9}>
            <Typography component="h2" variant="h5">
              Manage users
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3} sx={{ textAlign: { sm: "right" } }}>
            <Button
              variant="contained"
              sx={{ mt: { xs: 1, sm: 0 } }}
              startIcon={<Add fontSize="small" />}
              onClick={gotoAddUser}
            >
              Add user
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
          <React.Fragment>
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Display name</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userList.map((user) => (
                    <TableRow
                      key={user.id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>{user.displayName}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <UserRoleChips roles={user.userRoles} />
                      </TableCell>
                      <TableCell>
                        <Link
                          to={"/admin/manage-users/edit/" + user.id}
                          component={RouterLink}
                          variant="body2"
                        >
                          Edit
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Pagination
              sx={{ my: 2 }}
              count={pageCount}
              page={uiPage}
              onChange={handlePageChange}
            />
          </React.Fragment>
        )}
      </Container>
    </ThemeProvider>
  );
}
