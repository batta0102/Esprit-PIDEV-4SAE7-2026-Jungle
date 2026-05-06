package tn.esprit.ressources.Repository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.esprit.ressources.Entites.Product;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p.idProduct as productId, " +
           "p.name as productName, " +
           "p.category as productCategory, " +
           "COUNT(oi.id) as ordersCount " +
           "FROM Product p " +
           "LEFT JOIN OrderItem oi ON oi.productId = p.idProduct " +
           "GROUP BY p.idProduct, p.name, p.category " +
           "ORDER BY COUNT(oi.id) DESC")
    List<ProductRecommendationProjection> findTop3MostOrderedProducts(Pageable pageable);
}
