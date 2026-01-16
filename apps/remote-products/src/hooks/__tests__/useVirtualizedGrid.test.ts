import { renderHook } from "@testing-library/react";
import { useVirtualizedGrid } from "@/hooks/useVirtualizedGrid";
import * as reactVirtual from "@tanstack/react-virtual";
import type { Product } from "@/types";

vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: vi.fn((config) => ({
    getTotalSize: () => config.count * config.estimateSize(),
    getVirtualItems: () => [],
  })),
}));

const mockProducts: Product[] = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  name: `Product ${i + 1}`,
  price: 10 + i,
  category: "test",
  rating: 4.0,
  image: `https://example.com/${i + 1}.jpg`,
}));

describe("useVirtualizedGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useVirtualizedGrid(mockProducts));

    expect(result.current.columns).toBe(4);
    expect(result.current.parentRef).toBeDefined();
    expect(result.current.parentRef.current).toBeNull();
    expect(result.current.GAP).toBe(16);
    expect(result.current.virtualizer).toBeDefined();
  });

  it("returns parentRef that can be attached to DOM element", () => {
    const { result } = renderHook(() => useVirtualizedGrid(mockProducts));

    const div = document.createElement("div");
    result.current.parentRef.current = div;

    expect(result.current.parentRef.current).toBe(div);
  });

  it("calculates row count based on products and columns", () => {
    const { result } = renderHook(() => useVirtualizedGrid(mockProducts));

    const expectedRows = Math.ceil(
      mockProducts.length / result.current.columns
    );
    expect(expectedRows).toBe(5);
  });

  it("handles empty products array", () => {
    const { result } = renderHook(() => useVirtualizedGrid([]));

    expect(result.current.columns).toBe(4);
    expect(result.current.parentRef).toBeDefined();
  });

  it("returns constant GAP value", () => {
    const { result } = renderHook(() => useVirtualizedGrid(mockProducts));

    expect(result.current.GAP).toBe(16);
  });

  it("creates virtualizer with correct configuration", () => {
    const useVirtualizerSpy = vi.mocked(reactVirtual.useVirtualizer);

    renderHook(() => useVirtualizedGrid(mockProducts));

    expect(useVirtualizerSpy).toHaveBeenCalled();
    const config = useVirtualizerSpy.mock.calls[0][0];

    expect(config.overscan).toBe(2);
    expect(typeof config.estimateSize).toBe("function");
    expect(config.estimateSize(0)).toBe(296);
  });

  it("updates columns when parentRef width changes", () => {
    const { result } = renderHook(() => useVirtualizedGrid(mockProducts));

    const div = document.createElement("div");
    Object.defineProperty(div, "clientWidth", {
      writable: true,
      configurable: true,
      value: 1000,
    });
    result.current.parentRef.current = div;

    const resizeObserver = new ResizeObserver(() => {});
    resizeObserver.observe(div);

    const event = new Event("resize");
    div.dispatchEvent(event);

    expect(result.current.columns).toBeGreaterThanOrEqual(1);
  });

  it("handles single product", () => {
    const singleProduct: Product[] = [
      {
        id: "1",
        name: "Single Product",
        price: 10,
        category: "test",
        rating: 4.0,
        image: "https://example.com/1.jpg",
      },
    ];

    const { result } = renderHook(() => useVirtualizedGrid(singleProduct));

    expect(result.current.columns).toBe(4);
    const expectedRows = Math.ceil(
      singleProduct.length / result.current.columns
    );
    expect(expectedRows).toBe(1);
  });

  it("handles large product arrays", () => {
    const largeProductArray: Product[] = Array.from(
      { length: 1000 },
      (_, i) => ({
        id: String(i + 1),
        name: `Product ${i + 1}`,
        price: 10 + i,
        category: "test",
        rating: 4.0,
        image: `https://example.com/${i + 1}.jpg`,
      })
    );

    const { result } = renderHook(() => useVirtualizedGrid(largeProductArray));

    expect(result.current.columns).toBe(4);
    const expectedRows = Math.ceil(
      largeProductArray.length / result.current.columns
    );
    expect(expectedRows).toBe(250);
  });
});
