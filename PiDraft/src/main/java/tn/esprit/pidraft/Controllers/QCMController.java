package tn.esprit.pidraft.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pidraft.entities.QCM;
import tn.esprit.pidraft.Services.QCMService;

import java.util.List;

@RestController
@RequestMapping("/api/qcms")
public class QCMController {

    private final QCMService service;

    public QCMController(QCMService service) {
        this.service = service;
    }

    @GetMapping
    public List<QCM> getAllQCMs() {
        return service.getAllQCMs();
    }

    @GetMapping("/{id}")
    public ResponseEntity<QCM> getQCMById(@PathVariable Long id) {
        return service.getQCMById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public QCM createQCM(@RequestBody QCM qcm) {
        return service.createQCM(qcm);
    }

    @PutMapping("/{id}")
    public QCM updateQCM(@PathVariable Long id, @RequestBody QCM qcm) {
        return service.updateQCM(id, qcm);
    }

    @DeleteMapping("/{id}")
    public void deleteQCM(@PathVariable Long id) {
        service.deleteQCM(id);
    }
}
