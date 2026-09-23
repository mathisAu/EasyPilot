package com.easypilot.backend.email;

final class EmailTemplates {

    private EmailTemplates() {
    }

    private static String shell(String preheader, String bodyHtml) {
        return "<!DOCTYPE html>"
                + "<html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
                + "<title>EasyPilot</title></head>"
                + "<body style=\"margin:0;padding:0;background:#f4f7fb;font-family:'DM Sans',Arial,sans-serif;\">"
                + "<span style=\"display:none;font-size:1px;color:#f4f7fb;line-height:1px;max-height:0;overflow:hidden;\">" + preheader + "</span>"
                + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f4f7fb;padding:32px 16px;\">"
                + "<tr><td align=\"center\">"
                + "<table role=\"presentation\" width=\"460\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:460px;width:100%;background:#ffffff;border-radius:14px;border:1px solid #e2e9f0;overflow:hidden;\">"
                + "<tr><td style=\"padding:28px 32px 0;\">"
                + "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\"><tr>"
                + "<td style=\"width:36px;height:36px;border-radius:10px;background:#1689e6;text-align:center;vertical-align:middle;font-size:18px;color:#ffffff;font-weight:800;\">&#10148;</td>"
                + "<td style=\"padding-left:10px;font:800 22px 'Manrope',Arial,sans-serif;color:#152f55;\">Easy<span style=\"color:#1689e6;\">Pilot</span></td>"
                + "</tr></table>"
                + "</td></tr>"
                + "<tr><td style=\"padding:24px 32px 32px;\">" + bodyHtml + "</td></tr>"
                + "</table>"
                + "<p style=\"margin:20px 0 0;color:#9aabbd;font-size:11px;\">EasyPilot &middot; Dit is een automatisch gegenereerde e-mail</p>"
                + "</td></tr></table>"
                + "</body></html>";
    }

    private static String button(String href, String label) {
        return "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin:26px 0;\"><tr>"
                + "<td style=\"border-radius:8px;background:#1689e6;\">"
                + "<a href=\"" + href + "\" style=\"display:inline-block;padding:13px 22px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;\">" + label + "</a>"
                + "</td></tr></table>";
    }

    static String passwordReset(String name, String resetUrl, int expiryMinutes) {
        String body = "<h1 style=\"margin:0 0 4px;color:#152f55;font:800 20px 'Manrope',Arial,sans-serif;\">Wachtwoord resetten</h1>"
                + "<p style=\"margin:14px 0 0;color:#5d7189;font-size:14px;line-height:1.6;\">Hoi " + name + ",</p>"
                + "<p style=\"margin:10px 0 0;color:#5d7189;font-size:14px;line-height:1.6;\">"
                + "We hebben een verzoek ontvangen om het wachtwoord van je EasyPilot-account opnieuw in te stellen. Klik op de knop hieronder om een nieuw wachtwoord te kiezen.</p>"
                + button(resetUrl, "Nieuw wachtwoord instellen")
                + "<p style=\"margin:0;color:#9aabbd;font-size:12px;line-height:1.6;\">Deze link is " + expiryMinutes + " minuten geldig en kan maar &eacute;&eacute;n keer gebruikt worden.</p>"
                + "<p style=\"margin:16px 0 0;padding:14px 16px;background:#f8fafc;border:1px solid #e2e9f0;border-radius:9px;color:#77889f;font-size:12px;line-height:1.6;\">"
                + "Heb je dit niet aangevraagd? Dan kun je deze e-mail negeren &mdash; je wachtwoord blijft ongewijzigd.</p>";
        return shell("Reset je EasyPilot-wachtwoord", body);
    }

    static String passwordChanged(String name) {
        String body = "<h1 style=\"margin:0 0 4px;color:#152f55;font:800 20px 'Manrope',Arial,sans-serif;\">Wachtwoord gewijzigd</h1>"
                + "<p style=\"margin:14px 0 0;color:#5d7189;font-size:14px;line-height:1.6;\">Hoi " + name + ",</p>"
                + "<p style=\"margin:10px 0 0;color:#5d7189;font-size:14px;line-height:1.6;\">"
                + "Het wachtwoord van je EasyPilot-account is zojuist gewijzigd.</p>"
                + "<p style=\"margin:16px 0 0;padding:14px 16px;background:#fdeae5;border:1px solid #f6d0c4;border-radius:9px;color:#a8442a;font-size:12px;line-height:1.6;\">"
                + "Was jij dit niet? Neem dan zo snel mogelijk contact op met support.</p>";
        return shell("Je EasyPilot-wachtwoord is gewijzigd", body);
    }

    static String registrationVerification(String name, String verificationUrl, int expiryHours) {
        String body = "<h1 style=\"margin:0 0 4px;color:#152f55;font:800 20px 'Manrope',Arial,sans-serif;\">Bevestig je account</h1>"
                + "<p style=\"margin:14px 0 0;color:#5d7189;font-size:14px;line-height:1.6;\">Hoi " + name + ",</p>"
                + "<p style=\"margin:10px 0 0;color:#5d7189;font-size:14px;line-height:1.6;\">"
                + "Klik op de knop hieronder om je e-mailadres te bevestigen en je EasyPilot-account te activeren.</p>"
                + button(verificationUrl, "E-mailadres bevestigen")
                + "<p style=\"margin:0;color:#9aabbd;font-size:12px;line-height:1.6;\">Deze link is " + expiryHours + " uur geldig en kan maar één keer gebruikt worden.</p>";
        return shell("Bevestig je EasyPilot-account", body);
    }
}
