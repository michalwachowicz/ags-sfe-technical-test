import { createRoot } from "react-dom/client";
import ProductList from "@/components/ProductList/ProductList";
import { ProductsApiProvider } from "./components/ProductsApiContext";

function DevPage() {
  return (
    <ProductsApiProvider>
      <div style={{ fontFamily: "system-ui, sans-serif", padding: 16 }}>
        <h1 style={{ fontSize: 20 }}>Remote Products (Dev Playground)</h1>
        <ProductList featureFlags={{ showRatings: true }} />
      </div>
    </ProductsApiProvider>
  );
}

createRoot(document.getElementById("root")!).render(<DevPage />);
