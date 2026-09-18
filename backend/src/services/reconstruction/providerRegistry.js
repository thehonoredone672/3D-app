import { NullReconstructionProvider } from "./providers/nullProvider.js";
import { LocalColmapProvider } from "./providers/localColmapProvider.js";

// ReconstructionProvider
//         |
//   +-----+-----------+
//   v     v           v
// Local  Cloud      Future
//
// Add a new provider by adding an entry here - nothing else in the app
// needs to change. Selected via RECONSTRUCTION_PROVIDER in .env.
const PROVIDERS = {
  null: () => new NullReconstructionProvider(),
  local: () => new LocalColmapProvider(),
};

export function getReconstructionProvider() {
  const name = process.env.RECONSTRUCTION_PROVIDER || "null";
  const factory = PROVIDERS[name];
  if (!factory) {
    throw new Error(`Unknown reconstruction provider: "${name}"`);
  }
  return factory();
}
