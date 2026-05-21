/**
 * Google Identity Services (GIS) helper for the popup sign-in flow.
 *
 * The popup returns an ID token (JWT) which we immediately hand to the
 * backend — it is verified server-side and exchanged for our own JWT.
 * Nothing is stored from Google itself.
 */

const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let scriptPromise = null;

export function getGoogleClientId() {
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
}

/** Load the GIS script once and resolve with `window.google`. */
export function loadGoogleIdentityServices() {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Google sign-in is only available in the browser'));
    }

    if (window.google?.accounts?.id) {
        return Promise.resolve(window.google);
    }

    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = GSI_SCRIPT_URL;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google?.accounts?.id) {
                resolve(window.google);
            } else {
                scriptPromise = null;
                reject(new Error('Google sign-in failed to initialize'));
            }
        };
        script.onerror = () => {
            scriptPromise = null;
            reject(new Error('Could not load Google sign-in. Check your connection or ad-blocker.'));
        };
        document.head.appendChild(script);
    });

    return scriptPromise;
}

/**
 * Render the official "Continue with Google" button into `container`.
 *
 * @param {HTMLElement} container - element the button is rendered into
 * @param {object} handlers
 * @param {(credential: string) => void} handlers.onCredential - ID token from the popup
 * @param {(message: string) => void} [handlers.onError]
 */
export async function renderGoogleButton(container, { onCredential, onError } = {}) {
    const clientId = getGoogleClientId();
    if (!clientId) {
        throw new Error('Google sign-in is not configured (NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing)');
    }

    const google = await loadGoogleIdentityServices();

    google.accounts.id.initialize({
        client_id: clientId,
        auto_select: false,
        cancel_on_tap_outside: true,
        callback: (response) => {
            if (response && response.credential) {
                onCredential?.(response.credential);
            } else {
                onError?.(response?.error || 'Google sign-in was cancelled');
            }
        },
    });

    const width = container.clientWidth;
    container.textContent = '';
    google.accounts.id.renderButton(container, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        ...(width > 100 ? { width } : {}),
    });

    // Stretch Google's button to fill the container and make it transparent,
    // so it sits invisibly on top of the custom emerald button.
    const fitToContainer = () => {
        const frame = container.querySelector('iframe');
        if (!frame) return;
        frame.style.width = '100%';
        frame.style.height = '100%';
        frame.style.opacity = '0';
        frame.style.border = '0';
    };
    fitToContainer();
    requestAnimationFrame(fitToContainer);
}
