export default function swDev() {
  if ('serviceWorker' in navigator) {
    const swUrl = `${process.env.PUBLIC_URL}/sw.js`;
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log("Service Worker registered:", registration);
      })
      .catch(err => {
        console.error("Service Worker registration failed:", err);
      });
  } else {
    console.warn("Service Worker not supported in this browser");
  }
}
