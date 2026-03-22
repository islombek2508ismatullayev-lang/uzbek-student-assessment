(function registerPlatformFeatures() {
    const isFileProtocol = window.location.protocol === "file:";

    if ("serviceWorker" in navigator && !isFileProtocol) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/service-worker.js").catch((error) => {
                console.warn("Service worker ro'yxatdan o'tmadi.", error);
            });
        });
    }
}());
