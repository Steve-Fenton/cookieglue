const CookieGlue = (function () {
    const debug = false;
    const cookieName = 'cookie-preferences'

    /* Begin Cookie Functions */
    function getCookie(name) {
        const matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function getExpiryDateFromDays(days) {
        var expiry = new Date();
        expiry = new Date(expiry.getTime() + 1000 * 60 * 60 * 24 * days);
        return expiry.toGMTString();
    }

    function setCookie(name, value, options = {}) {
        options = {
            /* Defaults */
            path: '/',
            samesite: 'strict',
            'expires': getExpiryDateFromDays(31),
            /* Overrides */
            ...options
        };

        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

        for (let optionKey in options) {
            let optionValue = options[optionKey];
            
            updatedCookie += "; " + optionKey;
            if (optionValue !== true) {
                updatedCookie += "=" + optionValue;
            }
        }

        document.cookie = updatedCookie;
    }

    function deleteCookie(name) {
        setCookie(name, "", {
            'expires': getExpiryDateFromDays(0)
        })
    }
    /* End Cookie Functions */

    function getPreferences() {
        const cookie = getCookie(cookieName);
        let data = null;

        if (!!cookie) {
            try {
                data = JSON.parse(cookie);
            } catch (err) { if (debug) console.log('cookie-glue', err); }
        }
        return data;
    }

    function preferencesSet() {
        return (!!getPreferences());
    }

    function readCookieGlueElement() {
        const container = document.getElementById('cookie-glue');
        const button = document.getElementById('cookie-glue-store');

        button.onclick = storeCookieGlue;

        if (!container) {
            if (debug) console.log('cookie-glue no container found with id "cookie-glue"');
            return;
        }

        const items = container.querySelectorAll('[data-cookie-type]');

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const cookieType = item.getAttribute('data-cookie-type');

            const input = item.querySelector('input[type=checkbox]');
            if (!!input) {
                switch (cookieType) {
                    case 'on-mandatory':
                        input.setAttribute('checked', 'checked');
                        input.setAttribute('disabled', 'disabled');
                        break;
                    case 'on-optional':
                        if (allowed(input.name, true)) {
                            input.setAttribute('checked', 'checked');
                        }
                        break;
                    case 'off-optional':
                        if (allowed(input.name, false)) {
                            input.setAttribute('checked', 'checked');
                        }
                        break;
                    default:
                        if (debug) console.log('cookie-glue unknown data-cookie-type', cookieType);
                        break;
                }
            } else {
                if (debug) console.log('cookie-glue no input found in element of kind', cookieType);
            }
        }

        /* Automatically show if no prefernces collected */
        if (!preferencesSet()) {
            container.style.display = 'block';
        }
    }

    function storeCookieGlue() {
        const container = document.getElementById('cookie-glue');
        const button = document.getElementById('cookie-glue-store');

        if (!container) {
            console.log('cookie-glue no container found with id "cookie-glue"');
            return;
        }

        if (!button) {
            console.log('cookie-glue no button found with id "cookie-glue-store"');
            return;
        }

        const items = container.querySelectorAll('[data-cookie-type]');
        const preferences = {};

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const cookieType = item.getAttribute('data-cookie-type');


            const input = item.querySelector('input[type=checkbox]');
            if (!!input) {
                preferences[input.name] = input.checked;
            } else {
                console.log('cookie-glue no input found in element of kind', cookieType);
            }
        }

        setCookie(cookieName, JSON.stringify(preferences));

        container.style.display = 'none';

        /* Scroll to Top */
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

        /* Reload the Page to Trigger Consented Scripts */
        location.reload();
    }

    // Public Consent Check
    function allowed(name, defaultSetting) {
        let result = defaultSetting || false;

        const preferences = getPreferences();

        if (!!preferences && preferences[name] != null) {
            result = preferences[name];
        } else {
            if (debug) console.log('cookie-glue no preference set for name.', name);
            result = defaultSetting || false;
        }

        if (debug) console.log('cookie-glue allowed', name, result);
        return result;
    }

    // Public Script Loading Function
    function load(url, callback) {
        var script = document.createElement("script")

        if (script.readyState) {
            //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else {
            //Others
            script.onload = function () {
                callback();
            };
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    /* Window Onload Initialization */
    if (window.addEventListener) {
        window.addEventListener('load', readCookieGlueElement)
    } else {
        window.attachEvent('onload', readCookieGlueElement)
    }

    return {
        can: allowed,
        load: load
    }
})();