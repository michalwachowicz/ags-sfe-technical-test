import { useEffect, useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Product } from "@/types";

const CARD_HEIGHT = 280;
const CARD_WIDTH = 256;
const GAP = 16;
const CONTAINER_PADDING = 32;
const ROW_HEIGHT = CARD_HEIGHT + GAP;

export function useVirtualizedGrid(products: Product[]) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      if (parentRef.current) {
        const width = parentRef.current.clientWidth;
        const cols = Math.max(
          1,
          Math.floor((width - CONTAINER_PADDING) / CARD_WIDTH)
        );
        setColumns(cols);
      }
    };

    updateColumns();
    const resizeObserver = new ResizeObserver(updateColumns);
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const rowCount = Math.ceil(products.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 2,
  });

  return {
    parentRef,
    columns,
    virtualizer,
    GAP,
  };
}
