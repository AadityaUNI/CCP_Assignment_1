package comp3011.assignment1;

import comp3011.assignment1.records.GlobalStatsResponse;
import comp3011.assignment1.records.ShutdownResponse;
import comp3011.assignment1.records.UptimeResponse;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class SpeechController {
    private final SpeechService service;

    public SpeechController(SpeechService service) {
        this.service = service;
    }

    @PostMapping(value = "/api/v1/getTextFromSpeech", consumes = "audio/webm")
    String getTextFromSpeech(@RequestBody byte[] audioBytes) {
        return service.textFromSpeechHelper(audioBytes);
    }

    @GetMapping("/api/v1/admin/uptime")
    UptimeResponse getUptime() {
        return service.uptimeHelper();
    }

    @PostMapping("/api/v1/admin/shutdown")
    public ResponseEntity<ShutdownResponse> shutdown() {
        return service.shutdownHelper();
    }

    @GetMapping("/api/v1/global/stats")
    GlobalStatsResponse globalStats() {
        return service.statsHelper();
    }
}
