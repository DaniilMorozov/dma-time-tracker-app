(() => {
    const EXTENSION_ID = 'milklfbkkkebnodapnjnebdclkdkofbn';
    const base = `chrome-extension://${EXTENSION_ID}/`;
    const frame = document.getElementById('tracker');
    const fallback = document.getElementById('fallback');
    const message = document.getElementById('message');

    const show = (installed, text) => {
        frame.classList.toggle('hidden', !installed);
        fallback.classList.toggle('hidden', installed);
        if (text) {
            message.textContent = text;
        }
    };

    const probe = () =>
        new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = `${base}icons/icon16.png?${Date.now()}`;
        });

    const check = async () => {
        if (!/Chrome\//.test(navigator.userAgent)) {
            show(false, 'This app works in Google Chrome only.');
            return;
        }
        const installed = await probe();
        if (installed) {
            if (!frame.src) {
                frame.src = `${base}src/popup/popup.html?mode=window`;
            }
            show(true);
        } else {
            show(false, 'The DMA YouTrack Time Tracker extension is not installed in this browser profile.');
        }
    };

    const notifyFocus = () => {
        if (!frame.classList.contains('hidden') && frame.contentWindow) {
            frame.contentWindow.postMessage({ type: 'dma-app-focus' }, base.replace(/\/$/, ''));
        }
    };
    window.addEventListener('focus', notifyFocus);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            notifyFocus();
        }
    });
    document.getElementById('retry').addEventListener('click', check);
    window.addEventListener('focus', () => {
        if (!fallback.classList.contains('hidden')) {
            check();
        }
    });
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    check();
})();
