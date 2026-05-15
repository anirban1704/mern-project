import React from "react";
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';

import './SideDrawer.css';

function SideDrawer(props) {
    const constent = (
        <CSSTransition
            in={props.show}
            timeout={200}
            classNames="slide-in-left"
            mountOnEnter
            unmountOnExit
        >
            <aside
                className="side-drawer" onClick={props.onClick}>{props.children}
            </aside>
        </CSSTransition>
    );

    return ReactDOM.createPortal(constent, document.getElementById('drawer-hook'));
}

export default SideDrawer;