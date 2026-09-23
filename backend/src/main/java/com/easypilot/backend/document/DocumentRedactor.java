package com.easypilot.backend.document;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Burns field edits directly into a copy of the original uploaded file: covers
 * the region an extracted field's value was found in with white, then (unless
 * the field was unchecked/removed) draws the current value on top. Coordinates
 * on each edit are fractions (0-1) of page/image width and height, from the
 * top-left corner, as produced by the AI extraction step — a field with no
 * known location is simply left untouched.
 */
final class DocumentRedactor {

    record FieldEdit(int page, double x, double y, double width, double height, String newValue) {
    }

    private DocumentRedactor() {
    }

    static byte[] redactPdf(byte[] original, List<FieldEdit> edits) {
        try (PDDocument document = Loader.loadPDF(original)) {
            PDFont font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            Map<Integer, List<FieldEdit>> byPage = groupByPage(edits, document.getNumberOfPages());

            for (Map.Entry<Integer, List<FieldEdit>> entry : byPage.entrySet()) {
                PDPage page = document.getPage(entry.getKey());
                float pageWidth = page.getMediaBox().getWidth();
                float pageHeight = page.getMediaBox().getHeight();

                try (PDPageContentStream stream = new PDPageContentStream(
                        document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    for (FieldEdit edit : entry.getValue()) {
                        float boxX = (float) (edit.x() * pageWidth);
                        float boxW = (float) (edit.width() * pageWidth);
                        float boxH = (float) (edit.height() * pageHeight);
                        float boxYFromTop = (float) (edit.y() * pageHeight);
                        float boxY = pageHeight - boxYFromTop - boxH;
                        if (boxW <= 0 || boxH <= 0) {
                            continue;
                        }

                        stream.setNonStrokingColor(Color.WHITE);
                        stream.addRect(boxX, boxY, boxW, boxH);
                        stream.fill();

                        String text = sanitize(edit.newValue());
                        if (text != null && !text.isBlank()) {
                            float fontSize = Math.max(6f, Math.min(boxH * 0.72f, 11f));
                            stream.setNonStrokingColor(Color.BLACK);
                            stream.beginText();
                            stream.setFont(font, fontSize);
                            stream.newLineAtOffset(boxX + 2, boxY + Math.max(1f, (boxH - fontSize) / 2f));
                            stream.showText(text);
                            stream.endText();
                        }
                    }
                }
            }

            // A white rectangle only hides the old text visually — the original characters
            // are still sitting in the page's text layer underneath and remain copyable /
            // extractable (confirmed via pdftotext), which defeats the entire point of
            // removing a field. Flattening every page to a raster image after editing is
            // what actually removes it, at the cost of the page no longer having a
            // selectable text layer at all — an acceptable trade for a redacted download.
            return flattenToImages(document);
        } catch (IOException e) {
            throw new UncheckedIOException("Kon aangepaste PDF niet genereren", e);
        }
    }

    private static byte[] flattenToImages(PDDocument document) throws IOException {
        PDFRenderer renderer = new PDFRenderer(document);
        try (PDDocument flattened = new PDDocument()) {
            for (int i = 0; i < document.getNumberOfPages(); i++) {
                BufferedImage rendered = renderer.renderImageWithDPI(i, 200, ImageType.RGB);
                PDRectangle mediaBox = document.getPage(i).getMediaBox();
                PDPage flatPage = new PDPage(mediaBox);
                flattened.addPage(flatPage);
                PDImageXObject imageXObject = LosslessFactory.createFromImage(flattened, rendered);
                try (PDPageContentStream stream = new PDPageContentStream(flattened, flatPage)) {
                    stream.drawImage(imageXObject, 0, 0, mediaBox.getWidth(), mediaBox.getHeight());
                }
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            flattened.save(out);
            return out.toByteArray();
        }
    }

    static byte[] redactImage(byte[] original, String formatName, List<FieldEdit> edits) {
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(original));
            if (image == null) {
                throw new IOException("Kon afbeelding niet lezen");
            }
            Graphics2D g = image.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            int imageWidth = image.getWidth();
            int imageHeight = image.getHeight();

            for (FieldEdit edit : edits) {
                if (edit.page() != 0) {
                    continue;
                }
                int boxX = (int) Math.round(edit.x() * imageWidth);
                int boxY = (int) Math.round(edit.y() * imageHeight);
                int boxW = (int) Math.round(edit.width() * imageWidth);
                int boxH = (int) Math.round(edit.height() * imageHeight);
                if (boxW <= 0 || boxH <= 0) {
                    continue;
                }

                g.setColor(Color.WHITE);
                g.fillRect(boxX, boxY, boxW, boxH);

                String text = sanitize(edit.newValue());
                if (text != null && !text.isBlank()) {
                    int fontSize = Math.max(8, Math.min(boxH - 4, 28));
                    g.setColor(Color.BLACK);
                    g.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, fontSize));
                    g.drawString(text, boxX + 2, boxY + boxH - Math.max(2, boxH / 6));
                }
            }
            g.dispose();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(image, formatName, out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException("Kon aangepaste afbeelding niet genereren", e);
        }
    }

    private static Map<Integer, List<FieldEdit>> groupByPage(List<FieldEdit> edits, int pageCount) {
        Map<Integer, List<FieldEdit>> byPage = new LinkedHashMap<>();
        for (FieldEdit edit : edits) {
            int page = Math.max(0, Math.min(edit.page(), pageCount - 1));
            byPage.computeIfAbsent(page, key -> new ArrayList<>()).add(clamp(edit));
        }
        return byPage;
    }

    private static FieldEdit clamp(FieldEdit edit) {
        double x = clamp01(edit.x());
        double y = clamp01(edit.y());
        double width = Math.max(0, Math.min(edit.width(), 1 - x));
        double height = Math.max(0, Math.min(edit.height(), 1 - y));
        return new FieldEdit(edit.page(), x, y, width, height, edit.newValue());
    }

    private static double clamp01(double value) {
        if (Double.isNaN(value)) {
            return 0;
        }
        return Math.max(0, Math.min(value, 1));
    }

    // Same rationale as SummaryPdfGenerator.sanitize(): the built-in Helvetica font
    // only supports WinAnsiEncoding, and raw control characters crash showText().
    private static String sanitize(String text) {
        if (text == null) {
            return null;
        }
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
}
