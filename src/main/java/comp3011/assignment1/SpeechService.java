package comp3011.assignment1;

import comp3011.assignment1.records.GlobalStatsResponse;
import comp3011.assignment1.records.ShutdownResponse;
import comp3011.assignment1.records.UptimeResponse;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.audio.AudioModel;
import com.openai.models.audio.transcriptions.Transcription;
import com.openai.models.audio.transcriptions.TranscriptionCreateParams;
import org.springframework.web.client.RestClient;

@Service
public class SpeechService {
    private final OpenAIClient gpt;
    private final Clock clock;
    private final String startUTC;
    private final long startMillis;
    private long totalInput = 0;
    private long totalOutput = 0;

    SpeechService() {
        gpt = OpenAIOkHttpClient.fromEnv();
        clock = Clock.systemUTC();
        startUTC = clock.instant().toString();
        startMillis = clock.millis();
    }

    String textFromSpeechHelper(byte[] audioBytes) {
        try {
            Path path = Files.createTempFile("audioFile", ".webm");
            Files.write(path, audioBytes);
            TranscriptionCreateParams createParams = TranscriptionCreateParams.builder()
                    .file(path)
                    .model(AudioModel.GPT_4O_MINI_TRANSCRIBE)
                    .build();

            Transcription transcription =
                    gpt.audio().transcriptions().create(createParams).asTranscription();

            // add tokens if attached to response
            // todo race condition: multiple updates to tokens
            transcription.usage().ifPresent(usage -> {
                usage.tokens().ifPresent(tokens -> {
                    totalInput += tokens.inputTokens();
                    totalOutput += tokens.outputTokens();
                });
            });

            return transcription.text();

        } catch (IOException e) {
            System.out.println("Unable to create temp file");
            throw new RuntimeException("An unexpected server error occurred while processing speech.");        }
    }

    UptimeResponse uptimeHelper() {
        return new UptimeResponse(startUTC, clock.instant().toString(), (double) (clock.millis() - startMillis) /1000);
    }

    GlobalStatsResponse statsHelper() {
        return new GlobalStatsResponse(totalInput, totalOutput);
    }

    ShutdownResponse shutdownHelper() {
        RestClient shutdownClient = RestClient.create();
        shutdownClient.post().uri("http://localhost:8080/actuator/shutdown").retrieve().toBodilessEntity();
        String message = "Graceful shutdown requested.";
        return new ShutdownResponse(message);
    }
}
