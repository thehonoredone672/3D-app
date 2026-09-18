// Adapter contract for any 3D reconstruction backend (local pipeline, cloud
// API, future device-captured spatial data). New providers implement this
// and register in providerRegistry.js - nothing else in the app changes.
export class ReconstructionProvider {
  // input: { jobId, captures, sourceRoot } - jobId identifies this
  // reconstruction run, captures are ScanCapture rows, sourceRoot is where
  // their fileUrl paths resolve from. Should start the job and return
  // quickly (do not await full completion here) - progress is polled via
  // getStatus(jobId).
  async createModel(input) {
    throw new Error(`${this.constructor.name}.createModel() not implemented`);
  }

  async getStatus(jobId) {
    throw new Error(`${this.constructor.name}.getStatus() not implemented`);
  }

  async downloadModel(jobId) {
    throw new Error(`${this.constructor.name}.downloadModel() not implemented`);
  }
}
