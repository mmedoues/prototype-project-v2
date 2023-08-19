function toggleDarkMode(newState) {
    const imageId = "img-invert"; // Replace "img-invert" with the actual ID of the image element

    // Get the image element
    const image = document.getElementById(imageId);

    // Function to apply the invert filter to the image
    function applyInvertFilter() {
        image.style.filter = "invert(1)";
    }

    // Function to remove the invert filter from the image
    function removeInvertFilter() {
        image.style.filter = "none";
    }
    
    // Check if the dark mode is already enabled
    const isDarkModeEnabled = document.querySelector(".darkreader");
    
    // turning on dark mode
    if (newState === "on" && !isDarkModeEnabled) {
        // enable dark mode using the DarkReader API
        DarkReader.enable({ contrast: 150 });
        // set the toggle button to have the sun icon
        document.querySelector("div.dark-mode-toggle").firstElementChild.className = "gg-sun";
        // insert style element to apply some minor adjustments
        // set cookie so that preference will be remembered
        setCookie("darkmode", "on", 9999);

        // Apply invert filter to the image when dark mode is turned on
        applyInvertFilter();
        // set cookie to remember the preference for the image invert
        setCookie("invertimage", "on", 9999);
    }
    // turning off dark mode
    else if (newState === "off" && isDarkModeEnabled) {
        // Disable dark mode using the DarkReader API
        DarkReader.disable();
        // set the toggle button to have the moon icon
        document.querySelector("div.dark-mode-toggle").firstElementChild.className = "gg-moon";
        // set cookie so that preference will be remembered
        setCookie("darkmode", "off", 9999);

        // Remove the invert filter from the image when dark mode is turned off
        removeInvertFilter();
        // set cookie to remember the preference for the image invert
        setCookie("invertimage", "off", 9999);
    }
}

// add an event listener to detect clicking on the dark mode toggle button
document.querySelector("div.dark-mode-toggle").addEventListener("click", function () {
    // if there is an element with the class "darkreader" on the page (DarkReader is enabled)
    if (document.querySelector(".darkreader")) {
        // turn off dark mode
        toggleDarkMode("off");
    }
    else {
        // turn on dark mode
        toggleDarkMode("on");
    }
}, false);

// code from w3schools to set a cookie (https://www.w3schools.com/js/js_cookies.asp)
// parameters: name of the cookie, value to set, number of days until it expires
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// code from w3schools to get the value of a cookie (https://www.w3schools.com/js/js_cookies.asp)
// parameters: name of the cookie
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// when the page loads, toggle dark mode according to the cookie settings
window.addEventListener("load", function () {
    // get the dark mode cookie value
    var darkModeCookie = getCookie("darkmode");
    // if the cookie is set to "on", turn on dark mode
    if (darkModeCookie == "on") {
        // toggle dark mode
        toggleDarkMode("on");
    }
}, false);
