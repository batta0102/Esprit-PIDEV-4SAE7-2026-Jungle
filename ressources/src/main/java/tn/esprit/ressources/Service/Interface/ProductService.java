package tn.esprit.ressources.Service.Interface;

import org.springframework.web.multipart.MultipartFile;
import tn.esprit.ressources.dto.product.ProductRequest;
import tn.esprit.ressources.dto.product.ProductResponse;

import java.util.List;

public interface ProductService {

    ProductResponse addProduct(ProductRequest product, MultipartFile image);
    ProductResponse updateProduct(Long id, ProductRequest product, MultipartFile image);

    ProductResponse getProductById(Long id);

    List<ProductResponse> getAllProducts();

    void deleteProduct(Long id);
}
