import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/ProductCard/ProductCard";
import type { Product } from "@/types";

const mockProduct: Product = {
  id: "1",
  name: "Test Product",
  price: 29.99,
  category: "electronics",
  rating: 4.5,
  image: "https://example.com/image.jpg",
};

describe("ProductCard", () => {
  it("renders product information correctly", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("electronics")).toBeInTheDocument();
    expect(screen.getByText("$29.99")).toBeInTheDocument();
    expect(screen.getByAltText("Test Product")).toBeInTheDocument();
  });

  it("displays rating when showRating is true", () => {
    render(<ProductCard product={mockProduct} showRating={true} />);

    expect(screen.getByLabelText("Rating: 4.5 out of 5")).toBeInTheDocument();
    expect(screen.getByText("⭐ 4.5")).toBeInTheDocument();
  });

  it("does not display rating when showRating is false", () => {
    render(<ProductCard product={mockProduct} showRating={false} />);

    expect(
      screen.queryByLabelText("Rating: 4.5 out of 5")
    ).not.toBeInTheDocument();
  });

  it("does not display rating when showRating is undefined", () => {
    render(<ProductCard product={mockProduct} />);

    expect(
      screen.queryByLabelText("Rating: 4.5 out of 5")
    ).not.toBeInTheDocument();
  });

  it("formats price correctly with two decimal places", () => {
    const productWithDecimalPrice: Product = {
      ...mockProduct,
      price: 19.9,
    };

    render(<ProductCard product={productWithDecimalPrice} />);

    expect(screen.getByText("$19.90")).toBeInTheDocument();
  });

  it("has correct accessibility attributes", () => {
    render(<ProductCard product={mockProduct} />);

    const card = screen.getByRole("listitem");
    expect(card).toBeInTheDocument();
  });

  it("renders image with correct attributes", () => {
    render(<ProductCard product={mockProduct} />);

    const image = screen.getByAltText("Test Product");
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
    expect(image).toHaveAttribute("loading", "lazy");
  });
});
