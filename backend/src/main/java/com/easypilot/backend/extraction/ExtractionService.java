package com.easypilot.backend.extraction;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExtractionService {

    private static final Logger log = LoggerFactory.getLogger(ExtractionService.class);

    private final ExtractionTransactionSupport transactionSupport;
    private final GeminiClientHolder geminiClientHolder;
    private final RestClient geminiRestClient;
    private final ObjectMapper objectMapper;

    public ExtractionService(ExtractionTransactionSupport transactionSupport,
                              GeminiClientHolder geminiClientHolder,
                              RestClient geminiRestClient,
                              ObjectMapper objectMapper) {
        this.transactionSupport = transactionSupport;
        this.geminiClientHolder = geminiClientHolder;
        this.geminiRestClient = geminiRestClient;
        this.objectMapper = objectMapper;
    }

    @Async("extractionExecutor")
    public void extractAsync(Long documentId) {
        try {
            extract(documentId);
        } catch (Exception e) {
            log.error("Onverwachte fout tijdens extractie van document {}", documentId, e);
        }
    }

    public void extract(Long documentId) {
        ExtractContext ctx = transactionSupport.beginExtraction(documentId);
        if (ctx == null) {
            return;
        }
        ExtractionResult result = callGemini(ctx);
        transactionSupport.persistResult(documentId, ctx.fieldNames(), result);
    }

    private ExtractionResult callGemini(ExtractContext ctx) {
        try {
            String base64Data = Base64.getEncoder().encodeToString(ctx.bytes());
            String prompt = buildPrompt(ctx.fieldNames());
            String contentKind = "application/pdf".equalsIgnoreCase(ctx.contentType()) ? "document" : "image";

            Map<String, Object> filePart = new LinkedHashMap<>();
            filePart.put("type", contentKind);
            filePart.put("data", base64Data);
            filePart.put("mime_type", ctx.contentType());

            Map<String, Object> textPart = new LinkedHashMap<>();
            textPart.put("type", "text");
            textPart.put("text", prompt);

            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("model", geminiClientHolder.model());
            requestBody.put("input", List.of(filePart, textPart));

            JsonNode response = geminiRestClient.post()
                    .uri("/v1beta/interactions")
                    .header("x-goog-api-key", geminiClientHolder.apiKey())
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(JsonNode.class);

            String rawText = extractText(response);
            Map<String, String> parsed = parseJsonResponse(rawText);
            return ExtractionResult.success(parsed);
        } catch (RestClientResponseException e) {
            log.warn("Gemini API-fout tijdens extractie: {} {}", e.getStatusCode(), e.getResponseBodyAsString());
            return ExtractionResult.failure("Extractie via Gemini is mislukt: " + e.getStatusCode() + " " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Onverwachte fout tijdens extractie", e);
            return ExtractionResult.failure("Er ging iets mis tijdens de extractie: " + e.getMessage());
        }
    }

    private String extractText(JsonNode response) {
        StringBuilder result = new StringBuilder();
        if (response == null) {
            return "";
        }
        JsonNode steps = response.path("steps");
        for (JsonNode step : steps) {
            if (!"model_output".equals(step.path("type").asText())) {
                continue;
            }
            for (JsonNode contentBlock : step.path("content")) {
                if ("text".equals(contentBlock.path("type").asText())) {
                    result.append(contentBlock.path("text").asText());
                }
            }
        }
        return result.toString();
    }

    private String buildPrompt(List<String> fieldNames) {
        String fieldList = String.join(", ", fieldNames);
        return "Je bent een documentextractie-assistent. Analyseer het bijgevoegde document en haal de volgende "
                + "velden eruit: " + fieldList + ". Antwoord ALLEEN met een geldig JSON-object waarbij de sleutels "
                + "exact deze veldnamen zijn en de waarden de gevonden tekst zijn (of null als het veld niet in het "
                + "document voorkomt). Geen uitleg, geen markdown-opmaak, alleen het JSON-object.";
    }

    private Map<String, String> parseJsonResponse(String rawText) {
        String cleaned = rawText.trim();
        if (cleaned.startsWith("```")) {
            int firstNewline = cleaned.indexOf('\n');
            int lastFence = cleaned.lastIndexOf("```");
            if (firstNewline >= 0 && lastFence > firstNewline) {
                cleaned = cleaned.substring(firstNewline + 1, lastFence).trim();
            }
        }
        try {
            return objectMapper.readValue(cleaned, new TypeReference<Map<String, String>>() {
            });
        } catch (Exception e) {
            log.warn("Kon extractie-antwoord niet parsen als JSON: {}", cleaned);
            throw new IllegalStateException("Onverwachte reactie van Gemini ontvangen", e);
        }
    }
}
