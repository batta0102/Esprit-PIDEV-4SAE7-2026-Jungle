package tn.esprit.jungledraft.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClubMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMessage;

    private Long userId;

    private String contenu;

    private int likes;

    private Date dateEnvoi;
    @JsonIgnore
    @ManyToOne(cascade = CascadeType.ALL)
    private Club club;



}