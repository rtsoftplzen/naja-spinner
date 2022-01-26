import naja from 'naja';
import { LoaderExtension } from '../library/naja/naja-spinners';
import './src/block-ui';

export const initSpinners = (onAfterNajaUpdate) => {
    window.naja = naja;
    window.uiBlocker = blockUI();

    document.addEventListener('DOMContentLoaded', () => {
        // naja.initialize.bind(naja);
        naja.registerExtension(LoaderExtension, '#loader');

        if (naja.initialized === false) {
            naja.initialize();
        }

        naja.snippetHandler.addEventListener('afterUpdate', (event) => {
            if (onAfterNajaUpdate) onAfterNajaUpdate(event);
        });
    });
}
