import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Select } from "@base-ui/react/select";
import { ProductCard } from "@/components/ProductCard/ProductCard";
import { useProducts, useVirtualizedGrid } from "@/hooks";
import { ChevronDownIcon, CrossIcon } from "@/assets/icons";
import styles from "./ProductList.module.scss";

type Props = { featureFlags?: { showRatings?: boolean } };

export default function ProductList({ featureFlags }: Props) {
  const {
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
  } = useProducts();

  const { parentRef, columns, virtualizer, GAP } =
    useVirtualizedGrid(filteredProducts);

  return (
    <div className={styles.container}>
      <div
        className={styles.filters}
        role='region'
        aria-label='Product filters'
      >
        <Input
          type='search'
          placeholder='Search products…'
          aria-label='Search products by name'
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          className={styles.searchInput}
        />

        <Select.Root
          value={category}
          onValueChange={(value) => setCategory(value ?? "all")}
        >
          <Select.Trigger
            aria-label='Filter by category'
            className={styles.selectTrigger}
          >
            <Select.Value>
              {category === "all"
                ? "All Categories"
                : category.charAt(0).toUpperCase() + category.slice(1)}
            </Select.Value>
            <Select.Icon>
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup className={styles.selectContent}>
                <Select.List>
                  {categories.map((c) => (
                    <Select.Item
                      key={c}
                      value={c}
                      className={styles.selectItem}
                    >
                      <Select.ItemText>
                        {c === "all"
                          ? "All Categories"
                          : c.charAt(0).toUpperCase() + c.slice(1)}
                      </Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>

        <Select.Root
          value={sort}
          onValueChange={(value) => setSort((value ?? "asc") as "asc" | "desc")}
        >
          <Select.Trigger
            aria-label='Sort by price'
            className={styles.selectTrigger}
          >
            <Select.Value>
              {sort === "asc" ? "Price: Low → High" : "Price: High → Low"}
            </Select.Value>
            <Select.Icon>
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup className={styles.selectContent}>
                <Select.List>
                  <Select.Item value='asc' className={styles.selectItem}>
                    <Select.ItemText>Price: Low → High</Select.ItemText>
                  </Select.Item>
                  <Select.Item value='desc' className={styles.selectItem}>
                    <Select.ItemText>Price: High → Low</Select.ItemText>
                  </Select.Item>
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>

        <Button
          onClick={resetFilters}
          className={styles.resetButton}
          aria-label='Reset all filters'
        >
          <CrossIcon />
          Reset
        </Button>
      </div>

      {!isLoading && (
        <div
          aria-live='polite'
          aria-atomic='true'
          className={styles.resultsCount}
        >
          Showing {filteredProducts.length} of {all.length} products
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>
          No products found. Try adjusting your filters.
        </div>
      ) : (
        <div
          ref={parentRef}
          className={styles.productGrid}
          role='list'
          aria-label='Product list'
        >
          <div
            className={styles.virtualContainer}
            style={{
              height: `${virtualizer.getTotalSize()}px`,
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow: any) => {
              const startIndex = virtualRow.index * columns;
              const endIndex = Math.min(
                startIndex + columns,
                filteredProducts.length
              );
              const rowProducts = filteredProducts.slice(startIndex, endIndex);

              return (
                <div
                  key={virtualRow.index}
                  className={styles.virtualRow}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: `${GAP}px`,
                  }}
                >
                  {rowProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showRating={featureFlags?.showRatings}
                    />
                  ))}
                  {Array.from({ length: columns - rowProducts.length }).map(
                    (_, i) => (
                      <div key={`empty-${i}`} />
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
