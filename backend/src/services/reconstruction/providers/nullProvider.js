import { ReconstructionProvider } from "../reconstructionProvider.js";

// The default provider until a real one (Step 7) is registered. It never
// pretends to produce a model - it fails clearly and immediately, so the
// rest of the app can tell "not configured" apart from "actually failed".
function notConfiguredError() {
  const err = new Error(
    "No reconstruction provider is configured. Connect a real pipeline, or upload an existing 3D model for this unit instead."
  );
  err.code = "RECONSTRUCTION_NOT_CONFIGURED";
  return err;
}

export class NullReconstructionProvider extends ReconstructionProvider {
  async createModel() {
    throw notConfiguredError();
  }

  async getStatus() {
    throw notConfiguredError();
  }

  async downloadModel() {
    throw notConfiguredError();
  }
}
