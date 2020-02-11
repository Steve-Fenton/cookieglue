interface Window {
    openModal: (modalId: string, focusOnOpen: string, focusOnClose: string, closeCallback: Function) => void | null;
    closeModal: Function | null;
}

namespace CookieGlue {
    // Toggle button.
    const updateToggleButton = (e) => {
        const checked = e.getAttribute('aria-checked') === 'true';

        let label = e.firstElementChild.childNodes[1];
        const on = label.getAttribute('data-lang-on') || 'on!';
        const off = label.getAttribute('data-lang-off') || 'off!';

        label.textContent = checked ? on : off;
    };

    const handleToggleButton = (e) => {
        const checked = e.getAttribute('aria-checked') === 'true';
        e.setAttribute('aria-checked', !checked);
        updateToggleButton(e);
    };

    const toggleButtons = document.querySelectorAll('[role="switch"]');
    for (let i = 0; i < toggleButtons.length; i++) {
        const toggle = toggleButtons[i];
        toggle.addEventListener('click', (e) => handleToggleButton(e.currentTarget), false);
    }

    class CookieGlueDistributor {
        public static cookieGlue: CookieGlueApp;

        static pageLoaded() {
            CookieGlueDistributor.cookieGlue.pageLoaded();
        }

        static intentToManage() {
            CookieGlueDistributor.cookieGlue.showManager((container: HTMLElement) => container.style.display = 'block');
        }

        static intentToAccept() {
            CookieGlueDistributor.cookieGlue.showManager((container) => {
                CookieGlueDistributor.cookieGlue.accept();
                CookieGlueDistributor.cookieGlue.hideContainers();
                CookieGlueDistributor.cookieGlue.reload();
            }, false);
        }

        static intentToStore() {
            CookieGlueDistributor.cookieGlue.store();
            CookieGlueDistributor.cookieGlue.hideContainers();
            CookieGlueDistributor.cookieGlue.reload();
        }
    }

    interface ConsentPreferences {
        [key: string]: boolean;
    }

    class CheckboxBinder {
        uiMapToPreference(preferences: ConsentPreferences, input: HTMLInputElement, cookieType: string) {
            preferences[input.name] = input.checked;
        }

        uiMapFromPreference(input: HTMLInputElement, cookieType: string, cg: CookieGlueApp) {
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
        }

        uiMapAllOn(input: HTMLInputElement) {
            input.setAttribute('checked', 'checked');
        }
    }

    class ToggleSwitchBinder {
        uiMapToPreference(preferences: ConsentPreferences, input: HTMLButtonElement, cookieType: string) {
            preferences[input.name] = input.getAttribute('aria-checked') === 'true';
        }

        uiMapFromPreference(input: HTMLButtonElement, cookieType: string, cg: CookieGlueApp) {
            switch (cookieType) {
                case 'on-mandatory':
                    input.setAttribute('aria-checked', 'true');
                    updateToggleButton(input);
                    input.setAttribute('disabled', 'disabled');
                    break;
                case 'on-optional':
                    if (cg.can(input.name, true)) {
                        input.setAttribute('aria-checked', 'true');
                    } else {
                        input.setAttribute('aria-checked', 'false');
                    }
                    updateToggleButton(input);
                    break;
                case 'off-optional':
                    if (cg.can(input.name, false)) {
                        input.setAttribute('aria-checked', 'true');
                    } else {
                        input.setAttribute('aria-checked', 'false');
                    }
                    updateToggleButton(input);
                    break;
                default:
                    console.log('cookie-glue unknown data-cookie-type', cookieType);
                    break;
            }


        }

        uiMapAllOn(input: HTMLButtonElement) {
            input.setAttribute('aria-checked', 'true');
        }
    }

    class ConsentBinder {
        private checkboxBinder = new CheckboxBinder();
        private ariaSliderBinder = new ToggleSwitchBinder();

        public UIMapToPreferences(container: HTMLElement): ConsentPreferences {
            const items = container.querySelectorAll('[data-cookie-type]');
            const preferences: ConsentPreferences = {};

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const cookieType = item.getAttribute('data-cookie-type');

                const input = item.querySelector('input[type=checkbox]');

                if (this.isInputElement(input)) {
                    this.checkboxBinder.uiMapToPreference(preferences, input, cookieType);
                    continue;
                }

                const button = item.querySelector('button[aria-checked]');

                if (this.isButtonElement(button)) {
                    this.ariaSliderBinder.uiMapToPreference(preferences, button, cookieType);
                    continue;
                }
            }

            return preferences;
        }

