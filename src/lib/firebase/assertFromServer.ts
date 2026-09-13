export function assertFromServer(snapshot: { metadata: { fromCache: boolean } }, message: string): void {
  if (snapshot.metadata.fromCache) {
    throw new Error(message);
  }
}
