package tn.esprit.ressources.dto.order;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private String userId;
    private LocalDateTime createdAt;
    private String status;
    private Double totalPrice;
    private Double totalAmount;
    private String address;
    private String paymentMethod;
    private String userEmail;
    private List<OrderItemResponse> items;
}
