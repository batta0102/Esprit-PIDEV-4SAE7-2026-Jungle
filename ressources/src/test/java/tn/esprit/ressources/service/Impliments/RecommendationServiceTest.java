package tn.esprit.ressources.Service.Impliments;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import tn.esprit.ressources.Repository.ProductRecommendationProjection;
import tn.esprit.ressources.Repository.ProductRepository;
import tn.esprit.ressources.dto.RecommendationProductResponse;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private RecommendationServiceImpl recommendationService;

    private ProductRecommendationProjection projectionOne;
    private ProductRecommendationProjection projectionTwo;

    @BeforeEach
    void setUp() {
        projectionOne = org.mockito.Mockito.mock(ProductRecommendationProjection.class);
        projectionTwo = org.mockito.Mockito.mock(ProductRecommendationProjection.class);
    }

    @Test
    void shouldReturnTop3MostOrderedProducts() {
        when(projectionOne.getProductId()).thenReturn(1L);
        when(projectionOne.getProductName()).thenReturn("Book A");
        when(projectionOne.getProductCategory()).thenReturn("Books");
        when(projectionOne.getOrdersCount()).thenReturn(5L);

        when(projectionTwo.getProductId()).thenReturn(2L);
        when(projectionTwo.getProductName()).thenReturn("Book B");
        when(projectionTwo.getProductCategory()).thenReturn("Books");
        when(projectionTwo.getOrdersCount()).thenReturn(null);

        when(productRepository.findTop3MostOrderedProducts(eq(PageRequest.of(0, 3))))
                .thenReturn(List.of(projectionOne, projectionTwo));

        List<RecommendationProductResponse> results = recommendationService.getTop3MostOrderedProducts();

        assertEquals(2, results.size());
        assertEquals(1L, results.get(0).getId());
        assertEquals(5L, results.get(0).getOrdersCount());
        assertEquals(5.0, results.get(0).getScore());
        assertEquals(0L, results.get(1).getOrdersCount());
        assertEquals(0.0, results.get(1).getScore());
        verify(productRepository, times(1)).findTop3MostOrderedProducts(eq(PageRequest.of(0, 3)));
    }

    @Test
    void shouldReturnRecommendationsForUserWithLimitClampedToThree() {
        when(projectionOne.getProductId()).thenReturn(1L);
        when(projectionOne.getProductName()).thenReturn("Book A");
        when(projectionOne.getProductCategory()).thenReturn("Books");
        when(projectionOne.getOrdersCount()).thenReturn(3L);
        when(productRepository.findTop3MostOrderedProducts(eq(PageRequest.of(0, 3))))
                .thenReturn(List.of(projectionOne));

        List<RecommendationProductResponse> results = recommendationService.recommendForUser("user-1", 10);

        assertEquals(1, results.size());
        verify(productRepository, times(1)).findTop3MostOrderedProducts(eq(PageRequest.of(0, 3)));
    }

    @Test
    void shouldReturnRecommendationsForUserWithMinimumLimitOne() {
        when(projectionOne.getProductId()).thenReturn(1L);
        when(projectionOne.getProductName()).thenReturn("Book A");
        when(projectionOne.getProductCategory()).thenReturn("Books");
        when(projectionOne.getOrdersCount()).thenReturn(3L);
        when(productRepository.findTop3MostOrderedProducts(eq(PageRequest.of(0, 1))))
                .thenReturn(List.of(projectionOne));

        List<RecommendationProductResponse> results = recommendationService.recommendForUser("user-1", 0);

        assertEquals(1, results.size());
        verify(productRepository, times(1)).findTop3MostOrderedProducts(eq(PageRequest.of(0, 1)));
    }

    @Test
    void shouldReturnSimilarProductRecommendations() {
        when(projectionOne.getProductId()).thenReturn(1L);
        when(projectionOne.getProductName()).thenReturn("Book A");
        when(projectionOne.getProductCategory()).thenReturn("Books");
        when(projectionOne.getOrdersCount()).thenReturn(2L);
        when(productRepository.findTop3MostOrderedProducts(eq(PageRequest.of(0, 2))))
                .thenReturn(List.of(projectionOne));

        List<RecommendationProductResponse> results = recommendationService.recommendSimilarToProduct(99L, 2);

        assertEquals(1, results.size());
        verify(productRepository, times(1)).findTop3MostOrderedProducts(eq(PageRequest.of(0, 2)));
    }

    @Test
    void shouldReturnEmptyListWhenNoRecommendationsExist() {
        when(productRepository.findTop3MostOrderedProducts(eq(PageRequest.of(0, 3))))
                .thenReturn(List.of());

        List<RecommendationProductResponse> results = recommendationService.getTop3MostOrderedProducts();

        assertEquals(0, results.size());
        verify(productRepository, times(1)).findTop3MostOrderedProducts(eq(PageRequest.of(0, 3)));
    }
}
