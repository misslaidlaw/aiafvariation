// Text stages of the pipeline (idea -> screenplay -> prompts & sheets),
// powered by Claude. The API key is passed in per request (the visitor's own
// key, or the server's when ALLOW_SERVER_KEYS=true) and never stored.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const MODEL = "claude-opus-5-5";


const Screenplay = z.object({
  title: z.string(),
  logline: z.string(),
  scenes: z.array(
    z.object({
      number: z.number().int(),
      heading: z.string().describe("Slugline, e.g. INT. DINER - NIGHT"),
      summary: z.string(),
      text: z.string().describe("Full scene in screenplay format: action and dialogue"),
    }),
  ),
});

const Breakdown = z.object({
  styleGuide: z.string().describe("One paragraph visual style shared by every image and video prompt"),
  characters: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      appearance: z.string(),
      wardrobe: z.string(),
      personality: z.string(),
      imagePrompt: z.string().describe("Character sheet prompt: full body, neutral background"),
    }),
  ),
  locations: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      mood: z.string(),
      lighting: z.string(),
      imagePrompt: z.string().describe("Establishing shot prompt, no characters"),
    }),
  ),
  props: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      significance: z.string(),
      imagePrompt: z.string().describe("Product-style prompt on a neutral background"),
    }),
  ),
  shots: z.array(
    z.object({
      sceneNumber: z.number().int(),
      shotType: z.string().describe("e.g. wide, medium, close-up"),
      description: z.string(),
      imagePrompt: z.string().describe("Keyframe prompt reusing the exact character, location and prop descriptions"),
      videoPrompt: z.string().describe("Motion prompt: camera move and action over ~5 seconds"),
    }),
  ),
});

async function run(apiKey, system, user, format) {
  if (!apiKey) throw Object.assign(new Error("Add your Anthropic API key in Settings."), { status: 401 });
  let response;
  try {
    response = await new Anthropic({ apiKey }).beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium", format },
      // Refusal fallback: if the model declines, the API reroutes to a fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system,
      messages: [{ role: "user", content: user }],
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) {
      throw Object.assign(new Error("Your Anthropic API key was rejected. Check it in Settings."), { status: 401 });
    }
    throw e;
  }
  if (response.stop_reason === "refusal") {
    throw new Error("The model declined this request. Try rephrasing the idea.");
  }
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new Error("The response was cut off. Try a shorter story (fewer scenes).");
  }
  return response.parsed_output;
}

export function writeScreenplay(apiKey, { idea, scenes = 5 }) {
  return run(
    apiKey,
    "You are a professional screenwriter. Write tight, visual short-film screenplays that can be produced with AI image and video generation: few locations, a small cast, strong visual moments.",
    `Idea: ${idea}\n\nWrite a short film screenplay with about ${scenes} scenes.`,
    betaZodOutputFormat(Screenplay),
  );
}

export function breakDown(apiKey, { screenplay }) {
  return run(
    apiKey,
    "You are a film pre-production designer. Break screenplays into consistent visual reference sheets and shot prompts for AI image and video models. Describe each character, location and prop once in precise visual detail, then reuse those exact descriptions word for word inside every shot prompt so the generated images stay consistent.",
    `Screenplay (JSON):\n${JSON.stringify(screenplay)}\n\nCreate the style guide, character sheets, location sheets, prop sheets, and 1-3 shots per scene.`,
    betaZodOutputFormat(Breakdown),
  );
}
