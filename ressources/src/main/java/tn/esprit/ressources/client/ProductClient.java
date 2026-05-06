package tn.esprit.ressources.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.ressources.dto.product.ProductResponse;

@FeignClient(name = "product-service-client", url = "${product.service.base-url:http://localhost:8085}")
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    ProductResponse getProductById(@PathVariable("id") Long id);
}
