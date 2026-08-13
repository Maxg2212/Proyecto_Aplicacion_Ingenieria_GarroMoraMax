export default function swDev() {
  if ('serviceWorker' in navigator) {
    const swUrl = `${process.env.PUBLIC_URL}/sw.js`;
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log("Service Worker registered:", registration);

        // Ask permission for notifications
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("Hello!", {
              body: "Your PWA is ready to work offline",
              icon: "/logo192.png"
            });
          } else {
            console.warn("Notification permission denied");
          }
        });
      })
      .catch(err => {
        console.error("Service Worker registration failed:", err);
      });
  } else {
    console.warn("Service Worker not supported in this browser");
  }
}
