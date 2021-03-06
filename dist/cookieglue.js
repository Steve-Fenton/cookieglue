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
var CookieGlue;
(function (CookieGlue) {
    var remberForDays = 31;
    // Toggle button.
    var updateToggleButton = function (e) {
        var checked = e.getAttribute('aria-checked') === 'true';
        var label = e.firstElementChild.childNodes[1];
        var on = label.getAttribute('data-lang-on') || 'on!';
        var off = label.getAttribute('data-lang-off') || 'off!';
        label.textContent = checked ? on : off;
    };
    var handleToggleButton = function (e) {
        var checked = e.getAttribute('aria-checked') === 'true';
        e.setAttribute('aria-checked', !checked);
        updateToggleButton(e);
    };
    var toggleButtons = document.querySelectorAll('[role="switch"]');
    for (var i = 0; i < toggleButtons.length; i++) {
        var toggle = toggleButtons[i];
        toggle.addEventListener('click', function (e) { return handleToggleButton(e.currentTarget); }, false);
    }
    var CookieGlueDistributor = /** @class */ (function () {
        function CookieGlueDistributor() {
        }
        CookieGlueDistributor.pageLoaded = function () {
            CookieGlueDistributor.cookieGlue.pageLoaded();
        };
        CookieGlueDistributor.intentToManage = function () {
            CookieGlueDistributor.cookieGlue.showManager(function (container) { return container.style.display = 'block'; });
        };
        CookieGlueDistributor.intentToAccept = function () {
            CookieGlueDistributor.cookieGlue.showManager(function (container) {
                CookieGlueDistributor.cookieGlue.accept();
                CookieGlueDistributor.cookieGlue.hideContainers();
                CookieGlueDistributor.cookieGlue.reload();
            }, false);
        };
        CookieGlueDistributor.intentToStore = function () {
            CookieGlueDistributor.cookieGlue.store();
            CookieGlueDistributor.cookieGlue.hideContainers();
            CookieGlueDistributor.cookieGlue.reload();
        };
        return CookieGlueDistributor;
    }());
    var CheckboxBinder = /** @class */ (function () {
        function CheckboxBinder() {
        }
        CheckboxBinder.prototype.uiMapToPreference = function (preferences, input, cookieType) {
            preferences[input.name] = input.checked;
        };
        CheckboxBinder.prototype.uiMapFromPreference = function (input, cookieType, cg) {
            switch (cookieType) {
                case 'on-mandatory':
                    input.setAttribute('checked', 'checked');
                    input.setAttribute('disabled', 'disabled');
                    break;
                case 'on-optional':
                    if (cg.can(input.name, true)) {
                        input.setAttribute('checked', 'checked');
                    }
                    break;
                case 'off-optional':
                    if (cg.can(input.name, false)) {
                        input.setAttribute('checked', 'checked');
                    }
                    break;
                default:
                    console.log('cookie-glue unknown data-cookie-type', cookieType);
                    break;
            }
        };
        CheckboxBinder.prototype.uiMapAllOn = function (input) {
            input.setAttribute('checked', 'checked');
        };
        return CheckboxBinder;
    }());
    var ConsentBinder = /** @class */ (function () {
        function ConsentBinder() {
            this.checkboxBinder = new CheckboxBinder();
        }
        ConsentBinder.prototype.UIMapToPreferences = function (container) {
            var items = container.querySelectorAll('[data-cookie-type]');
            var preferences = {};
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var cookieType = item.getAttribute('data-cookie-type');
                var input = item.querySelector('input[type=checkbox]');
                if (this.isInputElement(input)) {
                    this.checkboxBinder.uiMapToPreference(preferences, input, cookieType);
                }
            }
            return preferences;
        };
        ConsentBinder.prototype.UIMapFromPreferences = function (container, cg) {
            var items = container.querySelectorAll('[data-cookie-type]');
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var cookieType = item.getAttribute('data-cookie-type');
                var input = item.querySelector('input[type=checkbox]');
                if (this.isInputElement(input)) {
                    this.checkboxBinder.uiMapFromPreference(input, cookieType, cg);
                }
            }
        };
        ConsentBinder.prototype.UIMapAllOn = function (container) {
            var items = container.querySelectorAll('[data-cookie-type]');
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var input = item.querySelector('input[type=checkbox]');
                if (this.isInputElement(input)) {
                    this.checkboxBinder.uiMapAllOn(input);
                }
            }
        };
        ConsentBinder.prototype.isInputElement = function (element) {
            return (!!element && element.tagName.toUpperCase() === 'INPUT');
        };
        ConsentBinder.prototype.isButtonElement = function (element) {
            return (!!element && element.tagName.toUpperCase() === 'BUTTON');
        };
        return ConsentBinder;
    }());
    var CookieGlueApp = /** @class */ (function () {
        function CookieGlueApp(name) {
            var _this = this;
            if (name === void 0) { name = 'cg'; }
            this.name = name;
            this.storage = new CookieGlueStorage();
            this.modal = false;
            this.checkAndRun();
            this.addEvent(window, 'load', function () {
                _this.bindButtons();
                CookieGlueDistributor.pageLoaded();
            });
        }
        CookieGlueApp.prototype.bindButtons = function () {
            var _this = this;
            var bindClick = function (elem, handler) {
                var newElement = elem.cloneNode(true);
                elem.parentNode.replaceChild(newElement, elem);
                _this.addEvent(newElement, 'click', function (event) {
                    event.preventDefault();
                    handler(_this);
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
        CookieGlueApp.prototype.checkAndRun = function () {
            var _this = this;
            if (!window[this.name] || !window[this.name].data) {
                console.log('Nothing found registered in a global variable with this name', this.name);
                return;
            }
            // This converts the register into an immediate execution as cookie glue is now loaded
            var data = window[this.name].data;
            window[this.name] = {
                push: function (consentClassification, yesFunc, noFunc, defaultPermission) {
                    if (_this.can(consentClassification, defaultPermission)) {
                        yesFunc();
                    }
                    else {
                        noFunc();
                    }
                }
            };
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var item = data_1[_i];
                try {
                    window[this.name].push(item.t, item.yf, item.nf, item.d);
                }
                catch (err) {
                    console.error(err);
                }
            }
        };
        CookieGlueApp.prototype.pageLoaded = function () {
            if (!this.storage.isConsentSet()) {
                this.showNotice();
            }
        };
        CookieGlueApp.prototype.hideContainers = function () {
            if (this.modal) {
                //window.closeModal();
            }
            else {
                this.manageContainer().style.display = 'none';
                this.noticeContainer().style.display = 'none';
            }
        };
        CookieGlueApp.prototype.showNotice = function () {
            var _this = this;
            this.hideContainers();
            var container = this.noticeContainer();
            var source = container.getAttribute('data-cookie-source');
            var opening = function () {
                if (window.openModal) {
                    _this.modal = true;
                    container.style.display = 'block';
                    window.openModal('modal-for-notice', 'modal-for-notice-title', 'outerWrapper', function () { return CookieGlueDistributor.intentToAccept(); });
                }
                else {
                    container.style.display = 'block';
                }
            };
            if (source) {
                var ajax = new Ajax();
                ajax.send(source, function (response) {
                    container.innerHTML = response.responseText;
                    _this.bindButtons();
                    opening();
                }, function () { return console.error('cookie-glue - cannot load notice text'); });
            }
            else {
                opening();
            }
        };
        CookieGlueApp.prototype.showManager = function (callback, display) {
            var _this = this;
            if (display === void 0) { display = true; }
            this.hideContainers();
            var container = this.manageContainer();
            var source = container.getAttribute('data-cookie-source');
            var opening = function () {
                _this.bindPreferencesToUI();
                callback(container);
                if (window.openModal) {
                    _this.modal = true;
                    window.openModal('modal-for-manage', 'modal-for-manage-title', 'outerWrapper', function () { return CookieGlueDistributor.intentToStore(); });
                }
            };
            if (!display) {
                opening = function () {
                    _this.bindPreferencesToUI();
                    callback(container);
                };
            }
            if (source) {
                var ajax = new Ajax();
                ajax.send(source, function (response) {
                    container.innerHTML = response.responseText;
                    _this.bindButtons();
                    opening();
                }, function () { return console.error('cookie-glue - cannot load notice text'); });
            }
            else {
                opening();
            }
        };
        CookieGlueApp.prototype.accept = function () {
            var binder = new ConsentBinder();
            binder.UIMapAllOn(this.manageContainer());
            this.store();
        };
        CookieGlueApp.prototype.store = function () {
            var binder = new ConsentBinder();
            var preferences = binder.UIMapToPreferences(this.manageContainer());
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
            var binder = new ConsentBinder();
            binder.UIMapFromPreferences(this.manageContainer(), this);
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
                path: '/', samesite: 'strict', 'expires': this.getExpiryDateFromDays(remberForDays) }, options);
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
            var _this = this;
            var isComplete = false;
            var request = this.getRequestObject();
            request.open('GET', url, true);
            request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            request.setRequestHeader('Accept', 'application/json');
            request.onreadystatechange = function () {
                if (request.readyState == 4 && !isComplete) {
                    isComplete = true;
                    if (_this.isResponseSuccess(request.status)) {
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
    CookieGlueDistributor.cookieGlue = new CookieGlueApp('cg');
})(CookieGlue || (CookieGlue = {}));
