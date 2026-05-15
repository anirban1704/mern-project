import React, { useState } from "react";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

import './MainNavigation.css';
import SideDrawer from "./SideDrawer";
import MainHeader from "./MainHeader";
import NavLinks from "./NavLinks";
import Backdrop from '../UIElement/Backdrop';

function MainNavigation(props) {
    const [drawerIsOpen, setDrawerIsOpen] = useState(false);

    return (
        <React.Fragment>
            {drawerIsOpen && <Backdrop onClick={() => setDrawerIsOpen(false)} />}
            <SideDrawer show={drawerIsOpen} onClick={() => setDrawerIsOpen(false)}>
                <nav className="main-navigation__drawer-nav">
                    <NavLinks />
                </nav>
            </SideDrawer>
            <MainHeader>
                <button className="main-navigation__menu-btn" onClick={() => setDrawerIsOpen(true)}>
                    <span />
                    <span />
                    <span />
                </button>
                <h1 className="main-navigation__title">
                    <Link to="/">YourPlaces</Link>
                </h1>
                <nav className="main-navigation__header-nav">
                    <NavLinks />
                </nav>
            </MainHeader>
        </React.Fragment>
    )
}

export default MainNavigation;