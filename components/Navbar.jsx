import { AppBar, Box, Button, TextField } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsIcon from '@mui/icons-material/Settings';
import ShareIcon from '@mui/icons-material/Share';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from "@mui/material/IconButton";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {

  const [anchorEl, setAnchorEl] = useState(null);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRoleMenuClick = event => {
    setRoleMenuOpen(prev => !prev)
  }

  return (
    <Box sx={ { flexGrow: 1 } }>
      <AppBar position="static"
              elevation={ 0 }
              sx={ { backgroundColor: 'transparent', color: 'secondary.main' } }>
        <Toolbar sx={ { justifyContent: 'flex-end' } }>
          <TextField
            type="text"
            id="name"
            label="Rechercher"
            name="name"
            variant="outlined"
            size="small"
            sx={ { mr: 2 } }
          />
          <Button color="inherit"
                  sx={ { '&:hover': { background: 'transparent' } } }
                  onClick={ handleRoleMenuClick }>
            Souscripteur
            <KeyboardArrowDownIcon sx={ {
              transform : roleMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 250ms ease-in-out'
            } }/>
          </Button>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={ handleClick }
            color="inherit"
          >
            <AccountCircleIcon/>
          </IconButton>
          <Menu
            id="user-menu"
            anchorEl={ anchorEl }
            open={ open }
            onClose={ handleClose }
            MenuListProps={ {
              'aria-labelledby': 'basic-button',
            } }
          >
            <MenuItem onClick={ handleClose }>
              <SettingsIcon sx={ { pr: 1 } }/>
              Profile
            </MenuItem>
            <MenuItem onClick={ handleClose }>
              <ShareIcon sx={ { pr: 1 } }/>
              Share the app
            </MenuItem>
            <MenuItem onClick={ handleClose }>
              <SupportAgentIcon sx={ { pr: 1 } }/>
              Contact Support
            </MenuItem>
            <MenuItem onClick={ handleClose }>
              <LogoutIcon sx={ { pr: 1 } }/>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;