package tn.esprit.jungledraft.Services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
@Slf4j
public class OcrService {

    public String extraireTexte(MultipartFile photo) throws Exception {
        // Sauvegarder l'image temporairement
        Path tempImage = Files.createTempFile("ocr_", ".png");
        photo.transferTo(tempImage.toFile());

        // Fichier de sortie
        Path tempOutput = Files.createTempFile("ocr_output_", "");
        String outputBase = tempOutput.toString().replace(".txt", "");

        log.info("📸 Analyse de l'image: {}", photo.getOriginalFilename());

        // Exécuter Tesseract en ligne de commande
        ProcessBuilder pb = new ProcessBuilder(
                "tesseract",
                tempImage.toString(),
                outputBase,
                "-l", "eng+fra"
        );

        Process process = pb.start();
        int exitCode = process.waitFor();

        String texte = "";
        if (exitCode == 0) {
            File outputFile = new File(outputBase + ".txt");
            if (outputFile.exists()) {
                texte = Files.readString(outputFile.toPath()).trim();
                outputFile.delete();
                log.info("📝 Texte extrait: {}", texte);
            }
        }

        // Nettoyer
        Files.deleteIfExists(tempImage);
        Files.deleteIfExists(Path.of(outputBase + ".txt"));

        return texte.isEmpty() ? "Aucun texte détecté" : texte;
    }
}