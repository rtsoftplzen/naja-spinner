// eslint-disable-next-line no-unused-vars
import { blockUI } from '../ui-blocker/blockUI';

const getPathFromUrl = (url) => {
    if (!url) {
        return;
    }
    if (url.indexOf('://') === -1) {
        return url;
    }
    const urlObject = new URL(url);
    return urlObject.pathname + urlObject.search + urlObject.hash;
};

const NAJA_ATTRIBUTE_SELECTOR = 'data-naja-spinner-selector';

export class LoaderExtension {
    constructor(naja, spinnerSelector) {
        this.loaders = [];
        this.naja = naja;

        naja.addEventListener('init', () => {
            this.loader = document.querySelector(spinnerSelector);
        });

        naja.addEventListener('interaction', this.saveLoaders.bind(this));
        naja.addEventListener('before', this.saveLoadersFromOptions.bind(this));
        naja.addEventListener('start', this.showLoader.bind(this));
        naja.addEventListener('complete', this.hideLoader.bind(this));
        naja.addEventListener('abort', this.hideLoader.bind(this));
        naja.addEventListener('error', this.showError.bind(this));
    }

    saveLoaders(event) {
        const element = event.element;
        const selector = element.form
            ? element.form.getAttribute(NAJA_ATTRIBUTE_SELECTOR)
            : element.getAttribute(NAJA_ATTRIBUTE_SELECTOR);

        this.loaders.push({
            element: selector || (element.form ? element.form : element),
            url: element.form
                ? getPathFromUrl(event.url || element.form.action)
                : getPathFromUrl(event.url || element.href || element.action || element.baseURI),
            initialized: false,
        });
    }

    saveLoadersFromOptions(event) {
        if (event !== undefined && event.options !== undefined && event.options.spinnerSelector !== undefined) {
            this.loaders.push({
                element: event.options.spinnerSelector,
                url: getPathFromUrl(event.url),
                initialized: false,
            });
        }
    }

    showLoader(event) {
        if (!this.loaders.length) {
            return;
        }

        const unInitializedLoaders = this.loaders.filter((filter) => filter.initialized === false);

        unInitializedLoaders.forEach((loader, index, object) => {
            window.uiBlocker.block(loader.element);
            loader.initialized = true;

            if (!event.xhr.onabort) {
                event.xhr.onabort = function () {
                    window.uiBlocker.unblock(loader.element);
                    object.splice(index, 1);
                };
            }
        });
    }

    hideLoader(event) {
        if (!this.loaders.length) {
            return;
        }

        const url = getPathFromUrl(event.xhr.responseURL);

        const loadersWithResponseUrl = this.loaders.filter((filter) => filter.url === url);

        loadersWithResponseUrl.forEach((loader, index, object) => {
            try {
                window.uiBlocker.unblock(loader.element);
            } catch (e) {
                // Element uz neexistuje, odstranime vsechny spinnery, aby tam nezustaly viset
                console.warn(e);
                console.warn('Unblocking all elements');
                window.uiBlocker.unblockAll();
            }
            object.splice(index, 1);
        });
    }

    showError(event) {
        if (event.options.silentError === true) {
            return;
        }

        console.log('error', event, event.options);
    }
}
