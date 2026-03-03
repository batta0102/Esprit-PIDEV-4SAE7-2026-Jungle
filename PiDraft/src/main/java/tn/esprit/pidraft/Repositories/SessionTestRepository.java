package tn.esprit.pidraft.Repositories;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pidraft.entities.Resultat;
import tn.esprit.pidraft.entities.SessionTest;

public interface SessionTestRepository extends JpaRepository<SessionTest, Long> {
}
