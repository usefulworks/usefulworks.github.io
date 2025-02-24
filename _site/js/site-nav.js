/*
 * Copyright (c) 2025 UsefulWorks Ltd. All Rights Reserved.
 */

document.readyState =="loading" ? window.addEventListener("load", setupNav) : setupNav();

function setupNav() {
    const MENU_BTN = document.getElementById("navbar-menu-button");
    const NAV_MENU = document.querySelector("nav.top-nav ul.navbar-links");
    if (MENU_BTN && NAV_MENU) {
        MENU_BTN.addEventListener("click", function(e) {
            NAV_MENU.classList.toggle("shown");
        });
    }
}
