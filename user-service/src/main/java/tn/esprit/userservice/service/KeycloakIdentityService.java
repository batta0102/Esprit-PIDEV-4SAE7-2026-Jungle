package tn.esprit.userservice.service;

import jakarta.ws.rs.core.Response;
import java.util.List;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.RolesResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.stereotype.Service;
import tn.esprit.userservice.config.KeycloakProperties;
import tn.esprit.userservice.entity.UserRole;
import tn.esprit.userservice.web.exception.BadRequestException;

@Service
public class KeycloakIdentityService {

    private final KeycloakProperties keycloakProperties;

    public KeycloakIdentityService(KeycloakProperties keycloakProperties) {
        this.keycloakProperties = keycloakProperties;
    }

    public String createUserInKeycloak(String fullName, String email, String password, Boolean enabled) {
        try (Keycloak keycloak = newAdminClient()) {
            RealmResource realm = keycloak.realm(keycloakProperties.realm());
            UsersResource users = realm.users();

            UserRepresentation user = new UserRepresentation();
            user.setUsername(email);
            user.setEmail(email);
            user.setFirstName(fullName);
            user.setEnabled(enabled == null || enabled);
            user.setEmailVerified(Boolean.FALSE);

            if (password != null && !password.isBlank()) {
                CredentialRepresentation credential = new CredentialRepresentation();
                credential.setType(CredentialRepresentation.PASSWORD);
                credential.setTemporary(false);
                credential.setValue(password);
                user.setCredentials(List.of(credential));
            }

            Response response = users.create(user);
            int status = response.getStatus();
            if (status != 201) {
                throw new BadRequestException("Keycloak create user failed with status " + status);
            }

            return extractCreatedId(response);
        }
    }

    public void assignRealmRole(String keycloakUserId, UserRole role) {
        try (Keycloak keycloak = newAdminClient()) {
            RealmResource realm = keycloak.realm(keycloakProperties.realm());
            RolesResource rolesResource = realm.roles();
            UsersResource users = realm.users();

            String roleName = role.name();
            RoleRepresentation roleRepresentation;
            try {
                roleRepresentation = rolesResource.get(roleName).toRepresentation();
            } catch (Exception ex) {
                throw new BadRequestException("Role not found in Keycloak: " + roleName);
            }

            users.get(keycloakUserId).roles().realmLevel().add(List.of(roleRepresentation));
        }
    }

    public void updateUserInKeycloak(String keycloakUserId, String fullName, String email) {
        try (Keycloak keycloak = newAdminClient()) {
            RealmResource realm = keycloak.realm(keycloakProperties.realm());
            UserRepresentation user = realm.users().get(keycloakUserId).toRepresentation();
            user.setFirstName(fullName);
            user.setEmail(email);
            user.setUsername(email);
            realm.users().get(keycloakUserId).update(user);
        }
    }

    private Keycloak newAdminClient() {
        KeycloakBuilder builder = KeycloakBuilder.builder()
                .serverUrl(keycloakProperties.serverUrl())
                .realm(keycloakProperties.adminRealm())
                .clientId(keycloakProperties.adminClientId());

        String clientSecret = trimToNull(keycloakProperties.adminClientSecret());
        if (clientSecret != null) {
            builder.grantType(OAuth2Constants.CLIENT_CREDENTIALS).clientSecret(clientSecret);
        } else {
            builder.grantType(OAuth2Constants.PASSWORD)
                    .username(keycloakProperties.adminUsername())
                    .password(keycloakProperties.adminPassword());
        }

        return builder.build();
    }

    private String extractCreatedId(Response response) {
        String path = response.getLocation() == null ? null : response.getLocation().getPath();
        if (path == null || path.isBlank() || !path.contains("/")) {
            throw new BadRequestException("Unable to extract created user id from Keycloak response");
        }
        return path.substring(path.lastIndexOf('/') + 1);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
