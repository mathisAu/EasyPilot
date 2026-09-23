package com.easypilot.backend.organization;

import com.easypilot.backend.common.ConflictException;
import com.easypilot.backend.common.ResourceNotFoundException;
import com.easypilot.backend.documenttype.DocumentTypeRepository;
import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.AppUserRepository;
import com.easypilot.backend.user.Role;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final AppUserRepository appUserRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final PasswordEncoder passwordEncoder;

    public OrganizationService(OrganizationRepository organizationRepository,
                                AppUserRepository appUserRepository,
                                DocumentTypeRepository documentTypeRepository,
                                PasswordEncoder passwordEncoder) {
        this.organizationRepository = organizationRepository;
        this.appUserRepository = appUserRepository;
        this.documentTypeRepository = documentTypeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<OrganizationDto> findAll() {
        return organizationRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public OrganizationDto create(OrganizationRequest request) {
        if (appUserRepository.existsByUsernameIgnoreCase(request.customerUsername())) {
            throw new ConflictException("Deze gebruikersnaam is al in gebruik");
        }

        Organization organization = new Organization();
        organization.setName(request.name());
        organization = organizationRepository.save(organization);

        AppUser customerUser = new AppUser();
        customerUser.setUsername(request.customerUsername());
        customerUser.setPasswordHash(passwordEncoder.encode(request.customerPassword()));
        customerUser.setRole(Role.CUSTOMER);
        customerUser.setOrganization(organization);
        appUserRepository.save(customerUser);

        return toDto(organization);
    }

    @Transactional(readOnly = true)
    public OrganizationDto findForCustomer(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organisatie niet gevonden"));
        return toDto(organization);
    }

    @Transactional
    public OrganizationDto updateDetails(Long organizationId, OrganizationDetailsRequest request) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organisatie niet gevonden"));
        organization.setAddress(clean(request.address()));
        organization.setPostalCode(clean(request.postalCode()) != null ? clean(request.postalCode()).toUpperCase() : null);
        organization.setCity(clean(request.city()));
        organization.setKvkNumber(clean(request.kvkNumber()));
        organization.setVatNumber(clean(request.vatNumber()) != null ? clean(request.vatNumber()).toUpperCase() : null);
        organization.setWebsite(clean(request.website()));
        organization.setContactName(clean(request.contactName()));
        organization.setContactEmail(clean(request.contactEmail()));
        organization.setContactPhone(clean(request.contactPhone()));
        return toDto(organizationRepository.save(organization));
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private OrganizationDto toDto(Organization organization) {
        String customerUsername = appUserRepository.findFirstByOrganizationId(organization.getId())
                .map(AppUser::getUsername)
                .orElse(null);
        long documentTypeCount = documentTypeRepository.countByOrganizationId(organization.getId());
        return new OrganizationDto(
                organization.getId(),
                organization.getName(),
                customerUsername,
                (int) documentTypeCount,
                organization.getCreatedAt(),
                organization.getAddress(),
                organization.getPostalCode(),
                organization.getCity(),
                organization.getKvkNumber(),
                organization.getVatNumber(),
                organization.getWebsite(),
                organization.getContactName(),
                organization.getContactEmail(),
                organization.getContactPhone()
        );
    }
}
