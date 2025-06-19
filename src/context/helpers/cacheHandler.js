function extractKeysFromFactory(keyFactory, entity) {
  if (typeof keyFactory === 'function') {
    const keysObj = keyFactory(entity);
    if (keysObj && typeof keysObj === 'object' && !Array.isArray(keysObj)) {
      return Object.values(keysObj).filter(Boolean);
    }
    if (Array.isArray(keysObj)) return [keysObj];
    return [];
  }
  if (Array.isArray(keyFactory)) return [keyFactory];
  return [];
}

function getIsMatch(idKey) {
  if (typeof idKey === 'function') {
    return (a, b) => idKey(a, b);
  }
  return (a, b) => a?.[idKey] !== undefined && b?.[idKey] !== undefined && a[idKey] === b[idKey];
}

export function optimisticUpdate({ queryClient, keyFactory, entity, type, idKey = 'id' }) {
  const keys = extractKeysFromFactory(keyFactory, entity);
  const isMatch = getIsMatch(idKey);
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
          prev.map((item) => (isMatch(item, entity) ? { ...item, ...entity } : item))
        );
      } else if (isMatch(prev, entity)) {
        queryClient.setQueryData(key, { ...prev, ...entity });
      }
    } else if (type === 'remove') {
      if (Array.isArray(prev)) {
        queryClient.setQueryData(
          key,
          prev.filter((item) => !isMatch(item, entity))
        );
      } else if (isMatch(prev, entity)) {
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
  const isMatch = getIsMatch(idKey);

  keys.forEach((key) => {
    const prev = queryClient.getQueryData(key);
    if (Array.isArray(prev)) {
      queryClient.setQueryData(
        key,
        prev.map((item) => (isMatch(item, entity) ? newEntity : item))
      );
    } else if (isMatch(prev, entity)) {
      queryClient.setQueryData(key, newEntity);
    }
  });
}

export function invalidateKeys({ queryClient, keyFactory, entity }) {
  const keys = extractKeysFromFactory(keyFactory, entity);
  keys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
}
