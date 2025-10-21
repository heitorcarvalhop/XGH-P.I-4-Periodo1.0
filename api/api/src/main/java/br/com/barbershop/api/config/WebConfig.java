package br.com.barbershop.api.config; // Verifique se o nome do pacote está correto

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Aplica a regra para todos os endpoints

                // ✅ ESTA É A LINHA MAIS IMPORTANTE
                // Adiciona o endereço do front-end à "lista de convidados"
                .allowedOrigins("http://localhost:3000")

                // Permite os métodos que o front-end vai usar
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")

                // Permite todos os cabeçalhos (como Authorization para o token)
                .allowedHeaders("*")

                // Permite o envio de credenciais (cookies, tokens)
                .allowCredentials(true);
    }
}