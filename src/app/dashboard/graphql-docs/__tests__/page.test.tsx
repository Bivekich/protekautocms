import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import * as nextAuth from "next-auth";
import * as nextNavigation from "next/navigation";
import GraphQLDocsPage from "../page";

// Мок для next-auth
vi.mock("next-auth", async () => {
  const actual = await vi.importActual("next-auth");
  return {
    ...actual,
    getServerSession: vi.fn()
  };
});

// Мок для next/navigation
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation");
  return {
    ...actual,
    redirect: vi.fn()
  };
});

// Мок для TabsContent, поскольку это клиентский компонент
vi.mock("@/components/ui/tabs", async () => {
  const actual = await vi.importActual("@/components/ui/tabs");
  return {
    ...actual,
    Tabs: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs">{children}</div>,
    TabsContent: ({ children, value }: { children: React.ReactNode, value: string }) => (
      <div data-testid={`tabs-content-${value}`}>{children}</div>
    ),
    TabsList: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
    TabsTrigger: ({ children, value }: { children: React.ReactNode, value: string }) => (
      <button data-testid={`tabs-trigger-${value}`}>{children}</button>
    )
  };
});

// Мок для Accordion компонентов
vi.mock("@/components/ui/accordion", async () => {
  const actual = await vi.importActual("@/components/ui/accordion");
  return {
    ...actual,
    Accordion: ({ children }: { children: React.ReactNode }) => <div data-testid="accordion">{children}</div>,
    AccordionContent: ({ children }: { children: React.ReactNode }) => <div data-testid="accordion-content">{children}</div>,
    AccordionItem: ({ children, value }: { children: React.ReactNode, value: string }) => (
      <div data-testid={`accordion-item-${value}`}>{children}</div>
    ),
    AccordionTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="accordion-trigger">{children}</div>
  };
});

// Мок для Card компонентов
vi.mock("@/components/ui/card", async () => {
  const actual = await vi.importActual("@/components/ui/card");
  return {
    ...actual,
    Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
    CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
    CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children }: { children: React.ReactNode }) => <h3 data-testid="card-title">{children}</h3>,
    CardDescription: ({ children }: { children: React.ReactNode }) => <p data-testid="card-description">{children}</p>
  };
});

describe("GraphQLDocsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("должна перенаправлять на страницу входа, если пользователь не аутентифицирован", async () => {
    // Установка мока для getServerSession, возвращающего null (не аутентифицирован)
    vi.mocked(nextAuth.getServerSession).mockResolvedValue(null);
    
    await GraphQLDocsPage();
    
    // Проверяем, что функция redirect была вызвана с правильным путем
    expect(nextNavigation.redirect).toHaveBeenCalledWith("/auth/signin");
  });

  it("должна отображать компонент GraphQLDocsClient, если пользователь аутентифицирован", async () => {
    // Установка мока для getServerSession, возвращающего сессию (аутентифицирован)
    vi.mocked(nextAuth.getServerSession).mockResolvedValue({
      user: { name: "Test User", email: "test@example.com" },
      expires: new Date(Date.now() + 3600000).toISOString()
    });
    
    const { container } = render(await GraphQLDocsPage());
    
    // Проверяем наличие заголовка и элементов интерфейса
    expect(screen.getByText("Документация GraphQL")).toBeInTheDocument();
    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.getByTestId("tabs-trigger-basics")).toBeInTheDocument();
    expect(screen.getByTestId("tabs-trigger-queries")).toBeInTheDocument();
    expect(screen.getByTestId("tabs-trigger-mutations")).toBeInTheDocument();
    expect(screen.getByTestId("tabs-trigger-example")).toBeInTheDocument();
    
    // Проверяем содержимое вкладки "Основы"
    expect(screen.getByTestId("tabs-content-basics")).toBeInTheDocument();
    expect(screen.getByText("Основы GraphQL")).toBeInTheDocument();
    expect(screen.getByText("Конечная точка API")).toBeInTheDocument();
    expect(screen.getByText("POST /api/graphql")).toBeInTheDocument();
    
    // Проверяем содержимое вкладки "Запросы"
    expect(screen.getByTestId("tabs-content-queries")).toBeInTheDocument();
    expect(screen.getByText("GraphQL Запросы")).toBeInTheDocument();
    expect(screen.getByTestId("accordion-item-page")).toBeInTheDocument();
    expect(screen.getByTestId("accordion-item-products")).toBeInTheDocument();
    expect(screen.getByTestId("accordion-item-product")).toBeInTheDocument();
    expect(screen.getByTestId("accordion-item-categories")).toBeInTheDocument();
    
    // Проверяем содержимое вкладки "Мутации"
    expect(screen.getByTestId("tabs-content-mutations")).toBeInTheDocument();
    expect(screen.getByText("GraphQL Мутации")).toBeInTheDocument();
    expect(screen.getByTestId("accordion-item-create-order")).toBeInTheDocument();
    expect(screen.getByTestId("accordion-item-update-profile")).toBeInTheDocument();
    
    // Проверяем содержимое вкладки "Живой пример"
    expect(screen.getByTestId("tabs-content-example")).toBeInTheDocument();
    expect(screen.getByText("GraphQL Playground")).toBeInTheDocument();
    expect(screen.getByText("Пример запроса страницы")).toBeInTheDocument();
  });
}); 