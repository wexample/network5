let paramsHash;

export function paramReload() {
  paramsHash = new URLSearchParams(
    document.location.hash.substr(1)
  );

  return paramsHash;
}

export function hashParamGet(name: string, defaultValue: string = ''): string {
  paramReload();

  let value = paramsHash.get(name);
  // Support "false" value in query string, but not "null".
  return value !== null ? value : defaultValue;
}

export function hashParamSet(name: string, value: string, ignoreHistory = false) {
  let location = document.location;
  paramsHash.set(name, value);

  updateLocation(
    location.pathname +
    location.search +
    '#' +
    paramsHash.toString(),
    ignoreHistory
  );
}

export function updateLocation(href, ignoreHistory = false) {
  // Cleanup href if no more hash.
  if (href[href.length - 1] === '#') {
    href = href.substr(0, href.length - 1);
  }

  // Choose between push or replace.
  window.history[ignoreHistory ? 'replaceState' : 'pushState'](
    {manualState: true},
    document.title,
    href
  );
}

export function parseUrl(url: string): URL {
  // Not absolute.
  if (url.substr(0, 4) !== 'http') {
    // Append root slash.
    if (url[0] !== '/') {
      url = '/' + url;
    }
    url = document.location.origin + url;
  }
  return new URL(url);
}
