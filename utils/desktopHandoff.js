// The desktop app opens the auth pages with ?desktop_port&state and receives the token on its local listener.
// Returns true when the browser was sent back to the desktop app; false when the normal post-auth flow should run.
export const completeDesktopHandoff = (data) => {
  const params = new URLSearchParams(window.location.search);
  const port = params.get("desktop_port");
  const state = params.get("state");
  if (port && /^\d{1,5}$/.test(port) && state) {
    const handoff = new URL(`http://127.0.0.1:${port}/callback`);
    handoff.searchParams.set("state", state);
    handoff.searchParams.set("access_token", data.access_token);
    window.location.href = handoff.toString();
    return true;
  }
  return false;
};
