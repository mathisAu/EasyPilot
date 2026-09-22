package com.easypilot.backend.extraction;

import com.anthropic.client.AnthropicClient;
import com.anthropic.errors.AnthropicServiceException;
import com.anthropic.models.messages.Base64PdfSource;
import com.anthropic.models.messages.ContentBlockParam;
import com.anthropic.models.messages.DocumentBlockParam;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.TextBlockParam;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class ExtractionService {

    private static final Logger log = LoggerFactory.getLogger(ExtractionService.class);
    private static final String MODEL = "claude-opus-5";

    private final ExtractionTransactionSupport transactionSupport;
    private final AnthropicClientHolder anthropicClientHolder;
    private final ObjectMapper objectMapper;

    public ExtractionService(ExtractionTransactionSupport transactionSupport,
                              AnthropicClientHolder anthropicClientHolder,
                              ObjectMapper objectMapper) {
        this.transactionSupport = transactionSupport;
        this.anthropicClientHolder = anthropicClientHolder;
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
        ExtractionResult result = callAnthropic(ctx);
        transactionSupport.persistResult(documentId, ctx.fieldNames(), result);
    }

    private ExtractionResult callAnthropic(ExtractContext ctx) {
        try {
            AnthropicClient client = anthropicClientHolder.client();
            String base64Data = Base64.getEncoder().encodeToString(ctx.bytes());
            String prompt = buildPrompt(ctx.fieldNames());

            ContentBlockParam fileBlock;
            if ("application/pdf".equalsIgnoreCase(ctx.contentType())) {
                DocumentBlockParam doc = DocumentBlockParam.builder()
                        .source(Base64PdfSource.builder().data(base64Data).build())
                        .build();
                fileBlock = ContentBlockParam.ofDocument(doc);
            } else {
                fileBlock = buildImageBlock(base64Data, ctx.contentType());
            }

            MessageCreateParams params = MessageCreateParams.builder()
                    .model(MODEL)
                    .maxTokens(4096L)
                    .addUserMessageOfBlockParams(List.of(
                            fileBlock,
                            ContentBlockParam.ofText(TextBlockParam.builder().text(prompt).build())
                    ))
                    .build();

            Message response = client.messages().create(params);

            StringBuilder rawText = new StringBuilder();
            for (var block : response.content()) {
                block.text().ifPresent(t -> rawText.append(t.text()));
            }

            Map<String, String> parsed = parseJsonResponse(rawText.toString());
            return ExtractionResult.success(parsed);
        } catch (AnthropicServiceException e) {
            log.warn("Anthropic API-fout tijdens extractie: {}", e.getMessage());
            return ExtractionResult.failure("Extractie via Claude is mislukt: " + e.getMessage());
        } catch (Exception e) {
            log.error("Onverwachte fout tijdens extractie", e);
            return ExtractionResult.failure("Er ging iets mis tijdens de extractie: " + e.getMessage());
        }
    }

    private ContentBlockParam buildImageBlock(String base64Data, String contentType) {
        com.anthropic.models.messages.Base64ImageSource source = com.anthropic.models.messages.Base64ImageSource.builder()
                .data(base64Data)
                .mediaType(com.anthropic.models.messages.Base64ImageSource.MediaType.of(contentType))
                .build();
        com.anthropic.models.messages.ImageBlockParam image = com.anthropic.models.messages.ImageBlockParam.builder()
                .source(source)
                .build();
        return ContentBlockParam.ofImage(image);
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
            throw new IllegalStateException("Onverwachte reactie van Claude ontvangen", e);
        }
    }
}
