// The ONLY file that talks to Pika. The browser never sees the API key.
// Endpoints, fields and model names must come from https://dev.pika.art/llms.txt
// and its linked specs; they are intentionally not guessed here.

export function pikaConfigured() {
  return Boolean(process.env.PIKA_API_KEY);
}

function notReady() {
  if (!pikaConfigured()) throw new Error("PIKA_API_KEY is not set on the server.");
  throw new Error("Pika connection not implemented yet: the Pika spec has not been read.");
}

// Returns { imageUrl }
export async function generateImage({ prompt }) {
  // TODO: implement from the Pika image spec.
  notReady();
}

// Returns { videoUrl }. imageUrl (optional) is a keyframe to animate.
export async function generateVideo({ prompt, imageUrl }) {
  // TODO: implement from the Pika video spec.
  notReady();
}
