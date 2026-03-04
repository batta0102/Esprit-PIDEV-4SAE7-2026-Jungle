package tn.esprit.jungledraft.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.jungledraft.Entities.ClubMessage;
import java.util.List;

@Repository
public interface ClubMessageRep extends JpaRepository<ClubMessage, Long> {


    @Query("SELECT cm FROM ClubMessage cm WHERE cm.club.idClub = :clubId")
    List<ClubMessage> findByClubId(@Param("clubId") Long clubId);
}