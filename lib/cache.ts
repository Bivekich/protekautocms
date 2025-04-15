/**
 * Утилита для кэширования данных на стороне клиента
 */

// Время жизни кэша по умолчанию в миллисекундах (2 минуты)
export const DEFAULT_CACHE_TTL = 120 * 1000;

// Типы для кэша
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Хранилище для кэша (ключ-значение)
const cacheStore: Record<string, CacheEntry<unknown>> = {};

// Отслеживание запросов в процессе выполнения
const pendingRequests: Record<string, boolean> = {};

/**
 * Получение данных из кэша
 * @param key Ключ для хранения данных
 * @returns Данные из кэша, если они есть и не устарели
 */
export function getCachedData<T>(
  key: string,
  ttl = DEFAULT_CACHE_TTL
): T | null {
  const cacheEntry = cacheStore[key];
  const now = Date.now();

  if (cacheEntry && now - cacheEntry.timestamp < ttl) {
    return cacheEntry.data as T;
  }

  return null;
}

/**
 * Сохранение данных в кэш
 * @param key Ключ для хранения данных
 * @param data Данные для сохранения
 */
export function setCachedData<T>(key: string, data: T): void {
  cacheStore[key] = {
    data,
    timestamp: Date.now(),
  };
}

/**
 * Очистка кэша по ключу
 * @param key Ключ для очистки
 */
export function clearCacheEntry(key: string): void {
  delete cacheStore[key];
}

/**
 * Проверка, выполняется ли запрос с указанным ключом
 * @param key Ключ запроса
 * @returns True, если запрос выполняется
 */
export function isRequestPending(key: string): boolean {
  return !!pendingRequests[key];
}

/**
 * Установка состояния выполнения запроса
 * @param key Ключ запроса
 * @param isPending Состояние выполнения
 */
export function setRequestPending(key: string, isPending: boolean): void {
  pendingRequests[key] = isPending;
}

/**
 * Выполнение запроса с кэшированием
 * @param key Ключ для кэширования
 * @param fetchFn Функция, выполняющая запрос и возвращающая Promise с данными
 * @param ttl Время жизни кэша в миллисекундах
 * @returns Promise с данными
 */
export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl = DEFAULT_CACHE_TTL
): Promise<T> {
  // Проверяем кэш
  const cachedData = getCachedData<T>(key, ttl);
  if (cachedData) {
    console.log(`Using cached data for key: ${key}`);
    return cachedData;
  }

  // Если запрос уже выполняется, ждем небольшую паузу и проверяем кэш снова
  if (isRequestPending(key)) {
    console.log(`Request already pending for key: ${key}, waiting...`);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Проверяем кэш снова после паузы
    const newCachedData = getCachedData<T>(key, ttl);
    if (newCachedData) {
      console.log(`Found cached data after waiting for key: ${key}`);
      return newCachedData;
    }

    // Если данных все еще нет, выполняем запрос
  }

  try {
    // Отмечаем, что запрос выполняется
    setRequestPending(key, true);

    // Выполняем запрос
    const data = await fetchFn();

    // Сохраняем результат в кэш
    setCachedData(key, data);

    return data;
  } finally {
    // Снимаем отметку о выполнении запроса
    setRequestPending(key, false);
  }
}
