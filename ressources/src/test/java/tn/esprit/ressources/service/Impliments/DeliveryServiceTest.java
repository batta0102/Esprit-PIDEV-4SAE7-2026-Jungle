package tn.esprit.ressources.Service.Impliments;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import feign.FeignException;
import feign.Request;
import feign.Response;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
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
import tn.esprit.ressources.Entites.Delivery;
import tn.esprit.ressources.Entites.Order;
import tn.esprit.ressources.Repository.DeliveryRepository;
import tn.esprit.ressources.Repository.OrderRepository;
import tn.esprit.ressources.client.UserClient;
import tn.esprit.ressources.dto.Delivery.AssignDeliveryRequestDto;
import tn.esprit.ressources.dto.Delivery.DeliveryResponseDto;
import tn.esprit.ressources.dto.Delivery.DeliveryTrackingDto;
import tn.esprit.ressources.dto.Delivery.UpdateLivreurLocationRequestDto;
import tn.esprit.ressources.dto.user.UserClientDto;
import tn.esprit.ressources.exception.DeliveryNotAssignedException;
import tn.esprit.ressources.exception.DeliveryNotFoundException;
import tn.esprit.ressources.exception.InvalidLivreurException;
import tn.esprit.ressources.exception.UserNotFoundException;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceTest {

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private UserClient userClient;

    @InjectMocks
    private DeliveryServiceImpl deliveryService;

    private Order order;
    private Delivery delivery;
    private UserClientDto livreur;
    private UserClientDto currentLivreurLocation;

    @BeforeEach
    void setUp() {
        order = Order.builder()
                .id(10L)
                .userId("student-1")
                .createdAt(LocalDateTime.now())
                .status("PENDING")
                .totalPrice(100.0)
                .totalAmount(100.0)
                .address("Campus")
                .paymentMethod("CARD")
                .userEmail("customer@example.com")
                .build();

        delivery = Delivery.builder()
                .idDelivery(100L)
                .deliveryAddress("Campus")
                .deliveryStatus("ASSIGNED")
                .trackingNumber("TN-1234567890ABCDEF")
                .userId("student-1")
                .assignedUserId(5L)
                .assignedAt(LocalDateTime.now())
                .build();

        livreur = new UserClientDto(
                5L,
                "Driver One",
                "driver@example.com",
                "12345678",
                "Driver Address",
                "LIVREUR",
                35.5,
                10.2,
                LocalDateTime.now()
        );

        currentLivreurLocation = new UserClientDto(
                5L,
                "Driver One",
                "driver@example.com",
                "12345678",
                "Driver Address",
                "LIVREUR",
                36.1,
                10.8,
                LocalDateTime.now()
        );
    }

    @Test
    void shouldCreateDelivery() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(deliveryRepository.existsByTrackingNumber(any())).thenReturn(false);
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DeliveryResponseDto result = deliveryService.createDelivery(Delivery.builder().order(order).build());

        assertNotNull(result);
        assertEquals("TN-", result.trackingNumber().substring(0, 3));
        verify(orderRepository, times(1)).findById(10L);
        verify(deliveryRepository, times(1)).save(any(Delivery.class));
    }

    @Test
    void shouldThrowExceptionWhenDeliveryPayloadIsInvalid() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> deliveryService.createDelivery(new Delivery()));

        assertEquals("Payload must include order.id", exception.getMessage());
        verify(orderRepository, never()).findById(any());
        verify(deliveryRepository, never()).save(any());
    }

    @Test
    void shouldThrowExceptionWhenOrderDoesNotExist() {
        when(orderRepository.findById(10L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> deliveryService.createDelivery(Delivery.builder().order(order).build()));

        assertEquals("Order not found with id=10", exception.getMessage());
        verify(deliveryRepository, never()).save(any());
    }

    @Test
    void shouldSendTrackingNumberEmailWhenCustomerEmailExists() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(deliveryRepository.existsByTrackingNumber(any())).thenReturn(false);
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));

        deliveryService.createDelivery(Delivery.builder().order(order).build());

        verify(emailService, times(1)).sendTrackingNumber(eq("customer@example.com"), anyString());
    }

    @Test
    void shouldIgnoreEmailErrorsWhenCreatingDelivery() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(deliveryRepository.existsByTrackingNumber(any())).thenReturn(false);
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));
        org.mockito.Mockito.doThrow(new RuntimeException("mail down")).when(emailService)
                .sendTrackingNumber(any(), any());

        DeliveryResponseDto result = deliveryService.createDelivery(Delivery.builder().order(order).build());

        assertNotNull(result);
        verify(deliveryRepository, times(1)).save(any(Delivery.class));
    }

    @Test
    void shouldReturnAllDeliveriesWhenListIsNotEmpty() {
        when(deliveryRepository.findAll()).thenReturn(List.of(delivery));
        when(userClient.getUserById(5L)).thenReturn(livreur);

        List<DeliveryResponseDto> results = deliveryService.getAllDeliveries();

        assertEquals(1, results.size());
        assertEquals(5L, results.get(0).assignedUserId());
        verify(deliveryRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnEmptyDeliveryListWhenNoDeliveriesExist() {
        when(deliveryRepository.findAll()).thenReturn(List.of());

        List<DeliveryResponseDto> results = deliveryService.getAllDeliveries();

        assertEquals(0, results.size());
        verify(deliveryRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnDeliveryById() {
        when(deliveryRepository.findById(100L)).thenReturn(Optional.of(delivery));
        when(userClient.getUserById(5L)).thenReturn(livreur);

        DeliveryResponseDto result = deliveryService.getDeliveryById(100L);

        assertNotNull(result);
        assertEquals(100L, result.id());
        assertEquals("Driver One", result.assignedUser().fullName());
        verify(deliveryRepository, times(1)).findById(100L);
    }

    @Test
    void shouldThrowExceptionWhenDeliveryDoesNotExist() {
        when(deliveryRepository.findById(100L)).thenReturn(Optional.empty());

        assertThrows(DeliveryNotFoundException.class, () -> deliveryService.getDeliveryById(100L));
    }

    @Test
    void shouldDeleteDeliveryWhenItExists() {
        when(deliveryRepository.findById(100L)).thenReturn(Optional.of(delivery));

        deliveryService.deleteDelivery(100L);

        verify(deliveryRepository, times(1)).delete(delivery);
    }

    @Test
    void shouldThrowExceptionWhenDeletingMissingDelivery() {
        when(deliveryRepository.findById(100L)).thenReturn(Optional.empty());

        assertThrows(DeliveryNotFoundException.class, () -> deliveryService.deleteDelivery(100L));
        verify(deliveryRepository, never()).delete(any());
    }

    @Test
    void shouldGetDeliveryByTrackingNumber() {
        when(deliveryRepository.findByTrackingNumber("TN-1234567890ABCDEF")).thenReturn(Optional.of(delivery));
        when(userClient.getUserById(5L)).thenReturn(livreur);

        DeliveryResponseDto result = deliveryService.getDeliveryByTrackingNumber("TN-1234567890ABCDEF");

        assertNotNull(result);
        assertEquals("TN-1234567890ABCDEF", result.trackingNumber());
    }

    @Test
    void shouldThrowExceptionWhenTrackingNumberDoesNotExist() {
        when(deliveryRepository.findByTrackingNumber("TN-404")).thenReturn(Optional.empty());

        assertThrows(DeliveryNotFoundException.class, () -> deliveryService.getDeliveryByTrackingNumber("TN-404"));
    }

    @Test
    void shouldAssignLivreurToDelivery() {
        when(deliveryRepository.findById(100L)).thenReturn(Optional.of(delivery));
        when(userClient.getUserById(5L)).thenReturn(livreur);
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DeliveryResponseDto result = deliveryService.assignLivreurToDelivery(100L, new AssignDeliveryRequestDto(5L));

        assertEquals(5L, result.assignedUserId());
        assertEquals("Driver One", result.assignedUser().fullName());
        verify(deliveryRepository, times(1)).save(any(Delivery.class));
    }

    @Test
    void shouldThrowExceptionWhenAssignedUserDoesNotExist() {
        when(deliveryRepository.findById(100L)).thenReturn(Optional.of(delivery));
        when(userClient.getUserById(5L)).thenReturn(null);

        assertThrows(UserNotFoundException.class, () -> deliveryService.assignLivreurToDelivery(100L, new AssignDeliveryRequestDto(5L)));
    }

    @Test
    void shouldThrowExceptionWhenAssignedUserIsNotLivreur() {
        when(deliveryRepository.findById(100L)).thenReturn(Optional.of(delivery));
        when(userClient.getUserById(5L)).thenReturn(new UserClientDto(
                5L,
                "Student",
                "student@example.com",
                "123",
                "Address",
                "ETUDIANT",
                null,
                null,
                null
        ));

        assertThrows(InvalidLivreurException.class, () -> deliveryService.assignLivreurToDelivery(100L, new AssignDeliveryRequestDto(5L)));
    }

    @Test
    void shouldThrowExceptionWhenTrackingRequestedForUnassignedDelivery() {
        Delivery unassigned = Delivery.builder()
                .idDelivery(101L)
                .deliveryStatus("PENDING")
                .trackingNumber("TN-XX")
                .userId("student-1")
                .build();
        when(deliveryRepository.findById(101L)).thenReturn(Optional.of(unassigned));

        assertThrows(DeliveryNotAssignedException.class, () -> deliveryService.getTrackingByDeliveryId(101L));
    }

    @Test
    void shouldReturnTrackingFromPersistedDeliveryCoordinates() {
        Delivery persisted = Delivery.builder()
                .idDelivery(100L)
                .deliveryStatus("IN_TRANSIT")
                .trackingNumber("TN-123")
                .userId("student-1")
                .assignedUserId(5L)
                .assignedUserName("Persisted Driver")
                .assignedUserPhone("11122233")
                .currentLat(35.9)
                .currentLng(10.4)
                .lastLocationUpdate(LocalDateTime.now())
                .build();
        when(deliveryRepository.findById(100L)).thenReturn(Optional.of(persisted));
        when(userClient.getUserById(5L)).thenThrow(feignError(403, "GET", "http://localhost:8083/api/users/getById/5"));

        DeliveryTrackingDto result = deliveryService.getTrackingByDeliveryId(100L);

        assertEquals(35.9, result.currentLat());
        assertEquals(10.4, result.currentLng());
        assertEquals("Persisted Driver", result.livreurName());
        assertEquals("11122233", result.livreurPhone());
    }

    @Test
    void shouldReturnMyDeliveriesTrackingWhenListIsNotEmpty() {
        Delivery persisted = Delivery.builder()
                .idDelivery(100L)
                .deliveryStatus("IN_TRANSIT")
                .trackingNumber("TN-123")
                .userId("student-1")
                .assignedUserId(5L)
                .assignedUserName("Persisted Driver")
                .currentLat(35.9)
                .currentLng(10.4)
                .lastLocationUpdate(LocalDateTime.now())
                .build();
        when(deliveryRepository.findByOrder_UserId("student-1")).thenReturn(List.of(persisted));

        List<DeliveryTrackingDto> results = deliveryService.getMyDeliveriesTracking("student-1");

        assertEquals(1, results.size());
        assertEquals(35.9, results.get(0).currentLat());
    }

    @Test
    void shouldReturnEmptyMyDeliveriesTrackingListWhenNoDeliveriesExist() {
        when(deliveryRepository.findByOrder_UserId("student-1")).thenReturn(List.of());

        List<DeliveryTrackingDto> results = deliveryService.getMyDeliveriesTracking("student-1");

        assertEquals(0, results.size());
    }

    @Test
    void shouldReturnAssignedDeliveriesTrackingWhenListIsNotEmpty() {
        Delivery persisted = Delivery.builder()
                .idDelivery(100L)
                .deliveryStatus("IN_TRANSIT")
                .trackingNumber("TN-123")
                .userId("student-1")
                .assignedUserId(5L)
                .assignedUserName("Persisted Driver")
                .currentLat(35.9)
                .currentLng(10.4)
                .lastLocationUpdate(LocalDateTime.now())
                .build();
        when(deliveryRepository.findByAssignedUserId(5L)).thenReturn(List.of(persisted));

        List<DeliveryTrackingDto> results = deliveryService.getAssignedDeliveriesTracking(5L);

        assertEquals(1, results.size());
        assertEquals("Persisted Driver", results.get(0).livreurName());
    }

    @Test
    void shouldReturnEmptyAssignedDeliveriesTrackingListWhenNoDeliveriesExist() {
        when(deliveryRepository.findByAssignedUserId(5L)).thenReturn(List.of());

        List<DeliveryTrackingDto> results = deliveryService.getAssignedDeliveriesTracking(5L);

        assertEquals(0, results.size());
    }

    @Test
    void shouldUpdateLivreurLocationOnAllAssignedDeliveries() {
        Delivery first = Delivery.builder().idDelivery(1L).assignedUserId(5L).build();
        Delivery second = Delivery.builder().idDelivery(2L).assignedUserId(5L).build();
        when(deliveryRepository.findByAssignedUserId(5L)).thenReturn(List.of(first, second));
        when(deliveryRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        deliveryService.updateLivreurLocation(5L, new UpdateLivreurLocationRequestDto(36.5, 11.2));

        ArgumentCaptor<List<Delivery>> captor = ArgumentCaptor.forClass(List.class);
        verify(deliveryRepository, times(1)).saveAll(captor.capture());
        assertEquals(2, captor.getValue().size());
        assertEquals(36.5, captor.getValue().get(0).getCurrentLat());
        assertEquals(11.2, captor.getValue().get(0).getCurrentLng());
    }

    @Test
    void shouldDoNothingWhenNoAssignedDeliveriesExistForLocationUpdate() {
        when(deliveryRepository.findByAssignedUserId(5L)).thenReturn(List.of());

        deliveryService.updateLivreurLocation(5L, new UpdateLivreurLocationRequestDto(36.5, 11.2));

        verify(deliveryRepository, never()).saveAll(any());
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
