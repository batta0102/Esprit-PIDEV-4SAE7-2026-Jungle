package tn.esprit.ressources.RestController;

import jakarta.validation.Valid;
import lombok.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tn.esprit.ressources.Service.Interface.OrderService;
import tn.esprit.ressources.dto.order.CreateOrderRequest;
import tn.esprit.ressources.dto.order.OrderItemRequest;
import tn.esprit.ressources.dto.order.OrderItemResponse;
import tn.esprit.ressources.dto.order.OrderResponse;
import tn.esprit.ressources.exception.BadRequestException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request, @AuthenticationPrincipal Jwt jwt) {
        if (jwt != null) {
            request.setUserId(jwt.getSubject());
            if (request.getUserEmail() == null || request.getUserEmail().isBlank()) {
                request.setUserEmail(jwt.getClaimAsString("email"));
            }
            if (request.getAddress() == null || request.getAddress().isBlank()) {
                String claimAddress = jwt.getClaimAsString("address");
                request.setAddress(claimAddress != null && !claimAddress.isBlank() ? claimAddress : "N/A");
            }
        }
        return orderService.createOrder(request);
    }

    @GetMapping
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public OrderResponse getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @GetMapping("/user/{userId}")
    public List<OrderResponse> getOrdersByUserId(@PathVariable String userId) {
        return orderService.getOrdersByUserId(userId);
    }

    @PutMapping("/{id}/status")
    public OrderResponse updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return orderService.updateStatus(id, payload.get("status"));
    }

    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }

    // Legacy compatibility endpoints for existing admin frontend
    @PostMapping("/addOrder")
    public LegacyOrderResponse addOrderLegacy(@RequestBody LegacyOrderRequest request, @AuthenticationPrincipal Jwt jwt) {
        String resolvedUserId = request.getUserId() != null && !request.getUserId().isBlank() ? request.getUserId() : extractUserId(jwt);
        Long productId = request.getProduct() != null ? request.getProduct().getIdProduct() : null;

        if (productId == null) {
            throw new BadRequestException("product.idProduct is required");
        }

        int quantity = resolveQuantity(request);
        CreateOrderRequest createRequest = CreateOrderRequest.builder()
                .userId(resolvedUserId)
            .userEmail(extractEmail(jwt))
            .address(resolveAddress(request, jwt))
            .paymentMethod(request.getPaymentMethod())
                .items(List.of(OrderItemRequest.builder().productId(productId).quantity(quantity).build()))
                .build();

        return toLegacy(orderService.createOrder(createRequest), request.getPaymentMethod(), request.getAddress());
    }

    @GetMapping("/allOrders")
    public List<LegacyOrderResponse> getAllOrdersLegacy() {
        return orderService.getAllOrders().stream().map(this::toLegacy).toList();
    }

    @GetMapping("/getOrder/{id}")
    public LegacyOrderResponse getOrderLegacy(@PathVariable Long id) {
        return toLegacy(orderService.getOrderById(id));
    }

    @PutMapping("/updateOrder/{id}")
    public LegacyOrderResponse updateOrderLegacy(@PathVariable Long id, @RequestBody LegacyOrderRequest request) {
        OrderResponse updated = orderService.updateStatus(id, request.getStatus());
        return toLegacy(updated, request.getPaymentMethod(), request.getAddress());
    }

    @DeleteMapping("/deleteOrder/{id}")
    public void deleteOrderLegacy(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }

    private int resolveQuantity(LegacyOrderRequest request) {
        return 1;
    }

    private String extractUserId(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null) {
            return "anonymous";
        }
        return jwt.getSubject();
    }

    private String extractEmail(Jwt jwt) {
        return jwt == null ? null : jwt.getClaimAsString("email");
    }

    private String resolveAddress(LegacyOrderRequest request, Jwt jwt) {
        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            return request.getAddress();
        }
        if (jwt != null) {
            String claimAddress = jwt.getClaimAsString("address");
            if (claimAddress != null && !claimAddress.isBlank()) {
                return claimAddress;
            }
        }
        return "N/A";
    }

    private LegacyOrderResponse toLegacy(OrderResponse response) {
        return toLegacy(response, null, null);
    }

    private LegacyOrderResponse toLegacy(OrderResponse response, String paymentMethod, String address) {
        OrderItemResponse firstItem = response.getItems() != null && !response.getItems().isEmpty()
                ? response.getItems().get(0)
                : null;

        LegacyProductRef productRef = firstItem == null ? null : LegacyProductRef.builder()
                .idProduct(firstItem.getProductId())
                .name(firstItem.getProductName())
                .price(firstItem.getUnitPrice())
                .build();

        return LegacyOrderResponse.builder()
                .idOrder(response.getId())
            .totalAmount(response.getTotalAmount() != null ? response.getTotalAmount() : response.getTotalPrice())
                .status(response.getStatus())
                .orderDate(response.getCreatedAt())
            .paymentMethod(paymentMethod != null ? paymentMethod : response.getPaymentMethod())
            .address(address != null ? address : response.getAddress())
            .userEmail(response.getUserEmail())
                .product(productRef)
                .productName(firstItem != null ? firstItem.getProductName() : null)
                .build();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    private static class LegacyOrderRequest {
        private Long idOrder;
        private LegacyProductRef product;
        private Double totalAmount;
        private String status;
        private LocalDateTime orderDate;
        private String paymentMethod;
        private String address;
        private String userId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    private static class LegacyOrderResponse {
        private Long idOrder;
        private LegacyProductRef product;
        private Double totalAmount;
        private String status;
        private LocalDateTime orderDate;
        private String paymentMethod;
        private String address;
        private String userEmail;
        private String productName;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    private static class LegacyProductRef {
        private Long idProduct;
        private String name;
        private Double price;
    }
}
