import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Icon from "@mui/material/Icon";

import MDBox from "@/material/components/MDBox";

import {
  collapseItem,
  collapseIconBox,
  collapseIcon,
  collapseText,
  collapseChildren,
} from "@/material/template/Sidenav/styles/sidenavCollapse";

import {useMaterialUIController} from "@/material/context";
import {useEffect, useState} from "react";
import {Collapse, List} from "@mui/material";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import Link from "next/link";
import MenuUtils from "@/utils/menu";

function SidenavCollapse({
  icon,
  name,
  active: activeProp = false,
  items,
  onNavigate,
  collapseName,
  id,
  onClick,
  ...rest
}) {
  const [controller] = useMaterialUIController();
  const {miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor} = controller;
  const [active, setActive] = useState(activeProp);

  useEffect(() => {
    if ((items && items.filter(child => child.key === collapseName).length > 0) || id === collapseName) onClick(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setActive(activeProp);
  }, [activeProp]);

  const handleClick = () => {
    setActive(!active);
    onClick(id);
  };

  return (
    <>
      <ListItem component="li" onClick={handleClick}>
        <MDBox
          {...rest}
          sx={theme =>
            collapseItem(theme, {
              active,
              transparentSidenav,
              whiteSidenav,
              darkMode,
              sidenavColor,
            })
          }>
          <ListItemIcon sx={theme => collapseIconBox(theme, {transparentSidenav, whiteSidenav, darkMode, active})}>
            {typeof icon === "string" ? <Icon sx={theme => collapseIcon(theme, {active})}>{icon}</Icon> : icon}
          </ListItemIcon>

          <ListItemText
            primary={name}
            sx={theme =>
              collapseText(theme, {
                miniSidenav,
                transparentSidenav,
                whiteSidenav,
                active,
              })
            }
          />
          {items ? (
            <ListItemIcon sx={theme => collapseIconBox(theme, {transparentSidenav, whiteSidenav, darkMode, active})}>
              {active ? <ExpandLess /> : <ExpandMore />}
            </ListItemIcon>
          ) : null}
        </MDBox>
      </ListItem>
      <Collapse in={active} timeout="auto" unmountOnExit>
        <List
          className="__sidenav-children"
          component="div"
          disablePadding
          sx={theme =>
            collapseChildren(theme, {
              transparentSidenav,
              whiteSidenav,
              darkMode,
            })
          }>
          {items &&
            items.map(({icon, name, key, route}) => {
              let subItemActive = key === collapseName;
              if (MenuUtils.hasMenu(key)) {
                return (
                  <Link
                    key={key}
                    href={route}
                    onClick={() => {
                      if (!subItemActive) onNavigate();
                    }}>
                    <ListItem className='__parent-menu' component="li">
                      <MDBox
                        {...rest}
                        sx={theme =>
                          collapseItem(theme, {
                            active: subItemActive,
                            transparentSidenav,
                            whiteSidenav,
                            darkMode,
                            sidenavColor,
                            isChild: true,
                          })
                        }>
                        <ListItemIcon
                          sx={theme =>
                            collapseIconBox(theme, {
                              transparentSidenav,
                              whiteSidenav,
                              darkMode,
                              active: subItemActive,
                            })
                          }>
                          {typeof icon === "string" ? (
                            <Icon sx={theme => collapseIcon(theme, {active: subItemActive})}>{icon}</Icon>
                          ) : (
                            icon
                          )}
                        </ListItemIcon>

                        <ListItemText
                          primary={name}
                          sx={theme =>
                            collapseText(theme, {
                              miniSidenav,
                              transparentSidenav,
                              whiteSidenav,
                              active: subItemActive,
                            })
                          }
                        />
                      </MDBox>
                    </ListItem>
                  </Link>
                );
              } else return null;
            })}
        </List>
      </Collapse>
    </>
  );
}

export default SidenavCollapse;
