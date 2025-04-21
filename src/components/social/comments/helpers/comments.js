// helpers/comments.js
export function nestComments(comments) {
  const map = {};
  const roots = [];

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
