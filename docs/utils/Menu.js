import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Link from 'next/link';

const useStyles = makeStyles()((theme) => ({
  list: {
    width: 250,
  },
  listTitle: {
    fontSize: 25,
  },
}));

const menuItems = [
  { name: 'Home', href: '/' },
  { name: 'Examples', href: '/examples' },
];

function Menu({ isOpen, toggle }) {
  const { classes } = useStyles();
  return (
    <Drawer open={isOpen} onClose={toggle}>
      <div tabIndex={0} role="button" onClick={toggle} onKeyDown={toggle} className={classes.list}>
        <List
          component="nav"
          subheader={
            <ListSubheader className={classes.listTitle} component="h2">
              MUI-Datatables
            </ListSubheader>
          }>
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href} passHref legacyBehavior>
              <ListItem button component="a">
                <ListItemText primary={item.name} />
              </ListItem>
            </Link>
          ))}
        </List>
      </div>
    </Drawer>
  );
}

Menu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

export default Menu;
