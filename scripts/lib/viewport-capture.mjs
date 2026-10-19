// Only the initial baseline may wait for first paint. Restored images are
// captured once and must still pass Compare.swift's exact pixel comparison.
export async function captureInitialDiagram({deadline, capture, isPainted, preserveRejected,
  now = Date.now, pause = () => new Promise(resolve => setTimeout(resolve, 500))}) {
  let preserved = false;
  while (now() < deadline) {
    const image = await capture();
    const painted = await isPainted(image);
    if (now() >= deadline) break;
    if (painted) return image;
    if (!preserved) {
      await preserveRejected(image);
      preserved = true;
    }
    await pause();
  }
  throw Error('Initial diagram did not paint before the viewport deadline');
}
