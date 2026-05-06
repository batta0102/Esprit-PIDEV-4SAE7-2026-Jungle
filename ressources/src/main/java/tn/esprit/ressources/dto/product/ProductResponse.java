package tn.esprit.ressources.dto.product;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    @JsonProperty("idProduct")
    @JsonAlias({"id", "idProduct"})
    private Long id;

    @JsonAlias({"name", "productName"})
    private String name;

    private String category;

    private String description;

    private Integer stock;

    private String imageUrl;

    @JsonAlias({"price", "unitPrice"})
    private Double price;
}
