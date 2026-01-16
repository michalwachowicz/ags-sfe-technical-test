import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { startWorker } from "@/msw/browser";

interface ProductsApiContextValue {
  loaded: boolean;
}

const ProductsApiContext = createContext<ProductsApiContextValue | undefined>(
  undefined
);

interface ProductsApiProviderProps {
  children: ReactNode;
}

export function ProductsApiProvider({ children }: ProductsApiProviderProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    startWorker()
      .then(() => {
        setLoaded(true);
      })
      .catch((error) => {
        console.error("Failed to start MSW worker:", error);
        setLoaded(false);
      });
  }, []);

  return (
    <ProductsApiContext.Provider value={{ loaded }}>
      {children}
    </ProductsApiContext.Provider>
  );
}

export function useProductsApi() {
  const context = useContext(ProductsApiContext);
  if (context === undefined) {
    throw new Error("useProductsApi must be used within a ProductsApiProvider");
  }
  return context;
}
