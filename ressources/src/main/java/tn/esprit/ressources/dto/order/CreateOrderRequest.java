package tn.esprit.ressources.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {

    @NotBlank(message = "userId is required")
    private String userId;

    private String userEmail;
    private String address;
    private String paymentMethod;

    @NotEmpty(message = "items list must not be empty")
    @Valid
    private List<OrderItemRequest> items;
}
