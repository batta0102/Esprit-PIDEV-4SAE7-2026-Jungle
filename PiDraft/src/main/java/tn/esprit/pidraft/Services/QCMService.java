package tn.esprit.pidraft.Services;

import org.springframework.stereotype.Service;
import tn.esprit.pidraft.entities.QCM;
import tn.esprit.pidraft.Repositories.QCMRepository;

import java.util.List;
import java.util.Optional;

@Service
public class QCMService {

    private final QCMRepository repository;

    public QCMService(QCMRepository repository) {
        this.repository = repository;
    }

    public List<QCM> getAllQCMs() {
        return repository.findAll();
    }

    public Optional<QCM> getQCMById(Long id) {
        return repository.findById(id);
    }

    public QCM createQCM(QCM qcm) {
        if (qcm.getQuestions() != null) {
            qcm.getQuestions().forEach(q -> {
                q.setQcm(qcm);
                if (q.getChoix() != null) {
                    q.getChoix().forEach(c -> c.setQuestion(q));
                }
            });
        }
        return repository.save(qcm);
    }

    public QCM updateQCM(Long id, QCM qcm) {
        qcm.setId(id);
        if (qcm.getQuestions() != null) {
            qcm.getQuestions().forEach(q -> {
                q.setQcm(qcm);
                if (q.getChoix() != null) {
                    q.getChoix().forEach(c -> c.setQuestion(q));
                }
            });
        }
        return repository.save(qcm);
    }

    public void deleteQCM(Long id) {
        repository.deleteById(id);
    }
}
