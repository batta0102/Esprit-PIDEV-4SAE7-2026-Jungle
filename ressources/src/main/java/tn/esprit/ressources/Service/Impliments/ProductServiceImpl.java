package tn.esprit.ressources.Service.Impliments;

import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.ressources.Entites.Product;
import tn.esprit.ressources.Repository.ProductRepository;
import tn.esprit.ressources.Service.Interface.ProductService;
import tn.esprit.ressources.dto.product.ProductRequest;
import tn.esprit.ressources.dto.product.ProductResponse;
import tn.esprit.ressources.exception.BadRequestException;
import tn.esprit.ressources.exception.NotFoundException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");
    private static final String IMAGE_URL_PREFIX = "/uploads/products/";

    private final ProductRepository productRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public ProductResponse addProduct(ProductRequest product, MultipartFile image) {
        Product entity = Product.builder()
                .name(product.getName())
                .description(product.getDescription())
                .stock(product.getStock())
                .category(product.getCategory())
                .price(product.getPrice())
                .build();

        if (image != null && !image.isEmpty()) {
            entity.setImageUrl(storeImage(image));
        } else {
            log.info("Product '{}' created without image", entity.getName());
        }

        Product saved = productRepository.save(entity);
        log.info("Product created with id={} and imageUrl={}", saved.getIdProduct(), saved.getImageUrl());
        return toResponse(saved);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest product, MultipartFile image) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with id=" + id));

        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setStock(product.getStock());
        existing.setCategory(product.getCategory());
        existing.setPrice(product.getPrice());

        if (image != null && !image.isEmpty()) {
            deleteIfManagedImage(existing.getImageUrl());
            existing.setImageUrl(storeImage(image));
        }

        Product saved = productRepository.save(existing);
        log.info("Product updated id={} imageUrl={}", saved.getIdProduct(), saved.getImageUrl());
        return toResponse(saved);
    }


    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with id=" + id));
        return toResponse(product);
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void deleteProduct(Long id) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with id=" + id));
        deleteIfManagedImage(existing.getImageUrl());
        productRepository.deleteById(id);
        log.info("Product deleted id={}", id);
    }

    private ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getIdProduct())
                .name(product.getName())
                .description(product.getDescription())
                .category(product.getCategory())
                .stock(product.getStock())
                .price(product.getPrice())
                .imageUrl(normalizeImageUrl(product.getImageUrl()))
                .build();
    }

    private String normalizeImageUrl(String imageUrl) {
        if (!StringUtils.hasText(imageUrl)) {
            return null;
        }

        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("/uploads/")) {
            return imageUrl;
        }

        if (imageUrl.startsWith("/")) {
            return imageUrl;
        }

        return IMAGE_URL_PREFIX + imageUrl;
    }

    private String storeImage(MultipartFile image) {
        String originalName = StringUtils.cleanPath(image.getOriginalFilename() == null ? "image" : image.getOriginalFilename());

        if (originalName.contains("..")) {
            throw new BadRequestException("Invalid image filename");
        }

        String extension = extractExtension(originalName);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Only image files are allowed: " + ALLOWED_EXTENSIONS);
        }

        if (!StringUtils.hasText(image.getContentType()) || !image.getContentType().startsWith("image/")) {
            throw new BadRequestException("Invalid image content type");
        }

        String uniqueName = System.currentTimeMillis() + "_" + UUID.randomUUID() + extension;
        Path productUploadDir = getProductUploadDir();
        Path targetFile = productUploadDir.resolve(uniqueName).normalize();

        try {
            Files.createDirectories(productUploadDir);
            try (InputStream inputStream = image.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
            log.info("Saved product image '{}' to {}", originalName, targetFile);
            return IMAGE_URL_PREFIX + uniqueName;
        } catch (IOException ex) {
            throw new BadRequestException("Failed to store image: " + ex.getMessage());
        }
    }

    private void deleteIfManagedImage(String imageUrl) {
        if (!StringUtils.hasText(imageUrl) || !imageUrl.startsWith(IMAGE_URL_PREFIX)) {
            return;
        }

        String fileName = imageUrl.substring(IMAGE_URL_PREFIX.length());
        Path imagePath = getProductUploadDir().resolve(fileName).normalize();

        try {
            Files.deleteIfExists(imagePath);
            log.info("Deleted previous product image {}", imagePath);
        } catch (IOException ex) {
            log.warn("Unable to delete previous product image {}: {}", imagePath, ex.getMessage());
        }
    }

    private Path getProductUploadDir() {
        return Paths.get(uploadDir).toAbsolutePath().normalize().resolve("products");
    }

    private String extractExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            throw new BadRequestException("Image file must have a valid extension");
        }
        return fileName.substring(dotIndex).toLowerCase();
    }
}
