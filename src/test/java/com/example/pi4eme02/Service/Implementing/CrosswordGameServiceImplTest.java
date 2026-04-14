package com.example.pi4eme02.Service.Implementing;

import com.example.pi4eme02.Entity.CrosswordClue;
import com.example.pi4eme02.Entity.CrosswordGame;
import com.example.pi4eme02.Repository.CrosswordGameRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CrosswordGameServiceImplTest {

    @Mock
    private CrosswordGameRepository repo;

    @InjectMocks
    private CrosswordGameServiceImpl service;

    @Test
    void getRandomByDifficultyReturnsEmptyWhenNoGamesMatch() {
        when(repo.findByDifficultyIgnoreCase("Hard")).thenReturn(List.of());

        Optional<CrosswordGame> result = service.getRandomByDifficulty("Hard");

        assertThat(result).isEmpty();
    }

    @Test
    void updateCopiesPuzzleStructure() {
        CrosswordClue clue = new CrosswordClue();
        clue.setId("c1");
        clue.setAnswer("cat");

        CrosswordGame existing = new CrosswordGame();
        existing.setTitle("Old");
        existing.setDifficulty("Beginner");
        existing.setXpReward(10);
        existing.setWidth(5);
        existing.setHeight(5);

        CrosswordGame updated = new CrosswordGame();
        updated.setTitle("New");
        updated.setDifficulty("Hard");
        updated.setXpReward(99);
        updated.setWidth(12);
        updated.setHeight(13);
        updated.setGridRows(List.of("cat"));
        updated.setClues(List.of(clue));

        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(existing)).thenReturn(existing);

        CrosswordGame result = service.update(1L, updated);

        assertThat(result.getTitle()).isEqualTo("New");
        assertThat(result.getDifficulty()).isEqualTo("Hard");
        assertThat(result.getXpReward()).isEqualTo(99);
        assertThat(result.getWidth()).isEqualTo(12);
        assertThat(result.getHeight()).isEqualTo(13);
        assertThat(result.getGridRows()).containsExactly("cat");
        assertThat(result.getClues()).hasSize(1);
    }
}
