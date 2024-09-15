var SW_VERSION = "notepad-version_3.4.0";

var appShellURLs = ["/index.html", "/index.js", "/style.css"];

self.addEventListener("install", installServiceWorker);
self.addEventListener("activate", activateServiceWorker);
self.addEventListener("fetch", interceptResourceFetchWithServiceWorker);

function installServiceWorker(event) {
  event.waitUntil(
    caches.open(SW_VERSION).then((cache) => {
      console.log("Service worker installing.");
      return cache.addAll(appShellURLs);
    })
  );
}

function activateServiceWorker(event) {
  event.waitUntil(
    caches
      .keys() // cache names (caches)
      .then((cacheKeys) => {
        // cache entries (keys/entries in a single cache)
        const oldKeys = cacheKeys.filter(
          (key) => key.indexOf(SW_VERSION) !== 0
        );
        // promise to delete all old keys in this cache:
        const promisesToDeleteOldKeys = oldKeys.map((oldKey) =>
          caches.delete(oldKey)
        );
        // don't continue until ALL old keys are deleted:
        return Promise.all(promisesToDeleteOldKeys);
      })
  );
}

function interceptResourceFetchWithServiceWorker(event) {
  const url = new URL(event.request.url);
  const wantAppShellResource = appShellURLs.indexOf(url.pathname) !== -1;
  const navigatingToPage = event.request.mode === "navigate";
  if (wantAppShellResource) {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          if (!response) {
            throw new Error(event.request + " not found in cache");
          }
          console.log(
            `Service worker fetching resource even though you're offline: ${url}`
          );
          // get resource from cache:
          return response;
        })
        .catch((error) => {
          // fetch resource from network if not in cache:
          fetch(event.request);
        })
    );
  } else if (navigatingToPage) {
    event.respondWith(
      fetch(event.request).catch((error) => {
        return caches.open(SW_VERSION).then((cache) => {
          console.log(
            `Service worker fetching page even though you're offline: ${url}`
          );
          return cache.match("index.html");
        });
      })
    );
  }
}
