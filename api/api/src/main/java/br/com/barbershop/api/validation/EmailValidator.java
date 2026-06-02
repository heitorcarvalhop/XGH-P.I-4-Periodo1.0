package br.com.barbershop.api.validation;

import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

public final class EmailValidator {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$",
            Pattern.CASE_INSENSITIVE
    );

    private static final Map<String, String> COMMON_DOMAIN_TYPOS = Map.ofEntries(
            Map.entry("gmal.com", "gmail.com"),
            Map.entry("gmial.com", "gmail.com"),
            Map.entry("gmai.com", "gmail.com"),
            Map.entry("gmail.con", "gmail.com"),
            Map.entry("hotmal.com", "hotmail.com"),
            Map.entry("hotmai.com", "hotmail.com"),
            Map.entry("outlok.com", "outlook.com"),
            Map.entry("outlook.con", "outlook.com")
    );

    private EmailValidator() {
    }

    public static String validateAndNormalize(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email e obrigatorio");
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (!EMAIL_PATTERN.matcher(normalizedEmail).matches()) {
            throw new IllegalArgumentException("Email invalido");
        }

        String domain = normalizedEmail.substring(normalizedEmail.indexOf('@') + 1);
        String suggestion = COMMON_DOMAIN_TYPOS.get(domain);
        if (suggestion != null) {
            throw new IllegalArgumentException("Dominio de email incorreto. Voce quis dizer " + suggestion + "?");
        }

        return normalizedEmail;
    }
}
