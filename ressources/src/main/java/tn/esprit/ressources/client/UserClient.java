package tn.esprit.ressources.client;

import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.ressources.dto.user.UserClientDto;

@FeignClient(name = "user-service", url = "${app.user-service.base-url:http://localhost:8083}")
public interface UserClient {

    @GetMapping("/api/users/getById/{id}")
    UserClientDto getUserById(@PathVariable("id") Long id);

    @GetMapping("/api/users/livreurs/{id}")
    UserClientDto getLivreurById(@PathVariable("id") Long id);

    @GetMapping("/api/users/livreurs")
    List<UserClientDto> getAllLivreurs();
}
