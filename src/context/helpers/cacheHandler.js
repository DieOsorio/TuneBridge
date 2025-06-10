/**
 * Generalized optimistic update for React Query.
 * @param {object} params
 * @param {object} params.queryClient - The React Query client.
 * @param {Array|Function} params.queryKey - Query key (array) or a function returning keys (for multiple).
 * @param {object} params.entity - The entity to add/update/remove.
 * @param {'add'|'update'|'remove'} params.type - Operation type.
 * @param {string} [params.idKey='id'] - The key to identify entities.
 * @returns {object} previousData - For rollback.
 */
function extractKeysFromFactory(keyFactory, entity) {
  // If keyFactory is a function, call it with entity
  // If it returns an object, collect all defined values (arrays)
  // If it returns a single array, just use that
  if (typeof keyFactory === 'function') {
    const keysObj = keyFactory(entity);
    if (keysObj && typeof keysObj === 'object' && !Array.isArray(keysObj)) {
      return Object.values(keysObj).filter(Boolean);
    }
    if (Array.isArray(keysObj)) return [keysObj];
    return [];
  }
  // If keyFactory is just an array, wrap it
  if (Array.isArray(keyFactory)) return [keyFactory];
  return [];
}

export function optimisticUpdate({ queryClient, keyFactory, entity, type, idKey = 'id' }) {
  const keys = extractKeysFromFactory(keyFactory, entity);
  const previousData = {};
  keys.forEach((key) => {
    const prev = queryClient.getQueryData(key);
    previousData[key] = prev;
    if (type === 'add') {
      const newValue = Array.isArray(prev) ? [...prev, entity] : [entity];
      queryClient.setQueryData(key, newValue);
    } else if (type === 'update') {
      if (Array.isArray(prev)) {
        queryClient.setQueryData(
          key,
          prev.map((item) => (item && item[idKey] === entity[idKey] ? { ...item, ...entity } : item))
        );
      } else if (prev && prev[idKey] === entity[idKey]) {
        queryClient.setQueryData(key, { ...prev, ...entity });
      }
    } else if (type === 'remove') {
      if (Array.isArray(prev)) {
        queryClient.setQueryData(key, prev.filter((item) => item && item[idKey] !== entity[idKey]));
      } else if (prev && prev[idKey] === entity[idKey]) {
        queryClient.setQueryData(key, undefined);
      }
    }
  });
  return previousData;
}

export function rollbackCache({ queryClient, previousData }) {
  if (!previousData || typeof previousData !== 'object') return;
  Object.entries(previousData).forEach(([key, value]) => {
    queryClient.setQueryData(key, value);
  });
}

export function replaceOptimisticItem({ queryClient, keyFactory, entity, newEntity, idKey = 'id' }) {
  const keys = extractKeysFromFactory(keyFactory, entity);
  keys.forEach((key) => {
    const prev = queryClient.getQueryData(key);
    if (Array.isArray(prev)) {
      queryClient.setQueryData(
        key,
        prev.map((item) => {
          if (!item || !entity) return item;
          if (item[idKey] !== undefined && entity[idKey] !== undefined && item[idKey] === entity[idKey]) {
            return newEntity;
          }
          if (
            typeof item[idKey] === 'string' &&
            typeof entity[idKey] === 'string' &&
            item[idKey] && entity[idKey] &&
            (item[idKey].startsWith('temp-') || entity[idKey].startsWith('temp-')) &&
            item[idKey] === entity[idKey]
          ) {
            return newEntity;
          }
          if (
            item.follower_profile_id !== undefined && entity.follower_profile_id !== undefined &&
            item.following_profile_id !== undefined && entity.following_profile_id !== undefined &&
            item.follower_profile_id === entity.follower_profile_id &&
            item.following_profile_id === entity.following_profile_id
          ) {
            return newEntity;
          }
          if (
            item.created_by !== undefined && entity.created_by !== undefined &&
            item.created_by === entity.created_by
          ) {
            return newEntity;
          }
          return item;
        })
      );
    }
  });
}

export function invalidateKeys({ queryClient, keyFactory, entity }) {
  const keys = extractKeysFromFactory(keyFactory, entity);
  keys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
}