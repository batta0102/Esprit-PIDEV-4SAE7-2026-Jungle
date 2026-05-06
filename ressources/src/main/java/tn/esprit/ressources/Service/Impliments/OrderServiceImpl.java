package tn.esprit.ressources.Service.Impliments;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.ressources.Entites.Order;
import tn.esprit.ressources.Entites.OrderItem;
import tn.esprit.ressources.Repository.DeliveryRepository;
import tn.esprit.ressources.Repository.OrderRepository;
import tn.esprit.ressources.Service.Interface.OrderService;
import tn.esprit.ressources.client.ProductClient;
import tn.esprit.ressources.dto.order.CreateOrderRequest;
import tn.esprit.ressources.dto.order.OrderItemRequest;
import tn.esprit.ressources.dto.order.OrderItemResponse;
import tn.esprit.ressources.dto.order.OrderResponse;
import tn.esprit.ressources.dto.product.ProductResponse;
import tn.esprit.ressources.exception.BadRequestException;
import tn.esprit.ressources.exception.NotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final DeliveryRepository deliveryRepository;
    private final ProductClient productClient;

    @Override
    public OrderResponse createOrder(CreateOrderRequest request) {
        validateCreateRequest(request);

        Order order = Order.builder()
                .userId(request.getUserId())
                .createdAt(LocalDateTime.now())
                .status("PENDING")
                .totalPrice(0.0)
            .totalAmount(0.0)
            .address(request.getAddress())
            .paymentMethod(request.getPaymentMethod())
            .userEmail(request.getUserEmail())
                .build();

        double total = 0.0;

        for (OrderItemRequest itemRequest : request.getItems()) {
            if (itemRequest.getQuantity() == null || itemRequest.getQuantity() <= 0) {
                throw new BadRequestException("quantity must be greater than 0 for productId=" + itemRequest.getProductId());
            }

            ProductResponse product = fetchProduct(itemRequest.getProductId());
                Long resolvedProductId = product.getId();
                if (resolvedProductId == null) {
                throw new BadRequestException("Product response does not contain an id for requested product=" + itemRequest.getProductId());
                }
            double unitPrice = product.getPrice();
            double subtotal = unitPrice * itemRequest.getQuantity();

            OrderItem item = OrderItem.builder()
                    .productId(resolvedProductId)
                    .productName(product.getName())
                    .unitPrice(unitPrice)
                    .quantity(itemRequest.getQuantity())
                    .subtotal(subtotal)
                    .build();

            order.addItem(item);
            total += subtotal;
        }

        order.setTotalPrice(total);
        order.setTotalAmount(total);
        Order saved = orderRepository.save(order);

        return toOrderResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::toOrderResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found with id=" + id));

        return toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(String userId) {
        return orderRepository.findByUserId(userId)
                .stream()
                .map(this::toOrderResponse)
                .toList();
    }

    @Override
    public OrderResponse updateStatus(Long id, String status) {
        if (status == null || status.isBlank()) {
            throw new BadRequestException("status must not be blank");
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found with id=" + id));

        order.setStatus(status.trim().toUpperCase());
        Order updated = orderRepository.save(order);

        return toOrderResponse(updated);
    }

    @Override
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new NotFoundException("Order not found with id=" + id);
        }
        deliveryRepository.deleteByOrder_Id(id);
        orderRepository.deleteById(id);
    }

    private void validateCreateRequest(CreateOrderRequest request) {
        if (request == null) {
            throw new BadRequestException("request body is required");
        }
        if (request.getUserId() == null) {
            throw new BadRequestException("userId is required");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("items list must not be empty");
        }
    }

    private ProductResponse fetchProduct(Long productId) {
        if (productId == null) {
            throw new BadRequestException("productId is required");
        }

        try {
            ProductResponse product = productClient.getProductById(productId);
            if (product == null) {
                throw new NotFoundException("Product not found with id=" + productId);
            }
            if (product.getPrice() == null) {
                throw new BadRequestException("Product price is missing for id=" + productId);
            }
            return product;
        } catch (FeignException.NotFound ex) {
            throw new NotFoundException("Product not found with id=" + productId);
        } catch (FeignException ex) {
            throw new BadRequestException("Failed to fetch product id=" + productId + ": " + ex.getMessage());
        }
    }

    private OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .createdAt(order.getCreatedAt())
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
            .totalAmount(order.getTotalAmount())
            .address(order.getAddress())
            .paymentMethod(order.getPaymentMethod())
            .userEmail(order.getUserEmail())
                .items(items)
                .build();
    }
}
