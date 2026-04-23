package tn.esprit.ressources.Service.Impliments;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import tn.esprit.ressources.Entites.Product;
import tn.esprit.ressources.Repository.ProductRepository;
import tn.esprit.ressources.dto.product.ProductRequest;
import tn.esprit.ressources.dto.product.ProductResponse;
import tn.esprit.ressources.exception.BadRequestException;
import tn.esprit.ressources.exception.NotFoundException;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    @TempDir
    Path tempDir;

    private ProductRequest request;
    private Product product;
    private Product savedProduct;
    private MockMultipartFile image;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(productService, "uploadDir", tempDir.toString());

        request = ProductRequest.builder()
                .name("Laptop")
                .description("A powerful laptop for testing.")
                .stock(10)
                .category("Electronics")
                .price(999.99)
                .build();

        product = Product.builder()
                .idProduct(1L)
                .name("Laptop")
                .description("A powerful laptop for testing.")
                .stock(10)
                .category("Electronics")
                .price(999.99)
                .imageUrl("/uploads/products/existing.png")
                .build();

        savedProduct = Product.builder()
                .idProduct(1L)
                .name("Laptop")
                .description("A powerful laptop for testing.")
                .stock(10)
                .category("Electronics")
                .price(999.99)
                .imageUrl("/uploads/products/saved.png")
                .build();

        image = new MockMultipartFile(
                "image",
                "laptop.png",
                "image/png",
                "fake-image-content".getBytes(StandardCharsets.UTF_8)
        );
    }

    @Test
    void shouldAddProductWithoutImage() {
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse result = productService.addProduct(request, null);

        assertNotNull(result);
        assertEquals("Laptop", result.getName());
        assertNull(result.getImageUrl());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void shouldAddProductWithImage() throws IOException {
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse result = productService.addProduct(request, image);

        assertNotNull(result.getImageUrl());
        assertEquals("Laptop", result.getName());
        verify(productRepository, times(1)).save(any(Product.class));
        Path productsDir = tempDir.resolve("products");
        assertEquals(1, Files.list(productsDir).count());
    }

    @Test
    void shouldThrowExceptionWhenImageExtensionIsInvalid() {
        MockMultipartFile invalidImage = new MockMultipartFile(
                "image",
                "laptop.txt",
                "text/plain",
                "content".getBytes(StandardCharsets.UTF_8)
        );

        assertThrows(BadRequestException.class, () -> productService.addProduct(request, invalidImage));
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void shouldReturnAllProductsWhenListIsNotEmpty() {
        when(productRepository.findAll()).thenReturn(List.of(product));

        List<ProductResponse> results = productService.getAllProducts();

        assertEquals(1, results.size());
        assertEquals(1L, results.get(0).getId());
        verify(productRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnEmptyListWhenNoProductsExist() {
        when(productRepository.findAll()).thenReturn(List.of());

        List<ProductResponse> results = productService.getAllProducts();

        assertEquals(0, results.size());
        verify(productRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnProductById() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        ProductResponse result = productService.getProductById(1L);

        assertNotNull(result);
        assertEquals("Laptop", result.getName());
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    void shouldThrowExceptionWhenProductDoesNotExist() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> productService.getProductById(1L));
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    void shouldUpdateProductWithoutImage() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(product)).thenReturn(savedProduct);

        ProductResponse result = productService.updateProduct(1L, request, null);

        assertEquals("Laptop", result.getName());
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).save(product);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingMissingProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> productService.updateProduct(1L, request, null));
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void shouldDeleteProductWhenItExists() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        productService.deleteProduct(1L);

        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).deleteById(1L);
    }

    @Test
    void shouldThrowExceptionWhenDeletingMissingProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> productService.deleteProduct(1L));
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, never()).deleteById(1L);
    }
}
