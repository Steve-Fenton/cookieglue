var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var CookieGlueDistributor = /** @class */ (function () {
    function CookieGlueDistributor() {
    }
    CookieGlueDistributor.pageLoaded = function (cookieGlueHtml) {
        cookieGlueHtml.pageLoaded();
    };
    CookieGlueDistributor.intentToManage = function (cookieGlueHtml) {
        cookieGlueHtml.showManager();
    };
    CookieGlueDistributor.intentToAccept = function (cookieGlueHtml) {
        cookieGlueHtml.accept();
        cookieGlueHtml.hideContainers();
        cookieGlueHtml.reload();
    };
    CookieGlueDistributor.intentToStore = function (cookieGlueHtml) {
        cookieGlueHtml.store();
        cookieGlueHtml.hideContainers();
        cookieGlueHtml.reload();
    };
    return CookieGlueDistributor;
}());
var CookieGlueApp = /** @class */ (function () {
    function CookieGlueApp() {
        var _this_1 = this;
        this.storage = new CookieGlueStorage();
        this.addEvent(window, 'load', function () {
            _this_1.bindButtons();
            CookieGlueDistributor.pageLoaded(_this_1);
        });
    }
    CookieGlueApp.prototype.bindButtons = function () {
        var _this_1 = this;
        var _this = this;
        var bindClick = function (elem, handler) {
            var newElement = elem.cloneNode(true);
            elem.parentNode.replaceChild(newElement, elem);
            _this_1.addEvent(newElement, 'click', function (event) {
                event.preventDefault();
                handler(_this_1);
                return false;
            });
        };
        for (var _i = 0, _a = this.manageButtons(); _i < _a.length; _i++) {
            var button = _a[_i];
            bindClick(button, CookieGlueDistributor.intentToManage);
        }
        for (var _b = 0, _c = this.acceptButtons(); _b < _c.length; _b++) {
            var button = _c[_b];
            bindClick(button, CookieGlueDistributor.intentToAccept);
        }
        for (var _d = 0, _e = this.storeButtons(); _d < _e.length; _d++) {
            var button = _e[_d];
            bindClick(button, CookieGlueDistributor.intentToStore);
        }
    };
    CookieGlueApp.prototype.can = function (purpose, defaultSetting) {
        var result = defaultSetting || false;
        var preferences = this.storage.getConsent();
        if (!!preferences && preferences[purpose] != null) {
            result = preferences[purpose];
        }
        else {
            console.log('cookie-glue no preference set for name.', purpose);
            result = defaultSetting || false;
        }
        return result;
    };
    CookieGlueApp.prototype.pageLoaded = function () {
        if (!this.storage.isConsentSet()) {
            this.showNotice();
        }
    };
    CookieGlueApp.prototype.hideContainers = function () {
        this.manageContainer().style.display = 'none';
        this.noticeContainer().style.display = 'none';
    };
    CookieGlueApp.prototype.showNotice = function () {
        var _this_1 = this;
        this.manageContainer().style.display = 'none';
        var container = this.noticeContainer();
        var source = container.getAttribute('data-cookie-source');
        if (source) {
            var ajax = new Ajax();
            ajax.send(source, function (response) {
                container.innerHTML = response.responseText;
                _this_1.bindButtons();
                container.style.display = 'block';
            }, function () { return console.error('cookie-glue - cannot load notice text'); });
        }
        else {
            container.style.display = 'block';
        }
    };
    CookieGlueApp.prototype.showManager = function () {
        var _this_1 = this;
        this.noticeContainer().style.display = 'none';
        var container = this.manageContainer();
        var source = container.getAttribute('data-cookie-source');
        if (source) {
            var ajax = new Ajax();
            ajax.send(source, function (response) {
                container.innerHTML = response.responseText;
                _this_1.bindButtons();
                _this_1.bindPreferencesToUI();
                container.style.display = 'block';
            }, function () { return console.error('cookie-glue - cannot load notice text'); });
        }
        else {
            this.bindPreferencesToUI();
            container.style.display = 'block';
        }
    };
    CookieGlueApp.prototype.accept = function () {
        var container = this.manageContainer();
        var items = container.querySelectorAll('[data-cookie-type]');
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var input = item.querySelector('input[type=checkbox]');
            if (!!input) {
                input.setAttribute('checked', 'checked');
            }
        }
        this.store();
    };
    CookieGlueApp.prototype.store = function () {
        var container = this.manageContainer();
        var items = container.querySelectorAll('[data-cookie-type]');
        var preferences = {};
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var cookieType = item.getAttribute('data-cookie-type');
            var input = item.querySelector('input[type=checkbox]');
            if (!this.isInputElement(input)) {
                continue;
            }
            if (!!input) {
                preferences[input.name] = input.checked;
            }
            else {
                console.log('cookie-glue - no input found in element of kind', cookieType);
            }
        }
        this.storage.store(JSON.stringify(preferences));
    };
    CookieGlueApp.prototype.reload = function () {
        /* Scroll to Top */
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        /* Reload the Page to Trigger Consented Scripts */
        location.reload();
    };
    CookieGlueApp.prototype.bindPreferencesToUI = function () {
        var manageContainer = this.manageContainer();
        var items = manageContainer.querySelectorAll('[data-cookie-type]');
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var cookieType = item.getAttribute('data-cookie-type');
            var input = item.querySelector('input[type=checkbox]');
            if (!this.isInputElement(input)) {
                continue;
            }
            if (!!input) {
                switch (cookieType) {
                    case 'on-mandatory':
                        input.setAttribute('checked', 'checked');
                        input.setAttribute('disabled', 'disabled');
                        break;
                    case 'on-optional':
                        if (this.can(input.name, true)) {
                            input.setAttribute('checked', 'checked');
                        }
                        break;
                    case 'off-optional':
                        if (this.can(input.name, false)) {
                            input.setAttribute('checked', 'checked');
                        }
                        break;
                    default:
                        console.log('cookie-glue unknown data-cookie-type', cookieType);
                        break;
                }
            }
            else {
                console.log('cookie-glue no input found in element of kind', cookieType);
            }
        }
    };
    CookieGlueApp.prototype.addEvent = function (element, event, callback) {
        if (element.addEventListener) {
            element.addEventListener(event, callback);
        }
        else {
            element.attachEvent('on' + event, callback);
        }
    };
    CookieGlueApp.prototype.noticeContainer = function () {
        return this.getContainer('cg-notice');
    };
    CookieGlueApp.prototype.manageContainer = function () {
        return this.getContainer('cg-manage');
    };
    CookieGlueApp.prototype.manageButtons = function () {
        return this.getClickTargets('cg-manage-opener');
    };
    CookieGlueApp.prototype.acceptButtons = function () {
        return this.getClickTargets('cg-accept');
    };
    CookieGlueApp.prototype.storeButtons = function () {
        return this.getClickTargets('cg-store');
    };
    CookieGlueApp.prototype.isInputElement = function (element) {
        return (element.tagName.toUpperCase() === 'INPUT');
    };
    CookieGlueApp.prototype.getContainer = function (id) {
        var container = document.getElementById(id);
        if (!container) {
            throw new Error('cookie-glue - missing element: ' + id);
        }
        return container;
    };
    CookieGlueApp.prototype.getClickTargets = function (className) {
        var buttons = document.getElementsByClassName(className);
        var buttonArray = [];
        for (var i = 0; i < buttons.length; i++) {
            buttonArray.push(buttons[i]);
        }
        return buttonArray;
    };
    return CookieGlueApp;
}());
var CookieGlueStorage = /** @class */ (function () {
    function CookieGlueStorage() {
        this.cookieName = 'cookie-preferences';
    }
    CookieGlueStorage.prototype.getConsent = function () {
        var cookie = this.retrieve();
        var data = null;
        if (!!cookie) {
            try {
                data = JSON.parse(cookie);
            }
            catch (err) {
                console.error('cookie-glue', err);
            }
        }
        return data;
    };
    CookieGlueStorage.prototype.isConsentSet = function () {
        return (!!this.getConsent());
    };
    CookieGlueStorage.prototype.store = function (value, options) {
        if (options === void 0) { options = {}; }
        options = __assign({ 
            /* Defaults */
            path: '/', samesite: 'strict', 'expires': this.getExpiryDateFromDays(31) }, options);
        var updatedCookie = encodeURIComponent(this.cookieName) + "=" + encodeURIComponent(value);
        for (var optionKey in options) {
            var optionValue = options[optionKey];
            updatedCookie += "; " + optionKey;
            if (optionValue !== true) {
                updatedCookie += "=" + optionValue;
            }
        }
        document.cookie = updatedCookie;
    };
    CookieGlueStorage.prototype.retrieve = function () {
        var matches = document.cookie.match(new RegExp("(?:^|; )" + this.cookieName.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };
    CookieGlueStorage.prototype.delete = function () {
        this.store('', { 'expires': this.getExpiryDateFromDays(0) });
    };
    CookieGlueStorage.prototype.getExpiryDateFromDays = function (days) {
        var expiry = new Date();
        expiry = new Date(expiry.getTime() + 1000 * 60 * 60 * 24 * days);
        return expiry.toUTCString();
    };
    return CookieGlueStorage;
}());
var Ajax = /** @class */ (function () {
    function Ajax() {
    }
    Ajax.prototype.send = function (url, successCallback, failureCallback) {
        var _this_1 = this;
        var isComplete = false;
        var request = this.getRequestObject();
        request.open('GET', url, true);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.setRequestHeader('Accept', 'application/json');
        request.onreadystatechange = function () {
            if (request.readyState == 4 && !isComplete) {
                isComplete = true;
                if (_this_1.isResponseSuccess(request.status)) {
                    successCallback.call(request, request);
                }
                else {
                    failureCallback.call(request, request);
                }
            }
        };
        request.send();
    };
    Ajax.prototype.getRequestObject = function () {
        var requestObject;
        if (XMLHttpRequest) {
            requestObject = new XMLHttpRequest();
        }
        else {
            try {
                requestObject = new ActiveXObject('Msxml2.XMLHTTP');
            }
            catch (e) {
                try {
                    requestObject = new ActiveXObject('Microsoft.XMLHTTP');
                }
                catch (e) { }
            }
        }
        return requestObject;
    };
    Ajax.prototype.isResponseSuccess = function (responseCode) {
        var firstDigit = responseCode.toString().substring(0, 1);
        switch (firstDigit) {
            case '4':
            case '5':
                // Response code is is 400 or 500 range :(
                return false;
            default:
                // Response code is in 100, 200 or 300 range :)
                return true;
        }
    };
    return Ajax;
}());
var CookieGlue = new CookieGlueApp();
