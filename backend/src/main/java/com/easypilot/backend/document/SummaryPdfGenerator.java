package com.easypilot.backend.document;

import com.easypilot.backend.extraction.ExtractedField;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Builds a standalone "samenvatting" PDF from the (already filtered) extracted
 * fields of a document. Deliberately never touches the original uploaded file:
 * a field the admin cleared in the review screen is simply absent from this
 * generated document, rather than requiring any redaction of the source scan.
 */
final class SummaryPdfGenerator {

    private static final float MARGIN = 50;
    private static final float FIELD_FONT_SIZE = 11;
    private static final float LINE_HEIGHT = 18;
    private static final DateTimeFormatter TIMESTAMP_FORMAT =
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm").withZone(ZoneId.systemDefault());

    private SummaryPdfGenerator() {
    }

    static byte[] generate(String documentTypeName, String originalFilename, List<ExtractedField> fields) {
        try (PDDocument document = new PDDocument()) {
            PDFont regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDFont bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            float maxWidth = page.getMediaBox().getWidth() - 2 * MARGIN;
            float y = page.getMediaBox().getHeight() - MARGIN;
            PDPageContentStream stream = new PDPageContentStream(document, page);

            y = writeLine(stream, bold, 16, y, sanitize(documentTypeName));
            y -= 4;
            y = writeLine(stream, regular, 10, y, sanitize("Origineel bestand: " + originalFilename));
            y = writeLine(stream, regular, 10, y, "Samenvatting gegenereerd op " + TIMESTAMP_FORMAT.format(Instant.now()));
            y -= LINE_HEIGHT;

            if (fields.isEmpty()) {
                writeLine(stream, regular, FIELD_FONT_SIZE, y, "Geen gegevens beschikbaar.");
            } else {
                for (ExtractedField field : fields) {
                    String text = sanitize(field.getFieldName() + ": " + field.getValue());
                    for (String line : wrap(text, regular, FIELD_FONT_SIZE, maxWidth)) {
                        if (y < MARGIN) {
                            stream.close();
                            page = new PDPage(PDRectangle.A4);
                            document.addPage(page);
                            stream = new PDPageContentStream(document, page);
                            y = page.getMediaBox().getHeight() - MARGIN;
                        }
                        y = writeLine(stream, regular, FIELD_FONT_SIZE, y, line);
                    }
                }
            }
            stream.close();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException("Kon samenvattings-PDF niet genereren", e);
        }
    }

    private static float writeLine(PDPageContentStream stream, PDFont font, float size, float y, String text)
            throws IOException {
        stream.beginText();
        stream.setFont(font, size);
        stream.newLineAtOffset(MARGIN, y);
        stream.showText(text);
        stream.endText();
        return y - LINE_HEIGHT;
    }

    // The built-in Helvetica fonts only support WinAnsiEncoding printable characters;
    // replace anything outside it (accents, emoji, ...) and flatten control characters
    // such as embedded newlines in multi-line field values (e.g. a wrapped address) to
    // spaces, since showText() throws on both instead of letting PDFBox crash mid-render.
    private static String sanitize(String text) {
        StringBuilder builder = new StringBuilder(text.length());
        for (char c : text.toCharArray()) {
            if (c < 0x20) {
                builder.append(' ');
            } else if (c < 256) {
                builder.append(c);
            } else {
                builder.append('?');
            }
        }
        return builder.toString().replaceAll(" {2,}", " ").trim();
    }

    private static List<String> wrap(String text, PDFont font, float size, float maxWidth) throws IOException {
        List<String> lines = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        for (String word : text.split(" ")) {
            String candidate = current.isEmpty() ? word : current + " " + word;
            if (!current.isEmpty() && font.getStringWidth(candidate) / 1000 * size > maxWidth) {
                lines.add(current.toString());
                current = new StringBuilder(word);
            } else {
                current = new StringBuilder(candidate);
            }
        }
        if (!current.isEmpty()) {
            lines.add(current.toString());
        }
        return lines;
    }
}
