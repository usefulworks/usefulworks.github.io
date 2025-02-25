/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

const NavBar = {
    init : function() {
        const SHOWING_CNAME = "showing";
        const MENU_BTN = document.getElementById("navbar-menu-button");
        const NAV_MENU = document.querySelector("nav.top-nav ul.navbar-links");
        if (MENU_BTN && NAV_MENU) {
            MENU_BTN.addEventListener("click", function(e) {
                NAV_MENU.classList.toggle(SHOWING_CNAME);
            });
        }
        if (window) {
            window.addEventListener("scroll", NavBar.windowScroll);
        }
    },
    windowScroll : function(e) {
        const TOP_NAV_SLIM_CNAME = "top-nav-slim";
        const NAVBAR = document.querySelector("nav.top-nav");
        if (NAVBAR) {
            with(NAVBAR.classList) {
                window.scrollY > 50 ? add(TOP_NAV_SLIM_CNAME) : remove(TOP_NAV_SLIM_CNAME);
            }
       }
    }
};
window.addEventListener("load", NavBar.init);


