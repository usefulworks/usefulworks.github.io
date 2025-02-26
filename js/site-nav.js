/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

const NavBar = {
    init : function() {
        console.log("NavBar.init");
        const initNavMenuToggle = function () {
            console.log("NavBar.initNavMenuToggle");
            const SHOWING_CNAME = "showing";
            const MENU_BTN = document.getElementById("navbar-menu-button");
            const NAV_MENU = document.querySelector("nav.top-nav ul.navbar-links");
            if (MENU_BTN && NAV_MENU) {
                MENU_BTN.addEventListener("click", function(e) {
                    NAV_MENU.classList.toggle(SHOWING_CNAME);
                });
            }

        };
        const initWindowScroll = function() {
            console.log("NavBar.initWindowScroll");
            const TOP_NAV_SLIM_CNAME = "top-nav-slim";
            const NAVBAR = document.querySelector("nav.top-nav");
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
