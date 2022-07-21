/*
Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/

import {
  AppBar,
  Button,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  AccountCircle,
  Logout,
  Settings,
  People,
  Add,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { signOut } from "../../services/api/account/session";
import TinypressLogo from "../global/tinypressLogo";
import AuthContext from "../../contexts/authContext";
import ProductFeatures from "../../enums/productFeatures/productFeatures";
import Box from "@mui/material/Box";
import TinypressIcon from "../global/tinypressIcon";
import { createPageWithDefaults } from "../../services/api/editor/editPage";
import CustomSnackbar from "../global/customSnackbar";

export default function AccountAppBar() {
  const [serverError, setServerError] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [addPageLoading, setAddPageLoading] = React.useState(false);
  const authData = React.useContext(AuthContext);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const closeErrorSnackbar = () => {
    setServerError(null);
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const gotoAddPage = async () => {
    setAddPageLoading(true);
    createPageWithDefaults().then(
      () => {
        navigate("/pages/edit", { replace: false });
        setAddPageLoading(false);
      },
      (err) => {
        setServerError(err.response?.data?.message ?? "An error occurred.");
        setAddPageLoading(false);
      }
    );
  };
  const gotoProfile = () => {
    setAnchorEl(null);
    navigate("/profile", { replace: false });
  };
  const gotoSettings = () => {
    setAnchorEl(null);
    navigate("/admin/site-settings", { replace: false });
  };
  const gotoManageUsers = () => {
    setAnchorEl(null);
    navigate("/admin/manage-users", { replace: false });
  };
  const handleSignOut = async () => {
    setAnchorEl(null);
    try {
      await signOut();
      navigate("/sign-in", { replace: true });
    } catch (e) {
      navigate("/dashboard", { replace: true });
    }
  };
  return (
    <React.Fragment>
      <CssBaseline />
      <CustomSnackbar
        message={serverError}
        severity="error"
        open={serverError}
        onClose={closeErrorSnackbar}
      />
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ flexWrap: "wrap" }}>
          <Typography sx={{ flexGrow: 1, my: 1 }}>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <TinypressLogo height={20} />
            </Box>
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              <TinypressIcon height={20} />
            </Box>
          </Typography>
          <Box component="span">
            <Button
              variant="contained"
              sx={{ my: 1 }}
              startIcon={<Add fontSize="small" />}
              onClick={gotoAddPage}
              disabled={
                !authData.canAccessFeature(ProductFeatures.AddEditContent) ||
                addPageLoading
              }
            >
              New page
            </Button>
            <Button
              variant="outlined"
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
              sx={{ my: 1, mx: 1 }}
            >
              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                }}
              >
                <Box component="span" sx={{ mr: 1 }}>
                  Settings
                </Box>
                <KeyboardArrowDownIcon />
              </Box>
              <Settings sx={{ display: { xs: "block", sm: "none" } }} />
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem onClick={gotoProfile}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                My profile
              </MenuItem>
              <MenuItem
                onClick={gotoSettings}
                disabled={
                  !authData.canAccessFeature(ProductFeatures.ManageSettings)
                }
              >
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Website settings
              </MenuItem>
              <MenuItem
                onClick={gotoManageUsers}
                disabled={
                  !authData.canAccessFeature(ProductFeatures.ManageUsers)
                }
              >
                <ListItemIcon>
                  <People fontSize="small" />
                </ListItemIcon>
                Manage users
              </MenuItem>
              <MenuItem onClick={handleSignOut}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Sign out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}
