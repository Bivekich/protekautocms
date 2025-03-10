// Типы для Яндекс.Карт
declare namespace ymaps {
  function ready(callback: () => void): void;

  class Map {
    constructor(
      element: HTMLElement,
      options: {
        center: [number, number];
        zoom: number;
        controls?: string[];
      }
    );
    destroy(): void;
    setCenter(center: [number, number], zoom?: number): void;
    geoObjects: GeoObjectCollection;
    events: EventManager;
  }

  class Placemark {
    constructor(
      geometry: [number, number],
      properties?: Record<string, unknown>,
      options?: Record<string, unknown>
    );
    geometry: {
      setCoordinates(coordinates: [number, number]): void;
    };
  }

  class GeoObjectCollection {
    add(object: Placemark | GeoObjectCollection): this;
    remove(object: Placemark | GeoObjectCollection): this;
    get(index: number): Placemark | GeoObjectCollection;
    getLength(): number;
  }

  class EventManager {
    add(type: string, callback: (e: Event) => void): this;
  }

  interface Event {
    get(name: string): unknown;
  }
}

// Добавляем ymaps в глобальный объект window
interface Window {
  ymaps: typeof ymaps;
}
