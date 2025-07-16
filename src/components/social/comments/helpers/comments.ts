export type NestedComment<T = any> = T & { replies: NestedComment<T>[] };

export function nestComments<T extends { id: string; parent_id?: string }>(comments: T[]): NestedComment<T>[] {
  const map: Record<string, NestedComment<T>> = {};
  const roots: NestedComment<T>[] = [];

  comments.forEach(comment => {
    map[comment.id] = { ...comment, replies: [] };
  });

  comments.forEach(comment => {
    if (comment.parent_id) {
      map[comment.parent_id]?.replies.push(map[comment.id]);
    } else {
      roots.push(map[comment.id]);
    }
  });

  return roots;
}
