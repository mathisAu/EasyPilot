package com.easypilot.backend.organization;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Company/contact details a customer can edit themselves. Blank values clear the field. */
public record OrganizationDetailsRequest(
        @Size(max = 150, message = "Adres mag maximaal 150 tekens zijn") String address,
        @Size(max = 12, message = "Postcode mag maximaal 12 tekens zijn") String postalCode,
        @Size(max = 80, message = "Plaats mag maximaal 80 tekens zijn") String city,
        @Pattern(regexp = "^$|^\\d{8}$", message = "Een KvK-nummer bestaat uit 8 cijfers") String kvkNumber,
        @Size(max = 20, message = "Btw-nummer mag maximaal 20 tekens zijn") String vatNumber,
        @Size(max = 150, message = "Website mag maximaal 150 tekens zijn") String website,
        @Size(max = 100, message = "Naam contactpersoon mag maximaal 100 tekens zijn") String contactName,
        @Email(message = "Vul een geldig e-mailadres in")
        @Size(max = 150, message = "E-mailadres mag maximaal 150 tekens zijn") String contactEmail,
        @Size(max = 30, message = "Telefoonnummer mag maximaal 30 tekens zijn") String contactPhone
) {
}
