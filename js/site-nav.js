/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

const NavBar = {
    init : function() {
        $UW.log("NavBar.init");
        const uwNavBar = $UW("nav.top-nav");
        const uwWindow = $UW(window);
        /* CONSIDER: let y = uwWindow$(scrollY); */
        NavBar.topNavHeight = 0;
        NavBar.scrollY = window.scrollY;

        const initNavMenuToggle = function () {
            $UW.log("NavBar.initNavMenuToggle");
            $UW("#navbar-menu-button").on("click", () => {
                uwNavBar.toggleClass("vertical-menu-showing");
            });
        };

        const initWindowScroll = function() {
            $UW.log("NavBar.initWindowScroll");
            const isSlim = slim => (slim > 50);
            const handleWindowScroll = function() {
                let scrollYNow = window.scrollY;
                let scrollYPre = NavBar.scrollY;

                let wasSlim = isSlim(scrollYPre);
                let nowSlim = isSlim(scrollYNow);

                if (wasSlim && !nowSlim) {
                    uwNavBar.removeClass("top-nav-slim");
                } else if (!wasSlim && nowSlim) {
                    uwNavBar.addClass("top-nav-slim");
                }
                NavBar.scrollY = scrollYNow;
            };
            uwWindow.on("scroll", handleWindowScroll).callLastOn();
        };

        const initDynamicNavHeight = function() {
            $UW.log("NavBar.initDynamicNavHeight");
            const updateNavHeight = function() {
                let heightNow = uwNavBar[0].offsetHeight;
                let heightPre = NavBar.topNavHeight;
                if (heightNow > heightPre) {
                    document.documentElement.style.setProperty("--uw-top-nav-height", `${heightNow}px`);
                }
                NavBar.topNavHeight = heightNow;
            };
            uwWindow.on("resize", updateNavHeight);
            uwNavBar.on("transitionend", updateNavHeight).callLastOn();
        };

        initNavMenuToggle();
        initWindowScroll();
        initDynamicNavHeight();
    }
};

// ready => init
UsefulWorks(NavBar.init);
