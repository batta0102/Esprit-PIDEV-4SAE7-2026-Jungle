package tn.esprit.ressources.Entites;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDelivery;

    private String deliveryAddress;

    private String deliveryStatus;

    private Date deliveryDate;

    @Column(name = "tracking_number", nullable = false, unique = true, length = 32)
    private String trackingNumber;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "assigned_user_id")
    private Long assignedUserId;

    @Column(name = "assigned_user_name")
    private String assignedUserName;

    @Column(name = "assigned_user_phone")
    private String assignedUserPhone;

    @Column(name = "current_lat")
    private Double currentLat;

    @Column(name = "current_lng")
    private Double currentLng;

    @Column(name = "last_location_update")
    private LocalDateTime lastLocationUpdate;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
}