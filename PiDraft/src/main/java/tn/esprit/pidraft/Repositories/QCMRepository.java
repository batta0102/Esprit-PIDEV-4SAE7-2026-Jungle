package tn.esprit.pidraft.Repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pidraft.entities.QCM;

public interface QCMRepository extends JpaRepository<QCM, Long> {
}