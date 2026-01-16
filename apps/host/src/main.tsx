import { useState } from "react";
import { createRoot } from "react-dom/client";
import ProductList from "products/ProductList";
import { ProductsApiProvider } from "products/ProductsApiContext";

function App() {
  const [showRatings, setShowRatings] = useState(false);

  return (
    <ProductsApiProvider>
      <div style={{ fontFamily: "system-ui, sans-serif", padding: 16 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 20 }}>Catalog Shell (Host)</h1>
          <small>Vite • Standalone Module Federation • React 19</small>
          <button onClick={() => setShowRatings(!showRatings)}>
            {showRatings ? "Hide Ratings" : "Show Ratings"}
          </button>
        </header>
        <main style={{ marginTop: 16 }}>
          <h1>Host Application</h1>
          <ProductList featureFlags={{ showRatings }} />
        </main>
      </div>
    </ProductsApiProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
