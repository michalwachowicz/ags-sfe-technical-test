import { renderHook, waitFor, act } from "@testing-library/react";
import { useProducts } from "@/hooks/useProducts";
import * as mswBrowser from "@/msw/browser";
import type { Product } from "@/types";

vi.mock("@/msw/browser", () => ({
  startWorker: vi.fn().mockResolvedValue(undefined),
}));

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Laptop",
    price: 999.99,
    category: "electronics",
    rating: 4.5,
    image: "https://example.com/laptop.jpg",
  },
  {
    id: "2",
    name: "Coffee Maker",
    price: 49.99,
    category: "kitchen",
    rating: 4.2,
    image: "https://example.com/coffee.jpg",
  },
  {
    id: "3",
    name: "Desk Chair",
    price: 199.99,
    category: "office",
    rating: 4.8,
    image: "https://example.com/chair.jpg",
  },
  {
    id: "4",
    name: "Wireless Mouse",
    price: 29.99,
    category: "electronics",
    rating: 4.0,
    image: "https://example.com/mouse.jpg",
  },
];

describe("useProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("initializes with loading state and empty products", () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    const { result } = renderHook(() => useProducts());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.all).toEqual([]);
    expect(result.current.filteredProducts).toEqual([]);
    expect(result.current.query).toBe("");
    expect(result.current.category).toBe("all");
    expect(result.current.sort).toBe("asc");
  });

  it("fetches products and updates state", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    } as Response);
    global.fetch = mockFetch;

    const { result } = renderHook(() => useProducts());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mswBrowser.startWorker).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith("/api/products");
    expect(result.current.all).toEqual(mockProducts);
    expect(result.current.filteredProducts).toEqual(
      [...mockProducts].sort((a, b) => a.price - b.price)
    );
  });

  it("extracts unique categories from products", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    } as Response);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toContain("all");
    expect(result.current.categories).toContain("electronics");
    expect(result.current.categories).toContain("kitchen");
    expect(result.current.categories).toContain("office");
    expect(result.current.categories.length).toBe(4);
  });

  it("filters products by category", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    } as Response);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setCategory("electronics");
    });

    await waitFor(() => {
      expect(result.current.filteredProducts.length).toBe(2);
      expect(
        result.current.filteredProducts.every(
          (p) => p.category === "electronics"
        )
      ).toBe(true);
    });
  });

  it("filters products by search query", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    } as Response);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setQuery("laptop");
    });

    await waitFor(() => {
      expect(result.current.filteredProducts.length).toBe(1);
      expect(result.current.filteredProducts[0].name).toBe("Laptop");
    });
  });

  it("filters products by search query case-insensitively", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    } as Response);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setQuery("LAPTOP");
    });

    await waitFor(() => {
      expect(result.current.filteredProducts.length).toBe(1);
      expect(result.current.filteredProducts[0].name).toBe("Laptop");
    });
  });

  it("combines category and query filters", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    } as Response);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setCategory("electronics");
      result.current.setQuery("mouse");
    });

    await waitFor(() => {
      expect(result.current.filteredProducts.length).toBe(1);
      expect(result.current.filteredProducts[0].name).toBe("Wireless Mouse");
    });
  });

  it("sorts products by price ascending", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    } as Response);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setSort("asc");
    });

    await waitFor(() => {
      const prices = result.current.filteredProducts.map((p) => p.price);
      expect(prices).toEqual([29.99, 49.99, 199.99, 999.99]);
    });
  });

  it("sorts products by price descending", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    } as Response);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setSort("desc");
    });

    await waitFor(() => {
      const prices = result.current.filteredProducts.map((p) => p.price);
      expect(prices).toEqual([999.99, 199.99, 49.99, 29.99]);
    });
  });

  it("resets all filters to default values", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    } as Response);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setQuery("laptop");
      result.current.setCategory("electronics");
      result.current.setSort("desc");
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.query).toBe("");
    expect(result.current.category).toBe("all");
    expect(result.current.sort).toBe("asc");
  });

  it("handles fetch errors gracefully", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(result.current.all).toEqual([]);
    expect(result.current.filteredProducts).toEqual([]);

    consoleErrorSpy.mockRestore();
  });

  it("handles HTTP error responses", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(result.current.all).toEqual([]);

    consoleErrorSpy.mockRestore();
  });

  it("trims whitespace from search query", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    } as Response);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setQuery("  laptop  ");
    });

    await waitFor(() => {
      expect(result.current.filteredProducts.length).toBe(1);
      expect(result.current.filteredProducts[0].name).toBe("Laptop");
    });
  });
});
