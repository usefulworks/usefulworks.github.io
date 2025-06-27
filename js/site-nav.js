/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

const NavBar = {
    init : function() {
        $UW.log("NavBar.init");
        const uwNavBar = $UW("nav.top-nav");
        const uwWindow = $UW(window);
        const menuToggleClass = "vertical-menu-showing";

        NavBar.scrollY = window.scrollY;

        const initNavMenuToggle = function () {
            $UW.log("NavBar.initNavMenuToggle");
            $UW("#navbar-menu-button").on("click", () => {
                uwNavBar.toggleClass(menuToggleClass);
            });
        };

        const initNavMenuCurrentPage = function() {
            $UW.log("NavBar.initNavMenuCurrentPage");
            /* regex reminder
             *   ^(?:\/(?:index\.html)?|index\.html)$ matches complete root cases
             *   (/, /index.html, index.html) and replaces with empty string
             *   |^\/ matches leading slash in other cases and removes it
             *   /g global match needed for this to work
             */
            const normalise = s => s.replace(/^(?:\/(?:index\.html)?|index\.html)$|^\//g, "");
            const loc = normalise(window.location.pathname);
            const links = document.querySelectorAll("nav.top-nav li.navbar-link a[href]");
            links.forEach(function (link) {
                const href = normalise(link.getAttribute("href"));
                if (href === loc) {
                    $UW.log(`NavBar.setCurrentPage: got one '${loc}' ~> '${href}'`);
                    link.classList.add("current");
                }
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
            const resizer = new ResizeObserver(entries => {
                entries.forEach(entry => {
                    if (entry.target === uwNavBar[0]) {
                        let heightNow = uwNavBar[0].offsetHeight;
                        document.documentElement.style.setProperty("--uw-top-nav-height", `${heightNow}px`);
                    }
                });
            });
            resizer.observe(uwNavBar[0], { box: "border-box" });
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
        initNavMenuCurrentPage();
        initMatchMedia();
        initWindowScroll();
        initDynamicNavHeight();
    }
};

// ready => init
UsefulWorks(NavBar.init);
