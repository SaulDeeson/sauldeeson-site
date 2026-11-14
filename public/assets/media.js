const publishedVideoDirectory = "https://sauldeeson.github.io/sauldeeson-media/videos/";
const localHost = ["localhost", "127.0.0.1"].includes(location.hostname);

export const videoDirectory = localHost ? "/videos/" : publishedVideoDirectory;
