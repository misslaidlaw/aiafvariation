// The ONLY file that talks to Pika. The API key is passed in per request
// (the visitor's own key, or the server's when ALLOW_SERVER_KEYS=true).
// Endpoints, fields and model names must come from https://dev.pika.art/llms.txt
// and its linked specs; they are intentionally not guessed here.

function notReady(apiKey) {
  if (!apiKey) throw Object.assign(new Error("Add your Pika API key in Settings."), { status: 401 });
  throw new Error("Pika connection not implemented yet: the Pika spec has not been read.");
}

// Returns { imageUrl }
export async function generateImage(apiKey, { prompt }) {
  // TODO: implement from the Pika image spec.
  notReady(apiKey);
}

// Returns { videoUrl }. imageUrl (optional) is a keyframe to animate.
export async function generateVideo(apiKey, { prompt, imageUrl }) {
  // TODO: implement from the Pika video spec.
  notReady(apiKey);
}
