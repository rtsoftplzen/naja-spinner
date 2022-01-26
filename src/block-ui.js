export const blockUI = () => ({
    blockedCollection: [],
    _createBlocker: function (el) {
        const rect = el.getBoundingClientRect();
        const blocker = document.createElement('div');
        blocker.classList.add('ui-blocker');
        blocker.setAttribute(
            'style',
            `left:${rect.left}px;top:${rect.top + (window.scrollY || window.pageYOffset)}px;width:${
                rect.width
            }px;height:${rect.height}px`
        );
        const blockerSpinner = document.createElement('div');
        blockerSpinner.classList.add('spinner');
        blocker.appendChild(blockerSpinner);
        document.body.appendChild(blocker);
        this.blockedCollection.push({ el: el.getAttribute('id') || el, blocker });
    },
    _getElement: function (element) {
        return typeof element === 'string' ? document.body.querySelector(element) : element;
    },
    block: function (element) {
        const el = this._getElement(element);
        if (!el) {
            throw Error('Calling BLOCK on non-existing element');
            // eslint-disable-next-line no-unreachable
            return;
        }
        // eslint-disable-next-line no-unused-vars
        const createdBlocker = this._createBlocker(el);
        return { unblock: () => this.unblock(el) };
    },
    unblock: function (element) {
        const el = this._getElement(element);
        if (!el) {
            throw Error('Calling UNBLOCK on non-existing element');
            // eslint-disable-next-line no-unreachable
            return;
        }

        const newBlockedCollection = [];

        this.blockedCollection.forEach((item) => {
            // U prvku prekreslenych AJAXem to nemusi byt isSameNode, i kdyz pro uzivatele je..
            // Je lepsi to skryt (i kdyby nahodou driv), nez to nechat viset tocit
            if (
                (typeof item.el !== 'string' && item.blocker) /* item.el.isSameNode(el)*/ ||
                item.el === el.getAttribute('id')
            ) {
                document.body.removeChild(item.blocker);
            } else {
                newBlockedCollection.push(item);
            }
        });
        this.blockedCollection = newBlockedCollection;
    },
    unblockAll: function () {
        // Vsechny elementy s classou ui-blocker odstranime
        const elements = document.getElementsByClassName('ui-blocker');

        for (const element of elements) {
            document.body.removeChild(element);
        }
    },
});
