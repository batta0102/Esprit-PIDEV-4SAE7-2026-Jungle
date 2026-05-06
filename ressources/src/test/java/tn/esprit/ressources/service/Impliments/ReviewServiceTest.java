package tn.esprit.ressources.Service.Impliments;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.ressources.Entites.Resource;
import tn.esprit.ressources.Entites.ResourceType;
import tn.esprit.ressources.Entites.Review;
import tn.esprit.ressources.Repository.ReviewRepository;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private Resource resource;
    private Review review;
    private Review updatedReview;

    @BeforeEach
    void setUp() {
        resource = Resource.builder()
                .resourceId(10L)
                .title("Java Basics")
                .description("A complete introduction to Java programming.")
                .type(ResourceType.PDF)
                .fileUrl("/files/java-basics.pdf")
                .build();

        review = Review.builder()
                .idReview(1L)
                .rating(5)
                .comment("Very useful and clear.")
                .resource(resource)
                .build();

        updatedReview = Review.builder()
                .idReview(1L)
                .rating(4)
                .comment("Updated review text.")
                .resource(resource)
                .build();
    }

    @Test
    void shouldAddReview() {
        when(reviewRepository.save(review)).thenReturn(review);

        Review result = reviewService.addReview(review);

        assertNotNull(result);
        assertEquals(5, result.getRating());
        verify(reviewRepository, times(1)).save(review);
    }

    @Test
    void shouldReturnAllReviewsWhenListIsNotEmpty() {
        when(reviewRepository.findAll()).thenReturn(List.of(review));

        List<Review> results = reviewService.getAllReviews();

        assertEquals(1, results.size());
        verify(reviewRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnEmptyReviewListWhenNoReviewsExist() {
        when(reviewRepository.findAll()).thenReturn(List.of());

        List<Review> results = reviewService.getAllReviews();

        assertEquals(0, results.size());
        verify(reviewRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnReviewById() {
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        Review result = reviewService.getReviewById(1L);

        assertNotNull(result);
        assertEquals("Very useful and clear.", result.getComment());
        verify(reviewRepository, times(1)).findById(1L);
    }

    @Test
    void shouldThrowExceptionWhenReviewDoesNotExist() {
        when(reviewRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> reviewService.getReviewById(1L));

        assertEquals("Review not found", exception.getMessage());
        verify(reviewRepository, times(1)).findById(1L);
    }

    @Test
    void shouldReturnReviewsByResourceId() {
        when(reviewRepository.findByResource_ResourceId(10L)).thenReturn(List.of(review));

        List<Review> results = reviewService.getReviewsByResourceId(10L);

        assertEquals(1, results.size());
        verify(reviewRepository, times(1)).findByResource_ResourceId(10L);
    }

    @Test
    void shouldUpdateReview() {
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(review)).thenReturn(updatedReview);

        Review result = reviewService.updateReview(1L, updatedReview);

        assertEquals(4, result.getRating());
        assertEquals("Updated review text.", result.getComment());
        verify(reviewRepository, times(1)).findById(1L);
        verify(reviewRepository, times(1)).save(review);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingMissingReview() {
        when(reviewRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> reviewService.updateReview(1L, updatedReview));

        assertEquals("Review not found", exception.getMessage());
        verify(reviewRepository, times(1)).findById(1L);
        verify(reviewRepository, never()).save(updatedReview);
    }

    @Test
    void shouldDeleteReviewWhenItExists() {
        when(reviewRepository.existsById(1L)).thenReturn(true);

        reviewService.deleteReview(1L);

        verify(reviewRepository, times(1)).existsById(1L);
        verify(reviewRepository, times(1)).deleteById(1L);
    }

    @Test
    void shouldThrowExceptionWhenDeletingMissingReview() {
        when(reviewRepository.existsById(1L)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> reviewService.deleteReview(1L));

        assertEquals("Review not found", exception.getMessage());
        verify(reviewRepository, times(1)).existsById(1L);
        verify(reviewRepository, never()).deleteById(1L);
    }
}
