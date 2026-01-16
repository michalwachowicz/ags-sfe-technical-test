import { useEffect, useMemo, useState } from "react";
import { useProductsApi } from "@/components/ProductsApiContext";
import type { Product } from "@/types";

export function useProducts() {
  const [all, setAll] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(true);
  const { loaded } = useProductsApi();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!loaded) return;

      try {
        setIsLoading(true);
        const res = await fetch("/api/products");

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setAll(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [loaded]);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(all.map((p) => p.category)))],
    [all]
  );

  const filteredProducts = useMemo(() => {
    let filtered = [...all];

    if (category !== "all") {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (query.trim()) {
      const searchLower = query.toLowerCase().trim();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => {
      return sort === "asc" ? a.price - b.price : b.price - a.price;
    });

    return filtered;
  }, [all, category, query, sort]);

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setSort("asc");
  };

  return {
    all,
    filteredProducts,
    categories,
    isLoading,
    query,
    category,
    sort,
    setQuery,
    setCategory,
    setSort,
    resetFilters,
  };
}
