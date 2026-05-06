package tn.esprit.ressources.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.ressources.Entites.Order;

import java.util.List;
@Repository

public interface OrderRepository extends JpaRepository<Order, Long> {
	List<Order> findByUserId(String userId);
}
