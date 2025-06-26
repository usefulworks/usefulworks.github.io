/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

const NavBar = {
    init : function() {
        $UW.log("NavBar.init");
        const uwNavBar = $UW("nav.top-nav");
        const uwWindow = $UW(window);
        const menuToggleClass = "vertical-menu-showing";

        NavBar.topNavHeight = 0;
        NavBar.scrollY = window.scrollY;

        const initNavMenuToggle = function () {
            $UW.log("NavBar.initNavMenuToggle");
            $UW("#navbar-menu-button").on("click", () => {
                uwNavBar.toggleClass(menuToggleClass);
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
                    uwNavBar.removeClass(menuToggleClass);
                } else if (!wasSlim && nowSlim) {
                    uwNavBar.addClass("top-nav-slim");
                }
                NavBar.scrollY = scrollYNow;
                document.documentElement.setAttribute("data-scrollY", `${scrollYNow}px`);
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
                document.documentElement.setAttribute("data-topNavHeight", `${heightNow}px`);
            };
            uwWindow.on("resize", updateNavHeight);
            uwNavBar.on("transitionend", updateNavHeight).callLastOn();
        };

        const initMatchMedia = function() {
            $UW.log("NavBar.initMatchMedia");
            const handleMediaChange = function(eventOrMedia) {
                if (!eventOrMedia.matches) {
                    // screen is wider than 800px
                    uwNavBar.removeClass(menuToggleClass);
                }
            };
            const mediaQuery = window.matchMedia("(max-width: 800px)"); // needs to match the CSS media query
            mediaQuery.addEventListener("change", handleMediaChange);
            handleMediaChange(mediaQuery);
        };

        initNavMenuToggle();
        initMatchMedia();
        initWindowScroll();
        initDynamicNavHeight();
    }
};

// ready => init
UsefulWorks(NavBar.init);
