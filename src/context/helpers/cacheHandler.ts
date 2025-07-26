import type { QueryClient } from "@tanstack/react-query";

/**
 * KeyFactory type defines the way to generate query keys
 * It can be:
 * - A function that receives an entity and returns either:
 *    - An array of strings (key segments),
 *    - An object whose values are keys,
 *    - Or undefined/null if no keys apply.
 * - Or a static readonly string array key.
 */
type KeyFactory<T = any> =
  | ((entity: T) => (string[] | Record<string, any> | undefined | null))
  | readonly string[];

/**
 * extractKeysFromFactory extracts the actual query keys from the keyFactory.
 * Handles:
 * - function keyFactories returning objects or arrays,
 * - static array keyFactories,
 * and normalizes all to an array of keys (each key is an array of strings).
 *
 * @param keyFactory - function or array generating keys
 * @param entity - entity passed if keyFactory is a function
 * @returns Array of query keys (each is an array of strings)
 */
function extractKeysFromFactory<T>(
  keyFactory: KeyFactory<T>,
  entity: T
): readonly string[][] {
  if (typeof keyFactory === "function") {
    const keysObj = keyFactory(entity);
    if (keysObj && typeof keysObj === "object" && !Array.isArray(keysObj)) {
      // Object with keys as values - return all truthy values as keys
      return Object.values(keysObj).filter(Boolean) as string[][];
    }
    if (Array.isArray(keysObj)) return [keysObj as string[]];
    return [];
  }
  if (Array.isArray(keyFactory)) return [keyFactory];
  return [];
}

/**
 * Returns a matching function used to find an entity inside cached data.
 * 
 * @param idKey - either a function to compare two entities, or a string key (keyof T) to compare equality by.
 * Default is 'id'.
 * @returns A boolean function (a, b) => true if they match.
 */
function getIsMatch<T>(
  idKey: ((a: T, b: T) => boolean) | keyof T = "id" as keyof T
) {
  if (typeof idKey === "function") {
    return (a: T, b: T) => idKey(a, b);
  }
  return (a: T, b: T) =>
    a?.[idKey] !== undefined && b?.[idKey] !== undefined && a[idKey] === b[idKey];
}

interface OptimisticUpdateParams<T extends Record<string, any>> {
  queryClient: QueryClient;
  keyFactory: KeyFactory<T>;
  entity: T;
  type: "add" | "update" | "remove";
  idKey?: ((a: T, b: T) => boolean) | keyof T;
}

/**
 * Performs an optimistic update on react-query cache data.
 * It applies a change of type 'add', 'update', or 'remove' on all keys
 * generated from the keyFactory for the given entity.
 * 
 * It saves the previous cache data for rollback in case of error.
 * 
 * @param params
 * @returns previous cache data snapshot (key -> previous value)
 */
export function optimisticUpdate<T extends Record<string, any>>({
  queryClient,
  keyFactory,
  entity,
  type,
  idKey = "id" as keyof T,
}: OptimisticUpdateParams<T>) {
  const keys = extractKeysFromFactory(keyFactory, entity);
  const isMatch = getIsMatch<T>(idKey);
  const previousData: Record<string, unknown> = {};

  keys.forEach((key) => {
    // Get previous cached data for this key
    const prev = queryClient.getQueryData<T | T[]>(key);
    // Store it in previousData for rollback purposes (key joined to string)
    previousData[key.join(",")] = prev;

    if (type === "add") {
      // Add entity to array or create new array with entity
      const newValue = Array.isArray(prev) ? [...prev, entity] : [entity];
      queryClient.setQueryData(key, newValue);
    } else if (type === "update") {
      if (Array.isArray(prev)) {
        // Update entity inside array if matches by idKey
        queryClient.setQueryData(
          key,
          prev.map((item) => (isMatch(item, entity) ? { ...item, ...entity } : item))
        );
      } else if (prev && isMatch(prev, entity)) {
        // Update single object cached
        queryClient.setQueryData(key, { ...prev, ...entity });
      }
    } else if (type === "remove") {
      if (Array.isArray(prev)) {
        // Remove matching entity from array
        queryClient.setQueryData(
          key,
          prev.filter((item) => !isMatch(item, entity))
        );
      } else if (prev && isMatch(prev, entity)) {
        // Remove cached single object
        queryClient.setQueryData(key, undefined);
      }
    }
  });

  return previousData;
}

interface RollbackCacheParams {
  queryClient: QueryClient;
  previousData?: Record<string, unknown>;
}

/**
 * Rollbacks the react-query cache to a previous state using the snapshot provided.
 * Useful to restore cache after optimistic update failure.
 * 
 * @param params
 */
export function rollbackCache({ queryClient, previousData }: RollbackCacheParams) {
  if (!previousData || typeof previousData !== "object") return;
  Object.entries(previousData).forEach(([key, value]) => {
    // Convert stored string keys back to array keys for queryClient
    const keyArray = key.split(",");
    queryClient.setQueryData(keyArray, value);
  });
}

interface ReplaceOptimisticItemParams<T extends Record<string, any>> {
  queryClient: QueryClient;
  keyFactory: KeyFactory<T>;
  entity: T;
  newEntity: T;
  idKey?: ((a: T, b: T) => boolean) | keyof T;
}

/**
 * Replaces an existing item in the cache with a new entity.
 * Useful when an optimistic update's temporary entity needs to be replaced by a confirmed one.
 * 
 * @param params
 */
export function replaceOptimisticItem<T extends Record<string, any>>({
  queryClient,
  keyFactory,
  entity,
  newEntity,
  idKey = "id" as keyof T,
}: ReplaceOptimisticItemParams<T>) {
  const keys = extractKeysFromFactory(keyFactory, entity);
  const isMatch = getIsMatch<T>(idKey);

  keys.forEach((key) => {
    const prev = queryClient.getQueryData<T | T[]>(key);
    if (Array.isArray(prev)) {
      // Replace entity inside array
      queryClient.setQueryData(
        key,
        prev.map((item) => (isMatch(item, entity) ? newEntity : item))
      );
    } else if (prev && isMatch(prev, entity)) {
      // Replace single cached object
      queryClient.setQueryData(key, newEntity);
    }
  });
}

interface InvalidateKeysParams<T extends Record<string, any>> {
  queryClient: QueryClient;
  keyFactory: KeyFactory<T>;
  entity?: T;
}

/**
 * Invalidates all react-query caches for the keys generated by the keyFactory.
 * Useful to refetch or refresh data after mutation or external updates.
 * 
 * @param params
 */
export function invalidateKeys<T extends Record<string, any>>({
  queryClient,
  keyFactory,
  entity,
}: InvalidateKeysParams<T>) {
  const keys = extractKeysFromFactory(keyFactory, entity as T);
  keys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
}
