import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ApiExample } from "../example";

// Мокаем fetch
global.fetch = vi.fn();

// Мокаем Card компоненты
vi.mock("@/components/ui/card", async () => {
  const actual = await vi.importActual("@/components/ui/card");
  return {
    ...actual,
    Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
    CardContent: ({ children, className }: { children: React.ReactNode, className?: string }) => 
      <div data-testid="card-content" className={className}>{children}</div>,
    CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children }: { children: React.ReactNode }) => <h3 data-testid="card-title">{children}</h3>,
    CardDescription: ({ children }: { children: React.ReactNode }) => <p data-testid="card-description">{children}</p>
  };
});

// Мокаем Select компоненты
vi.mock("@/components/ui/select", async () => {
  const actual = await vi.importActual("@/components/ui/select");
  return {
    ...actual,
    Select: ({ children, value, onValueChange }: { children: React.ReactNode, value: string, onValueChange: (value: string) => void }) => (
      <div data-testid="select" data-value={value} onClick={() => onValueChange("about")}>{children}</div>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => <div data-testid="select-content">{children}</div>,
    SelectItem: ({ children, value }: { children: React.ReactNode, value: string }) => 
      <div data-testid={`select-item-${value}`}>{children}</div>,
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="select-trigger">{children}</div>,
    SelectValue: ({ children, placeholder }: { children: React.ReactNode, placeholder: string }) => 
      <div data-testid="select-value" data-placeholder={placeholder}>{children}</div>
  };
});

// Мокаем Button компонент
vi.mock("@/components/ui/button", async () => {
  const actual = await vi.importActual("@/components/ui/button");
  return {
    ...actual,
    Button: ({ children, onClick, variant }: { children: React.ReactNode, onClick?: () => void, variant?: string }) => (
      <button data-testid="button" data-variant={variant} onClick={onClick}>{children}</button>
    )
  };
});

describe("ApiExample", () => {
  const mockSuccessResponse = {
    data: {
      page: {
        id: "page1",
        slug: "contacts",
        title: "Контакты",
        description: "Страница контактов",
        isActive: true,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-02T00:00:00Z",
        sections: [
          {
            id: "section1",
            pageId: "page1",
            type: "welcome",
            order: 1,
            content: {
              title: "Приветствие",
              description: "Добро пожаловать на страницу контактов"
            },
            isActive: true,
            createdAt: "2023-01-01T00:00:00Z",
            updatedAt: "2023-01-02T00:00:00Z"
          }
        ]
      }
    }
  };

  const mockErrorResponse = {
    errors: [{ message: "Ошибка загрузки данных" }]
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("должен отображать загрузку при начальном рендеринге", () => {
    // Мокаем fetch для бесконечной загрузки
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}));
    
    render(<ApiExample />);
    
    expect(screen.getByText("Загрузка данных...")).toBeInTheDocument();
  });

  it("должен успешно загружать и отображать данные страницы", async () => {
    // Мокаем успешный ответ fetch
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse
    } as Response);
    
    render(<ApiExample />);
    
    // Проверяем, что компонент сначала показывает состояние загрузки
    expect(screen.getByText("Загрузка данных...")).toBeInTheDocument();
    
    // Ждем, пока данные загрузятся
    await waitFor(() => {
      expect(screen.queryByText("Загрузка данных...")).not.toBeInTheDocument();
    });
    
    // Проверяем, что данные страницы отображаются
    // Используем более конкретный селектор для заголовка страницы
    expect(screen.getByRole("heading", { level: 2, name: "Контакты" })).toBeInTheDocument();
    expect(screen.getByText("Приветствие")).toBeInTheDocument();
    expect(screen.getByText("Добро пожаловать на страницу контактов")).toBeInTheDocument();
  });

  it("должен обрабатывать ошибки при загрузке данных", async () => {
    // Мокаем ответ fetch с ошибкой
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockErrorResponse
    } as Response);
    
    render(<ApiExample />);
    
    // Ждем, пока компонент обработает ошибку
    await waitFor(() => {
      expect(screen.getByText(/Ошибка: Ошибка загрузки данных/)).toBeInTheDocument();
    });
  });

  it("должен переключаться между страницами при изменении выбора", async () => {
    // Мокаем первый успешный ответ fetch для "contacts"
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse
    } as Response);
    
    // Мокаем второй успешный ответ fetch для "about"
    const aboutResponse = {
      data: {
        page: {
          ...mockSuccessResponse.data.page,
          slug: "about",
          title: "О компании"
        }
      }
    };
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => aboutResponse
    } as Response);
    
    render(<ApiExample />);
    
    // Ждем, пока загрузятся начальные данные
    await waitFor(() => {
      expect(screen.queryByText("Загрузка данных...")).not.toBeInTheDocument();
    });
    
    // Проверяем, что отображаются данные для "contacts" (используем более конкретный селектор)
    expect(screen.getByRole("heading", { level: 2, name: "Контакты" })).toBeInTheDocument();
    
    // Кликаем на Select для изменения страницы
    fireEvent.click(screen.getByTestId("select"));
    
    // Ждем, пока загрузятся новые данные
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 2, name: "О компании" })).toBeInTheDocument();
    });
    
    // Проверяем, что fetch был вызван дважды с разными параметрами
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("должен переключаться между режимами отображения JSON и визуализации", async () => {
    // Мокаем успешный ответ fetch
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse
    } as Response);
    
    render(<ApiExample />);
    
    // Ждем, пока данные загрузятся
    await waitFor(() => {
      expect(screen.queryByText("Загрузка данных...")).not.toBeInTheDocument();
    });
    
    // Проверяем, что по умолчанию показывается визуализация
    expect(screen.getByText("Показать JSON")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Контакты" })).toBeInTheDocument();
    
    // Кликаем на кнопку для переключения режима
    fireEvent.click(screen.getByTestId("button"));
    
    // Проверяем, что режим отображения изменился на JSON
    expect(screen.getByText("Показать визуализацию")).toBeInTheDocument();
    expect(screen.getByText(/"id": "page1"/)).toBeInTheDocument();
    
    // Кликаем снова для возврата к визуализации
    fireEvent.click(screen.getByTestId("button"));
    
    // Проверяем, что режим отображения вернулся к визуализации
    expect(screen.getByText("Показать JSON")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Контакты" })).toBeInTheDocument();
  });
}); 