        public UIMapFromPreferences(container: HTMLElement, cg: CookieGlueApp) {
            const items = container.querySelectorAll('[data-cookie-type]');

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const cookieType = item.getAttribute('data-cookie-type');
                const input = item.querySelector('input[type=checkbox]');

                if (this.isInputElement(input)) {
                    this.checkboxBinder.uiMapFromPreference(input, cookieType, cg);
                    continue;
                }

                const button = item.querySelector('button[aria-checked]');

                if (this.isButtonElement(button)) {
                    this.ariaSliderBinder.uiMapFromPreference(button, cookieType, cg);
                    continue;
                }
            }
        }

        public UIMapAllOn(container: HTMLElement) {
            const items = container.querySelectorAll('[data-cookie-type]');

            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                const input = item.querySelector('input[type=checkbox]');

                if (this.isInputElement(input)) {
                    this.checkboxBinder.uiMapAllOn(input);
                    continue;
                }

                const button = item.querySelector('button[aria-checked]');

                if (this.isButtonElement(button)) {
                    this.ariaSliderBinder.uiMapAllOn(button);
                    continue;
                }
            }
        }

        private isInputElement(element: Element): element is HTMLInputElement {
            return (!!element && element.tagName.toUpperCase() === 'INPUT');
        }

        private isButtonElement(element: Element): element is HTMLButtonElement {
            return (!!element && element.tagName.toUpperCase() === 'BUTTON');
        }
    }

    class CookieGlueApp {
        private storage = new CookieGlueStorage();
        private modal = false;

        constructor(private name: string = 'cg') {
            this.checkAndRun();
            this.addEvent(window, 'load', () => {
                this.bindButtons();
                CookieGlueDistributor.pageLoaded();
            });
        }

        private bindButtons() {
            const bindClick = (elem: Element, handler: Function) => {
                var newElement = elem.cloneNode(true);
                elem.parentNode.replaceChild(newElement, elem);
                this.addEvent(newElement, 'click', (event) => {
                    event.preventDefault();
                    handler(this);
                    return false;
                });
            };

            for (const button of this.manageButtons()) {
                bindClick(button, CookieGlueDistributor.intentToManage);
            }

            for (const button of this.acceptButtons()) {
                bindClick(button, CookieGlueDistributor.intentToAccept);
            }

            for (const button of this.storeButtons()) {
                bindClick(button, CookieGlueDistributor.intentToStore);
            }
        }

        public can(purpose: string, defaultSetting: boolean) {
            let result = defaultSetting || false;

            const preferences = this.storage.getConsent();

            if (!!preferences && preferences[purpose] != null) {
                result = preferences[purpose];
            } else {
                console.log('cookie-glue no preference set for name.', purpose);
                result = defaultSetting || false;
            }

            return result;
        }

        public checkAndRun() {
            if (!window[this.name] || !window[this.name].data) {
                console.log('Nothing found registered in a global variable with this name', this.name);
                return;
            }

            // This converts the register into an immediate execution as cookie glue is now loaded
            const data = window[this.name].data;
            window[this.name] = {
                push: (t: string, f: Function, d: boolean) => { if (this.can(t, d)) f(); }
            }

            for (const item of data) {
                try {
                    if (this.can(item.type, item.def)) {
                        item.script();
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }

        public pageLoaded() {
            if (!this.storage.isConsentSet()) {
                this.showNotice();
            }
        }

        public hideContainers() {
            if (this.modal) {
                //window.closeModal();
            } else {
                this.manageContainer().style.display = 'none';
                this.noticeContainer().style.display = 'none';
            }
        }

        public showNotice() {
            this.hideContainers();

            const container = this.noticeContainer();
            const source = container.getAttribute('data-cookie-source');

            const opening = () => {
                if (window.openModal) {
                    this.modal = true;
                    container.style.display = 'block';
                    window.openModal('modal-for-notice', 'modal-for-notice-title', 'outerWrapper', () => CookieGlueDistributor.intentToAccept());
                } else {
                    container.style.display = 'block';
                }
            }

            if (source) {
                var ajax = new Ajax();
                ajax.send(source, (response) => {
                    container.innerHTML = response.responseText;
                    this.bindButtons();
                    opening();

                }, () => console.error('cookie-glue - cannot load notice text'));
            } else {
                opening();
            }
        }

        public showManager(callback: (container: HTMLElement) => void, display = true) {
            this.hideContainers();

            const container = this.manageContainer();
            const source = container.getAttribute('data-cookie-source');

            let opening = () => {
                this.bindPreferencesToUI();
                callback(container);

                if (window.openModal) {
                    this.modal = true;
                    window.openModal('modal-for-manage', 'modal-for-manage-title', 'outerWrapper', () => CookieGlueDistributor.intentToStore());
                }
            }

            if (!display) {
                opening = () => {
                    this.bindPreferencesToUI();
                    callback(container);
                }
            }

            if (source) {
                var ajax = new Ajax();
                ajax.send(source, (response) => {
                    container.innerHTML = response.responseText;
                    this.bindButtons();
                    opening();
                }, () => console.error('cookie-glue - cannot load notice text'));
            } else {
                opening();
            }
        }

        accept() {
            const binder = new ConsentBinder();
            binder.UIMapAllOn(this.manageContainer());
            this.store();
        }

        store() {
            const binder = new ConsentBinder();
            const preferences = binder.UIMapToPreferences(this.manageContainer());
            this.storage.store(JSON.stringify(preferences));
        }

        reload() {
            /* Scroll to Top */
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;

            /* Reload the Page to Trigger Consented Scripts */
            location.reload();
        }

        protected bindPreferencesToUI() {
            const binder = new ConsentBinder();
            binder.UIMapFromPreferences(this.manageContainer(), this);
        }

        protected addEvent(element: HTMLElement | Element | Node | Window, event: string, callback: EventListenerOrEventListenerObject) {
            if (element.addEventListener) {
                element.addEventListener(event, callback);
            } else {
                (<any>element).attachEvent('on' + event, callback);
            }
        }

        protected noticeContainer() {
            return this.getContainer('cg-notice');
        }

        protected manageContainer() {
            return this.getContainer('cg-manage');
        }

        protected manageButtons() {
            return this.getClickTargets('cg-manage-opener');
        }

        protected acceptButtons() {
            return this.getClickTargets('cg-accept');
        }

        protected storeButtons() {
            return this.getClickTargets('cg-store');
        }

        private getContainer(id: string) {
            const container = document.getElementById(id);

            if (!container) {
                throw new Error('cookie-glue - missing element: ' + id);
            }

            return container;
        }

        private getClickTargets(className: string): Element[] {
            const buttons = document.getElementsByClassName(className);
            const buttonArray: Element[] = [];

            for (let i = 0; i < buttons.length; i++) {
                buttonArray.push(buttons[i]);
            }

            return buttonArray;
        }
    }

    class CookieGlueStorage {
        private cookieName = 'cookie-preferences';

        getConsent() {
            const cookie = this.retrieve();
            let data = null;

            if (!!cookie) {
                try {
                    data = JSON.parse(cookie);
                } catch (err) { console.error('cookie-glue', err); }
            }

            return data;
        }

        isConsentSet() {
            return (!!this.getConsent());
        }

        store(value: string, options = {}) {
            options = {
                /* Defaults */
                path: '/',
                samesite: 'strict',
                'expires': this.getExpiryDateFromDays(31),
                /* Overrides */
                ...options
            };

            let updatedCookie = encodeURIComponent(this.cookieName) + "=" + encodeURIComponent(value);

            for (let optionKey in options) {
                let optionValue = options[optionKey];

                updatedCookie += "; " + optionKey;
                if (optionValue !== true) {
                    updatedCookie += "=" + optionValue;
                }
            }

            document.cookie = updatedCookie;
        }

        retrieve() {
            const matches = document.cookie.match(new RegExp(
                "(?:^|; )" + this.cookieName.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        }

        delete() {
            this.store('', { 'expires': this.getExpiryDateFromDays(0) });
        }

        private getExpiryDateFromDays(days: number) {
            var expiry = new Date();
            expiry = new Date(expiry.getTime() + 1000 * 60 * 60 * 24 * days);
            return expiry.toUTCString();
        }
    }

    class Ajax {
        send(url: string, successCallback: Function, failureCallback: Function): void {
            var isComplete = false;
            var request = this.getRequestObject();

            request.open('GET', url, true);
            request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            request.setRequestHeader('Accept', 'application/json');

            request.onreadystatechange = () => {
                if (request.readyState == 4 && !isComplete) {
                    isComplete = true;
                    if (this.isResponseSuccess(request.status)) {
                        successCallback.call(request, request);
                    } else {
                        failureCallback.call(request, request);
                    }
                }
            }

            request.send();
        }

        private getRequestObject(): XMLHttpRequest {
            var requestObject: XMLHttpRequest;
            if (XMLHttpRequest) {
                requestObject = new XMLHttpRequest();
            } else {
                try {
                    requestObject = new ActiveXObject('Msxml2.XMLHTTP');
                } catch (e) {
                    try {
                        requestObject = new ActiveXObject('Microsoft.XMLHTTP');
                    } catch (e) { }
                }
            }

            return requestObject;
        }

        private isResponseSuccess(responseCode: number) {
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
        }
    }

    CookieGlueDistributor.cookieGlue = new CookieGlueApp('cg');
}