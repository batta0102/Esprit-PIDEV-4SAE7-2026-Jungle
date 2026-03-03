package tn.esprit.pidraft.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pidraft.Repositories.InterviewRepository;
import tn.esprit.pidraft.entities.Interview;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository repository;

    public Interview add(Interview i){
        return repository.save(i);
    }

    public List<Interview> getAll(){
        return repository.findAll();
    }

    public Interview getById(Long id){
        return repository.findById(id)
                .orElseThrow();
    }

    public Interview update(Long id,
                            Interview i){

        Interview in = getById(id);

        in.setDateInterview(
                i.getDateInterview());
        in.setType(i.getType());
        in.setResultat(i.getResultat());
        in.setCommentaire(
                i.getCommentaire());

        return repository.save(in);
    }

    public void delete(Long id){
        repository.deleteById(id);
    }
}