import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Virtualizer } from "@tanstack/react-virtual";
import ProductList from "@/components/ProductList/ProductList";
import * as useProductsHook from "@/hooks/useProducts";
import * as useVirtualizedGridHook from "@/hooks/useVirtualizedGrid";
import * as mswBrowser from "@/msw/browser";

vi.mock("@/hooks/useProducts");
vi.mock("@/hooks/useVirtualizedGrid");
vi.mock("@/msw/browser", () => ({
  startWorker: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/components/ProductCard/ProductCard", () => ({
  ProductCard: ({ product }: { product: { id: string; name: string } }) => (
    <div data-testid={`product-card-${product.id}`}>{product.name}</div>
  ),
}));

const mockUseProducts = vi.mocked(useProductsHook.useProducts);
const mockUseVirtualizedGrid = vi.mocked(
  useVirtualizedGridHook.useVirtualizedGrid
);

const mockProducts = [
  {
    id: "1",
    name: "Product One",
    price: 10.99,
    category: "electronics",
    rating: 4.5,
    image: "https://example.com/1.jpg",
  },
  {
    id: "2",
    name: "Product Two",
    price: 20.99,
    category: "home",
    rating: 4.0,
    image: "https://example.com/2.jpg",
  },
  {
    id: "3",
    name: "Product Three",
    price: 15.99,
    category: "electronics",
    rating: 4.8,
    image: "https://example.com/3.jpg",
  },
];

