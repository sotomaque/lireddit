import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import NextLink from 'next/link'

import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }),
);

export const NavBar = ({}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogOff = () => {
    setAnchorEl(null);
    logout();
  };

  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  const loading = fetching || logoutFetching;
  
  
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 50,
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            eReddit
          </Typography>
          {data?.me ? (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar>{data.me.username[0]}</Avatar>
              </IconButton>
              
              <NextLink href="/create-post">
                <Button color="inherit">
                  Create Post
                </Button>
              </NextLink>
          
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={handleLogOff}>Log Off</MenuItem>
              </Menu>
            </div>
          ) : (
            <>    
              <NextLink href="/login">
                <Button color='inherit'>Login</Button>
              </NextLink>
              <NextLink href='/register'>
                <Button color="inherit">Register</Button>
              </NextLink>
            </>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}