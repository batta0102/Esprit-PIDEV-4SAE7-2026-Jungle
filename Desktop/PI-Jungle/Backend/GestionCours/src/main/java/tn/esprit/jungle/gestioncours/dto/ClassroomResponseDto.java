package tn.esprit.jungle.gestioncours.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ClassroomResponseDto
 * DTO for returning classroom data in API responses
 * Provides a clean and consistent response format to clients
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomResponseDto {

    private Long id;
    private String name;
    private Integer capacity;
}
