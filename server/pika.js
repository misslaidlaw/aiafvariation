// The ONLY file that talks to Pika. The browser never sees the API key.
// Endpoints, fields and model names must come from https://dev.pika.art/llms.txt
// and its linked specs; they are intentionally not guessed here.

export function pikaConfigured() {
  return Boolean(process.env.PIKA_API_KEY);
}

export async function generateImage({ prompt }) {
  if (!pikaConfigured()) {
    throw new Error("PIKA_API_KEY is not set on the server.");
  }
  // TODO: implement from the Pika image spec (model, endpoint, request body,
  // polling/response format) once dev.pika.art is readable.
  throw new Error("Pika image call not implemented yet: spec not read.");
}
