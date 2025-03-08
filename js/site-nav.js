/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

const NavBar = {
    init : function() {
        console.log("NavBar.init");
        const NAVBAR = document.querySelector("nav.top-nav");
        const initNavMenuToggle = function () {
            console.log("NavBar.initNavMenuToggle");
            const SHOWING_CNAME = "vertical-menu-showing";
            const MENU_BTN = document.getElementById("navbar-menu-button");
            if (MENU_BTN && NAVBAR) {
                MENU_BTN.addEventListener("click", function(e) {
                    NAVBAR.classList.toggle(SHOWING_CNAME);
                });
            }

        };
        const initWindowScroll = function() {
            console.log("NavBar.initWindowScroll");
            const TOP_NAV_SLIM_CNAME = "top-nav-slim";
            const HANDLER = function() {
                if (NAVBAR) {
                    with(NAVBAR.classList) {
                        window.scrollY > 50 ? add(TOP_NAV_SLIM_CNAME) : remove(TOP_NAV_SLIM_CNAME);
                    }
            }
            };
            window.addEventListener("scroll", HANDLER) && HANDLER.call();
        }
        initNavMenuToggle();
        initWindowScroll();
    }
};
window.addEventListener("load", NavBar.init);
