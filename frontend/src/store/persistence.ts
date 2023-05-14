export function persist(namespace: string, snapshot: object) {
  if (typeof window == "undefined") {
    return;
  }

  window.localStorage.setItem(namespace, JSON.stringify(snapshot));
}

export function restore(namespace: string) {
  if (typeof window == "undefined") {
    return {};
  }

  const serializedState = window.localStorage.getItem(namespace);

  if (serializedState) {
    try {
      return JSON.parse(serializedState);
    } catch (e) {
      return {};
    }
  }
}
