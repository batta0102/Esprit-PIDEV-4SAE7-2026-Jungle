package tn.esprit.ressources.Entites;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonAlias({"id", "idOrder"})
    @Column(name = "id_order")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "order_date", nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "address")
    private String address;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "user_email")
    private String userEmail;

    @JsonManagedReference
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @JsonManagedReference
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Delivery> deliveries = new ArrayList<>();

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    @JsonProperty("idOrder")
    public Long getIdOrder() {
        return id;
    }

    @JsonProperty("idOrder")
    public void setIdOrder(Long idOrder) {
        this.id = idOrder;
    }
}
