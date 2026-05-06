package tn.esprit.ressources.RestController;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.ressources.Service.Interface.ProductService;
import tn.esprit.ressources.dto.product.ProductRequest;
import tn.esprit.ressources.dto.product.ProductResponse;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ProductControlle {

    private final ProductService productService;

    @PostMapping(value = "/addProduct", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductResponse addProduct(
            @Valid @RequestPart("product") ProductRequest product,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        log.debug("POST /api/products/addProduct - imageProvided={}", image != null && !image.isEmpty());
        return productService.addProduct(product, image);
    }

    @PutMapping(value = "/updateProduct/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductResponse updateProduct(
            @PathVariable Long id,
            @Valid @RequestPart("product") ProductRequest product,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        log.debug("PUT /api/products/updateProduct/{} - imageProvided={}", id, image != null && !image.isEmpty());
        return productService.updateProduct(id, product, image);
    }


    @GetMapping("/getProduct/{id}")
    public ProductResponse getProduct(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @GetMapping("/{id}")
    public ProductResponse getProductBySimplePath(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @GetMapping("/allProducts")
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts();
    }


    @DeleteMapping("/deleteProduct/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}
