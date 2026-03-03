package tn.esprit.pidraft.Services;


import org.springframework.stereotype.Service;
import tn.esprit.pidraft.entities.SessionTest;
import tn.esprit.pidraft.Repositories.SessionTestRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SessionTestService {

    private final SessionTestRepository repository;

    public SessionTestService(SessionTestRepository repository) {
        this.repository = repository;
    }

    public List<SessionTest> getAll() {
        return repository.findAll();
    }

    public Optional<SessionTest> getById(Long id) {
        return repository.findById(id);
    }

    public SessionTest create(SessionTest sessionTest) {
        return repository.save(sessionTest);
    }

    public SessionTest update(Long id, SessionTest sessionTest) {
        sessionTest.setId(id);
        return repository.save(sessionTest);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
