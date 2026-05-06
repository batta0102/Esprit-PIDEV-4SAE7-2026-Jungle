package com.example.pi4eme02.Service.Implementing;

import com.example.pi4eme02.Entity.Badge;
import com.example.pi4eme02.Repository.BadgeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BadgeServiceImplTest {

    @Mock
    private BadgeRepository repo;

    @InjectMocks
    private BadgeServiceImpl service;

    @Test
    void getBadgesByUnlockLevelDelegatesToRepositoryFilter() {
        Badge badge = new Badge();
        badge.setName("Bronze");
        when(repo.findByUnlockLevelLessThanEqual(3)).thenReturn(List.of(badge));

        List<Badge> badges = service.getBadgesByUnlockLevel(3);

        assertThat(badges).hasSize(1);
        assertThat(badges.get(0).getName()).isEqualTo("Bronze");
    }

    @Test
    void updateBadgeKeepsExistingImageWhenNoNewFileIsProvided() {
        Badge existing = new Badge();
        existing.setName("Old");
        existing.setDescription("Old description");
        existing.setUnlockLevel(1);
        existing.setImageData(new byte[] { 1, 2, 3 });
        existing.setImageType("image/png");

        Badge updated = new Badge();
        updated.setName("New");
        updated.setDescription("New description");
        updated.setUnlockLevel(5);

        when(repo.findById(7L)).thenReturn(Optional.of(existing));
        when(repo.save(any(Badge.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Badge result = service.updateBadge(7L, updated);

        assertThat(result.getName()).isEqualTo("New");
        assertThat(result.getDescription()).isEqualTo("New description");
        assertThat(result.getUnlockLevel()).isEqualTo(5);
        assertThat(result.getImageData()).containsExactly(1, 2, 3);
        assertThat(result.getImageType()).isEqualTo("image/png");
        verify(repo).save(existing);
    }
}