describe("ProductList", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockGetVirtualItems = () => [
      {
        index: 0,
        start: 0,
        end: 296,
        lane: 0,
        size: 296,
        key: "0",
      },
    ];
    mockGetVirtualItems.updateDeps = vi.fn();

    const mockVirtualizer: Partial<Virtualizer<HTMLDivElement, Element>> = {
      getTotalSize: () => 1000,
      getVirtualItems: mockGetVirtualItems,
    };

    mockUseVirtualizedGrid.mockReturnValue({
      parentRef: { current: null },
      columns: 4,
      virtualizer: mockVirtualizer as Virtualizer<HTMLDivElement, Element>,
      GAP: 16,
    });
  });

  it("renders loading state", () => {
    mockUseProducts.mockReturnValue({
      all: [],
      filteredProducts: [],
      categories: ["all"],
      isLoading: true,
      query: "",
      category: "all",
      sort: "asc",
      setQuery: vi.fn(),
      setCategory: vi.fn(),
      setSort: vi.fn(),
      resetFilters: vi.fn(),
    });

    render(<ProductList />);

    expect(screen.getByText("Loading products...")).toBeInTheDocument();
  });

  it("renders empty state when no products", () => {
    mockUseProducts.mockReturnValue({
      all: [],
      filteredProducts: [],
      categories: ["all"],
      isLoading: false,
      query: "",
      category: "all",
      sort: "asc",
      setQuery: vi.fn(),
      setCategory: vi.fn(),
      setSort: vi.fn(),
      resetFilters: vi.fn(),
    });

    render(<ProductList />);

    expect(
      screen.getByText("No products found. Try adjusting your filters.")
    ).toBeInTheDocument();
  });

  it("renders products when available", () => {
    mockUseProducts.mockReturnValue({
      all: mockProducts,
      filteredProducts: mockProducts,
      categories: ["all", "electronics", "home"],
      isLoading: false,
      query: "",
      category: "all",
      sort: "asc",
      setQuery: vi.fn(),
      setCategory: vi.fn(),
      setSort: vi.fn(),
      resetFilters: vi.fn(),
    });

    render(<ProductList />);

    expect(screen.getByText("Product One")).toBeInTheDocument();
    expect(screen.getByText("Product Two")).toBeInTheDocument();
    expect(screen.getByText("Product Three")).toBeInTheDocument();
  });

  it("displays results count", () => {
    mockUseProducts.mockReturnValue({
      all: mockProducts,
      filteredProducts: mockProducts,
      categories: ["all", "electronics", "home"],
      isLoading: false,
      query: "",
      category: "all",
      sort: "asc",
      setQuery: vi.fn(),
      setCategory: vi.fn(),
      setSort: vi.fn(),
      resetFilters: vi.fn(),
    });

    render(<ProductList />);

    expect(screen.getByText("Showing 3 of 3 products")).toBeInTheDocument();
  });

  it("renders search input", () => {
    mockUseProducts.mockReturnValue({
      all: mockProducts,
      filteredProducts: mockProducts,
      categories: ["all", "electronics", "home"],
      isLoading: false,
      query: "",
      category: "all",
      sort: "asc",
      setQuery: vi.fn(),
      setCategory: vi.fn(),
      setSort: vi.fn(),
      resetFilters: vi.fn(),
    });

    render(<ProductList />);

    const searchInput = screen.getByPlaceholderText("Search products…");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute(
      "aria-label",
      "Search products by name"
    );
  });

  it("calls setQuery when search input changes", async () => {
    const user = userEvent.setup();
    const setQuery = vi.fn();

    mockUseProducts.mockReturnValue({
      all: mockProducts,
      filteredProducts: mockProducts,
      categories: ["all", "electronics", "home"],
      isLoading: false,
      query: "",
      category: "all",
      sort: "asc",
      setQuery,
      setCategory: vi.fn(),
      setSort: vi.fn(),
      resetFilters: vi.fn(),
    });

    render(<ProductList />);

    const searchInput = screen.getByPlaceholderText("Search products…");
    await user.type(searchInput, "test");

    expect(setQuery).toHaveBeenCalled();
  });

  it("calls resetFilters when reset button is clicked", async () => {
    const user = userEvent.setup();
    const resetFilters = vi.fn();

    mockUseProducts.mockReturnValue({
      all: mockProducts,
      filteredProducts: mockProducts,
      categories: ["all", "electronics", "home"],
      isLoading: false,
      query: "",
      category: "all",
      sort: "asc",
      setQuery: vi.fn(),
      setCategory: vi.fn(),
      setSort: vi.fn(),
      resetFilters,
    });

    render(<ProductList />);

    const resetButton = screen.getByLabelText("Reset all filters");
    await user.click(resetButton);

    expect(resetFilters).toHaveBeenCalled();
  });

  it("renders with feature flags", () => {
    mockUseProducts.mockReturnValue({
      all: mockProducts,
      filteredProducts: mockProducts,
      categories: ["all", "electronics", "home"],
      isLoading: false,
      query: "",
      category: "all",
      sort: "asc",
      setQuery: vi.fn(),
      setCategory: vi.fn(),
      setSort: vi.fn(),
      resetFilters: vi.fn(),
    });

    render(<ProductList featureFlags={{ showRatings: true }} />);

    expect(screen.getByText("Product One")).toBeInTheDocument();
  });

  it("has correct accessibility attributes", () => {
    mockUseProducts.mockReturnValue({
      all: mockProducts,
      filteredProducts: mockProducts,
      categories: ["all", "electronics", "home"],
      isLoading: false,
      query: "",
      category: "all",
      sort: "asc",
      setQuery: vi.fn(),
      setCategory: vi.fn(),
      setSort: vi.fn(),
      resetFilters: vi.fn(),
    });

    render(<ProductList />);

    const filtersRegion = screen.getByRole("region", {
      name: "Product filters",
    });
    expect(filtersRegion).toBeInTheDocument();

    const productList = screen.getByRole("list", { name: "Product list" });
    expect(productList).toBeInTheDocument();
  });

  it("mocks startWorker and verifies it can be called", () => {
    const mockStartWorker = vi.mocked(mswBrowser.startWorker);
    mockStartWorker.mockClear();

    expect(mockStartWorker).toBeDefined();
    expect(typeof mockStartWorker).toBe("function");

    mockStartWorker();

    expect(mockStartWorker).toHaveBeenCalled();
    expect(mockStartWorker).toHaveBeenCalledTimes(1);
  });
});
