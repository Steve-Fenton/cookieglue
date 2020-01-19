class CookieGlueDistributor {
    static pageLoaded(cookieGlueHtml: CookieGlueApp) {
        cookieGlueHtml.pageLoaded();
    }

    static intentToManage(cookieGlueHtml: CookieGlueApp) {
        cookieGlueHtml.showManager();
    }

    static intentToAccept(cookieGlueHtml: CookieGlueApp) {
        cookieGlueHtml.accept();
        cookieGlueHtml.hideContainers();
        cookieGlueHtml.reload();
    }

    static intentToStore(cookieGlueHtml: CookieGlueApp) {
        cookieGlueHtml.store();
        cookieGlueHtml.hideContainers();
        cookieGlueHtml.reload();
    }
}

class CookieGlueApp {
    private storage = new CookieGlueStorage();

    constructor() {
        this.addEvent(window, 'load', () => {
            this.bindButtons();
            CookieGlueDistributor.pageLoaded(this);
        });
    }

    private bindButtons() {
        const _this = this;
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

    public pageLoaded() {
        if (!this.storage.isConsentSet()) {
            this.showNotice();
        }
    }

    public hideContainers() {
        this.manageContainer().style.display = 'none';
        this.noticeContainer().style.display = 'none';
    }

    public showNotice() {
        this.manageContainer().style.display = 'none';

        const container = this.noticeContainer();
        const source = container.getAttribute('data-cookie-source');

        if (source) {
            var ajax = new Ajax();
            ajax.send(source, (response) => {
                container.innerHTML = response.responseText;
                this.bindButtons();
                container.style.display = 'block';
            }, () => console.error('cookie-glue - cannot load notice text'));
        } else {
            container.style.display = 'block';
        }
    }

    public showManager() {
        this.noticeContainer().style.display = 'none';

        const container = this.manageContainer();
        const source = container.getAttribute('data-cookie-source');

        if (source) {
            var ajax = new Ajax();
            ajax.send(source, (response) => {
                container.innerHTML = response.responseText;
                this.bindButtons();
                this.bindPreferencesToUI();
                container.style.display = 'block';
            }, () => console.error('cookie-glue - cannot load notice text'));
        } else {
            this.bindPreferencesToUI();
            container.style.display = 'block';
        }
    }

    accept() {
        const container = this.manageContainer();
        const items = container.querySelectorAll('[data-cookie-type]');

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const input = item.querySelector('input[type=checkbox]');
            if (!!input) {
                input.setAttribute('checked', 'checked');
            }
        }

        this.store();
    }

    store() {
        const container = this.manageContainer()
        const items = container.querySelectorAll('[data-cookie-type]');
        const preferences = {};

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const cookieType = item.getAttribute('data-cookie-type');

            const input = item.querySelector('input[type=checkbox]');

            if (!this.isInputElement(input)) {
                continue;
            }

            if (!!input) {
                preferences[input.name] = input.checked;
            } else {
                console.log('cookie-glue - no input found in element of kind', cookieType);
            }
        }

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
        const manageContainer = this.manageContainer();
        const items = manageContainer.querySelectorAll('[data-cookie-type]');

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const cookieType = item.getAttribute('data-cookie-type');
            const input = item.querySelector('input[type=checkbox]');

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
            } else {
                console.log('cookie-glue no input found in element of kind', cookieType);
            }
        }
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

    private isInputElement(element: Element): element is HTMLInputElement {
        return (element.tagName.toUpperCase() === 'INPUT');
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

const CookieGlue = new CookieGlueApp();