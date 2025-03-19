/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

const NavBar = {
    init : function() {
        console.log("NavBar.init");
        const NAVBAR = $UW("nav.top-nav");
        const initNavMenuToggle = function () {
            console.log("NavBar.initNavMenuToggle");
            const SHOWING_CNAME = "vertical-menu-showing";
            const MENU_BTN = $UW("#navbar-menu-button");
            if (MENU_BTN && NAVBAR) {
                MENU_BTN.on("click", function(e) {
                    NAVBAR.toggleClass(SHOWING_CNAME);
                });
            }

        };
        const initWindowScroll = function() {
            console.log("NavBar.initWindowScroll");
            const TOP_NAV_SLIM_CNAME = "top-nav-slim";
            const HANDLER = function() {
                if (NAVBAR) {
                    window.scrollY > 50 ? NAVBAR.addClass(TOP_NAV_SLIM_CNAME) : NAVBAR.removeClass(TOP_NAV_SLIM_CNAME);
                }
            };
            $UW(window).on("scroll", HANDLER) && HANDLER.call();
        }
        initNavMenuToggle();
        initWindowScroll();
    }
};

// ready => init
UsefulWorks(NavBar.init);
