declare module "products/ProductList" {
  import * as React from "react";
  interface Flags {
    showRatings?: boolean;
  }
  const Component: React.ComponentType<{ featureFlags?: Flags }>;
  export default Component;
}

declare module "products/ProductsApiContext" {
  import * as React from "react";
  export function ProductsApiProvider({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement;
  export function useProductsApi(): { loaded: boolean };
}
