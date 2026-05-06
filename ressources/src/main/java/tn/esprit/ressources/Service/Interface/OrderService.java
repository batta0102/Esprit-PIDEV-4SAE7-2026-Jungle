package tn.esprit.ressources.Service.Interface;

import tn.esprit.ressources.dto.order.CreateOrderRequest;
import tn.esprit.ressources.dto.order.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest request);
    List<OrderResponse> getAllOrders();
    OrderResponse getOrderById(Long id);
    List<OrderResponse> getOrdersByUserId(String userId);
    OrderResponse updateStatus(Long id, String status);
    void deleteOrder(Long id);
}
