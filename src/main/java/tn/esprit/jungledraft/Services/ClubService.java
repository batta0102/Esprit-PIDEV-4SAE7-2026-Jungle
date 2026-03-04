package tn.esprit.jungledraft.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.jungledraft.Entities.*;
import tn.esprit.jungledraft.Repositories.*;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClubService {

    private final ClubRep clubRepository;
    private final BuddyPairRep buddyPairRep;
    private  final ClubMessageRep clubMessageRep;
    private final CommentRep commentRep;
    private final ClubMembershipRep clubMembershipRep;
    private final DisponibiliteRepository disponibiliteRepository;


    public Club create(Club club) {
        club.setDateCreation(Date.valueOf(LocalDate.now()));
        club.setStatus(ClubStatus.ACTIVE);
        club.setNom(club.getNom().trim());
        return clubRepository.save(club);
    }

    public List<Club> getAllClubsByOwner(Long id){
        return clubRepository.findAllByClubOwner(id);
    }

    public List<Club> getAll() {
        return clubRepository.findAll();
    }


    public Optional<Club> getById(Long id) {
        return clubRepository.findById(id);
    }


    public Club update(Club club) {
        Optional<Club> existing = clubRepository.findById(club.getIdClub());
        if (existing.isPresent()) {
            Club toUpdate = existing.get();


            toUpdate.setNom(club.getNom());
            toUpdate.setClubOwner(club.getClubOwner());
            toUpdate.setDescription(club.getDescription());
            toUpdate.setNiveau(club.getNiveau());
            toUpdate.setCapacityMax(club.getCapacityMax());
            toUpdate.setStatus(club.getStatus());

            return clubRepository.save(toUpdate);
        } else {
            throw new RuntimeException("Club not found with id " + club.getIdClub());
        }
    }


    public void delete(Long id) {
        Optional<Club> existing = clubRepository.findById(id);
        List<BuddyPair> list = buddyPairRep.findByClubIdClub(id);
        for (BuddyPair p :list){
            List<Disponibilite> disp = disponibiliteRepository.findByBuddyPairId(p.getIdPair());
            for (Disponibilite d : disp){
                disponibiliteRepository.deleteById(d.getId());
            }
            buddyPairRep.deleteById(p.getIdPair());
        }

        List<ClubMessage> messages = clubMessageRep.findByClubId(id);
        for( ClubMessage c :messages){
            List<Comment> comments = commentRep.findByClubMessageIdMessage(c.getIdMessage());
            for(Comment cm : comments){
                commentRep.deleteById(cm.getCommentId());
            }
            clubMessageRep.deleteById(c.getIdMessage());
        }

        List<ClubMembership> members= clubMembershipRep.findAllByClubIdClub(id);
        for (ClubMembership m : members){
            clubMembershipRep.deleteById(m.getIdInscription());
        }


        if (existing.isPresent()) {
            clubRepository.deleteById(id);
        } else {
            throw new RuntimeException("Club not found with id " + id);
        }
    }
}
