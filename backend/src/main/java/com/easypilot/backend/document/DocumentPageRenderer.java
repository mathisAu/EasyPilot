package com.easypilot.backend.document;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;

/**
 * Turns a stored PDF or image into per-page PNGs for the review preview. Serving
 * pages as plain images (instead of the browser's PDF plugin) is what lets the
 * frontend draw a highlight exactly where an extracted field was found.
 */
final class DocumentPageRenderer {

    private static final float PREVIEW_DPI = 110f;

    private DocumentPageRenderer() {
    }

    static int pageCount(byte[] bytes, String contentType) {
        if (!isPdf(contentType)) {
            return 1;
        }
        try (PDDocument document = Loader.loadPDF(bytes)) {
            return document.getNumberOfPages();
        } catch (IOException e) {
            throw new UncheckedIOException("Kon PDF niet lezen", e);
        }
    }

    static byte[] renderPagePng(byte[] bytes, String contentType, int page) {
        try {
            BufferedImage image;
            if (isPdf(contentType)) {
                try (PDDocument document = Loader.loadPDF(bytes)) {
                    int safePage = Math.max(0, Math.min(page, document.getNumberOfPages() - 1));
                    image = new PDFRenderer(document).renderImageWithDPI(safePage, PREVIEW_DPI, ImageType.RGB);
                }
            } else {
                image = ImageIO.read(new ByteArrayInputStream(bytes));
                if (image == null) {
                    throw new IOException("Kon afbeelding niet lezen");
                }
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(image, "png", out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException("Kon pagina niet weergeven", e);
        }
    }

    private static boolean isPdf(String contentType) {
        return "application/pdf".equalsIgnoreCase(contentType);
    }
}
