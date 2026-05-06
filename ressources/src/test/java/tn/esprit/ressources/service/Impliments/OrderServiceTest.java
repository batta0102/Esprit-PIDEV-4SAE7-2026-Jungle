package tn.esprit.ressources.Service.Impliments;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import feign.FeignException;
import feign.Request;
import feign.Response;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.ressources.Entites.Order;
import tn.esprit.ressources.Entites.OrderItem;
import tn.esprit.ressources.Repository.DeliveryRepository;
import tn.esprit.ressources.Repository.OrderRepository;
import tn.esprit.ressources.client.ProductClient;
import tn.esprit.ressources.dto.order.CreateOrderRequest;
import tn.esprit.ressources.dto.order.OrderItemRequest;
import tn.esprit.ressources.dto.order.OrderResponse;
import tn.esprit.ressources.dto.product.ProductResponse;
import tn.esprit.ressources.exception.BadRequestException;
import tn.esprit.ressources.exception.NotFoundException;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private ProductClient productClient;

    @InjectMocks
    private OrderServiceImpl orderService;

    private CreateOrderRequest request;
    private ProductResponse productResponse;
    private Order order;

    @BeforeEach
    void setUp() {
        request = CreateOrderRequest.builder()
                .userId("user-1")
                .userEmail("user@example.com")
                .address("Campus")
                .paymentMethod("CARD")
                .items(List.of(
                        OrderItemRequest.builder().productId(1L).quantity(2).build(),
                        OrderItemRequest.builder().productId(2L).quantity(1).build()
                ))
                .build();

        productResponse = ProductResponse.builder()
                .id(1L)
                .name("Notebook")
                .category("Stationery")
                .description("A useful notebook for tests.")
                .stock(20)
                .price(12.5)
                .build();

        order = Order.builder()
                .id(100L)
                .userId("user-1")
                .createdAt(java.time.LocalDateTime.now())
                .status("PENDING")
                .totalPrice(25.0)
                .totalAmount(25.0)
                .address("Campus")
                .paymentMethod("CARD")
                .userEmail("user@example.com")
                .build();

        OrderItem item = OrderItem.builder()
                .id(1L)
                .productId(1L)
                .productName("Notebook")
                .unitPrice(12.5)
                .quantity(2)
                .subtotal(25.0)
                .build();
        order.addItem(item);
    }

    @Test
    void shouldCreateOrder() {
        when(productClient.getProductById(1L)).thenReturn(productResponse);
        when(productClient.getProductById(2L)).thenReturn(ProductResponse.builder()
                .id(2L)
                .name("Pen")
                .category("Stationery")
                .description("A useful pen for tests.")
                .stock(30)
                .price(5.0)
                .build());
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse result = orderService.createOrder(request);

        assertNotNull(result);
        assertEquals("user-1", result.getUserId());
        assertEquals(30.0, result.getTotalPrice());
        assertEquals(30.0, result.getTotalAmount());
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(productClient, times(1)).getProductById(1L);
        verify(productClient, times(1)).getProductById(2L);
    }

    @Test
    void shouldThrowExceptionWhenCreateRequestIsNull() {
        BadRequestException exception = assertThrows(BadRequestException.class, () -> orderService.createOrder(null));

        assertEquals("request body is required", exception.getMessage());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void shouldThrowExceptionWhenUserIdIsMissing() {
        request.setUserId(null);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> orderService.createOrder(request));

        assertEquals("userId is required", exception.getMessage());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void shouldThrowExceptionWhenItemsListIsEmpty() {
        request.setItems(List.of());

        BadRequestException exception = assertThrows(BadRequestException.class, () -> orderService.createOrder(request));

        assertEquals("items list must not be empty", exception.getMessage());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void shouldThrowExceptionWhenProductQuantityIsInvalid() {
        request.setItems(List.of(OrderItemRequest.builder().productId(1L).quantity(0).build()));

        BadRequestException exception = assertThrows(BadRequestException.class, () -> orderService.createOrder(request));

        assertEquals("quantity must be greater than 0 for productId=1", exception.getMessage());
        verify(productClient, never()).getProductById(anyLong());
    }

    @Test
    void shouldThrowExceptionWhenProductIdIsMissing() {
        request.setItems(List.of(OrderItemRequest.builder().productId(null).quantity(1).build()));

        BadRequestException exception = assertThrows(BadRequestException.class, () -> orderService.createOrder(request));

        assertEquals("productId is required", exception.getMessage());
        verify(productClient, never()).getProductById(anyLong());
    }

    @Test
    void shouldThrowExceptionWhenProductIsNotFound() {
        when(productClient.getProductById(1L)).thenThrow(feignError(404, "GET", "http://localhost:8085/api/products/1"));
        request.setItems(List.of(OrderItemRequest.builder().productId(1L).quantity(1).build()));

        NotFoundException exception = assertThrows(NotFoundException.class, () -> orderService.createOrder(request));

        assertEquals("Product not found with id=1", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenProductPriceIsMissing() {
        when(productClient.getProductById(1L)).thenReturn(ProductResponse.builder()
                .id(1L)
                .name("Notebook")
                .category("Stationery")
                .description("A useful notebook for tests.")
                .stock(20)
                .price(null)
                .build());
        request.setItems(List.of(OrderItemRequest.builder().productId(1L).quantity(1).build()));

        BadRequestException exception = assertThrows(BadRequestException.class, () -> orderService.createOrder(request));

        assertEquals("Product price is missing for id=1", exception.getMessage());
    }

    @Test
    void shouldReturnAllOrdersWhenListIsNotEmpty() {
        when(orderRepository.findAll()).thenReturn(List.of(order));

        List<OrderResponse> results = orderService.getAllOrders();

        assertEquals(1, results.size());
        verify(orderRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnEmptyOrdersListWhenNoOrdersExist() {
        when(orderRepository.findAll()).thenReturn(List.of());

        List<OrderResponse> results = orderService.getAllOrders();

        assertEquals(0, results.size());
        verify(orderRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnOrderById() {
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));

        OrderResponse result = orderService.getOrderById(100L);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        verify(orderRepository, times(1)).findById(100L);
    }

    @Test
    void shouldThrowExceptionWhenOrderDoesNotExist() {
        when(orderRepository.findById(100L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class, () -> orderService.getOrderById(100L));

        assertEquals("Order not found with id=100", exception.getMessage());
    }

    @Test
    void shouldReturnOrdersByUserId() {
        when(orderRepository.findByUserId("user-1")).thenReturn(List.of(order));

        List<OrderResponse> results = orderService.getOrdersByUserId("user-1");

        assertEquals(1, results.size());
        verify(orderRepository, times(1)).findByUserId("user-1");
    }

    @Test
    void shouldUpdateStatus() {
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse result = orderService.updateStatus(100L, "delivered");

        assertEquals("DELIVERED", result.getStatus());
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    void shouldThrowExceptionWhenStatusIsBlank() {
        BadRequestException exception = assertThrows(BadRequestException.class, () -> orderService.updateStatus(100L, "   "));

        assertEquals("status must not be blank", exception.getMessage());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingMissingOrderStatus() {
        when(orderRepository.findById(100L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class, () -> orderService.updateStatus(100L, "DELIVERED"));

        assertEquals("Order not found with id=100", exception.getMessage());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void shouldDeleteOrderWhenItExists() {
        when(orderRepository.existsById(100L)).thenReturn(true);

        orderService.deleteOrder(100L);

        verify(deliveryRepository, times(1)).deleteByOrder_Id(100L);
        verify(orderRepository, times(1)).deleteById(100L);
    }

    @Test
    void shouldThrowExceptionWhenDeletingMissingOrder() {
        when(orderRepository.existsById(100L)).thenReturn(false);

        NotFoundException exception = assertThrows(NotFoundException.class, () -> orderService.deleteOrder(100L));

        assertEquals("Order not found with id=100", exception.getMessage());
        verify(deliveryRepository, never()).deleteByOrder_Id(100L);
        verify(orderRepository, never()).deleteById(100L);
    }

    private FeignException feignError(int status, String method, String url) {
        Request request = Request.create(
                Request.HttpMethod.valueOf(method),
                url,
            new LinkedHashMap<String, Collection<String>>(),
                new byte[0],
                StandardCharsets.UTF_8,
                null
        );
        Response response = Response.builder()
                .status(status)
                .reason("error")
                .request(request)
            .headers(Map.<String, Collection<String>>of())
                .build();
        return FeignException.errorStatus("test", response);
    }
}
