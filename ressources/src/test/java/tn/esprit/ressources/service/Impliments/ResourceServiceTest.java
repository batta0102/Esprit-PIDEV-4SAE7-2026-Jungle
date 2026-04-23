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
import tn.esprit.ressources.Repository.ResourceRepository;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceServiceImpl resourceService;

    private Resource resource;
    private Resource updatedResource;

    @BeforeEach
    void setUp() {
        resource = Resource.builder()
                .resourceId(1L)
                .title("Java Basics")
                .description("A complete introduction to Java programming.")
                .type(ResourceType.PDF)
                .fileUrl("/files/java-basics.pdf")
                .build();

        updatedResource = Resource.builder()
                .resourceId(1L)
                .title("Advanced Java")
                .description("A complete advanced Java guide.")
                .type(ResourceType.VIDEO)
                .fileUrl("/files/advanced-java.mp4")
                .build();
    }

    @Test
    void shouldCreateResource() {
        when(resourceRepository.save(resource)).thenReturn(resource);

        Resource result = resourceService.createResource(resource);

        assertNotNull(result);
        assertEquals("Java Basics", result.getTitle());
        verify(resourceRepository, times(1)).save(resource);
    }

    @Test
    void shouldReturnAllResourcesWhenListIsNotEmpty() {
        when(resourceRepository.findAll()).thenReturn(List.of(resource));

        List<Resource> results = resourceService.getAllResources();

        assertEquals(1, results.size());
        verify(resourceRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnEmptyListWhenNoResourcesExist() {
        when(resourceRepository.findAll()).thenReturn(List.of());

        List<Resource> results = resourceService.getAllResources();

        assertEquals(0, results.size());
        verify(resourceRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnResourceById() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        Resource result = resourceService.getResourceById(1L);

        assertNotNull(result);
        assertEquals("Java Basics", result.getTitle());
        verify(resourceRepository, times(1)).findById(1L);
    }

    @Test
    void shouldThrowExceptionWhenResourceDoesNotExist() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> resourceService.getResourceById(1L));

        assertEquals("Resource not found", exception.getMessage());
        verify(resourceRepository, times(1)).findById(1L);
    }

    @Test
    void shouldUpdateResource() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        when(resourceRepository.save(resource)).thenReturn(updatedResource);

        Resource result = resourceService.updateResource(1L, updatedResource);

        assertEquals("Advanced Java", result.getTitle());
        assertEquals(ResourceType.VIDEO, result.getType());
        verify(resourceRepository, times(1)).findById(1L);
        verify(resourceRepository, times(1)).save(resource);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingMissingResource() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> resourceService.updateResource(1L, updatedResource));

        assertEquals("Resource not found", exception.getMessage());
        verify(resourceRepository, times(1)).findById(1L);
        verify(resourceRepository, never()).save(updatedResource);
    }

    @Test
    void shouldDeleteResourceWhenItExists() {
        when(resourceRepository.existsById(1L)).thenReturn(true);

        resourceService.deleteResource(1L);

        verify(resourceRepository, times(1)).existsById(1L);
        verify(resourceRepository, times(1)).deleteById(1L);
    }

    @Test
    void shouldThrowExceptionWhenDeletingMissingResource() {
        when(resourceRepository.existsById(1L)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> resourceService.deleteResource(1L));

        assertEquals("Resource not found", exception.getMessage());
        verify(resourceRepository, times(1)).existsById(1L);
        verify(resourceRepository, never()).deleteById(1L);
    }
}
