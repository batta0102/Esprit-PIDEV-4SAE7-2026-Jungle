package com.example.pi4eme02.Service.Implementing;

import com.example.pi4eme02.Entity.Game;
import com.example.pi4eme02.Repository.GameRepository;
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
class GameServiceImplTest {

    @Mock
    private GameRepository repo;

    @InjectMocks
    private GameServiceImpl service;

    @Test
    void updateGameCopiesAllMutableFields() {
        Game existing = new Game();
        existing.setTitle("Old title");
        existing.setDescription("Old description");
        existing.setCategory("Old category");
        existing.setXpReward(10);
        existing.setTimerDuration(15);

        Game updated = new Game();
        updated.setTitle("New title");
        updated.setDescription("New description");
        updated.setCategory("New category");
        updated.setXpReward(50);
        updated.setTimerDuration(90);

        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(any(Game.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Game result = service.updateGame(1L, updated);

        assertThat(result.getTitle()).isEqualTo("New title");
        assertThat(result.getDescription()).isEqualTo("New description");
        assertThat(result.getCategory()).isEqualTo("New category");
        assertThat(result.getXpReward()).isEqualTo(50);
        assertThat(result.getTimerDuration()).isEqualTo(90);
        verify(repo).save(existing);
    }

    @Test
    void getAllGamesReturnsRepositoryContents() {
        Game game = new Game();
        game.setTitle("Crossword");
        when(repo.findAll()).thenReturn(List.of(game));

        List<Game> games = service.getAllGames();

        assertThat(games).hasSize(1);
        assertThat(games.get(0).getTitle()).isEqualTo("Crossword");
    }
}
