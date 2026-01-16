import type { Product } from "@/types";
import styles from "./ProductCard.module.scss";

type ProductCardProps = {
  product: Product;
  showRating?: boolean;
};

export function ProductCard({ product, showRating }: ProductCardProps) {
  return (
    <article className={styles.card} role='listitem'>
      <div className={styles.imageContainer}>
        <img
          src={product.image}
          alt={product.name}
          className={styles.image}
          loading='lazy'
        />
      </div>
      <div className={styles.content}>
        <div>
          <h3 className={styles.title}>{product.name}</h3>
          <div className={styles.category}>{product.category}</div>
        </div>
        <div>
          {showRating && (
            <div className={styles.rating}>
              <span aria-label={`Rating: ${product.rating} out of 5`}>
                ⭐ {product.rating.toFixed(1)}
              </span>
            </div>
          )}
          <div className={styles.price}>${product.price.toFixed(2)}</div>
        </div>
      </div>
    </article>
  );
}
