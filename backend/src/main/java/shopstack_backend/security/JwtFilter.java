package shopstack_backend.security;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;


@Component
public class JwtFilter extends OncePerRequestFilter {


    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;


    public JwtFilter(JwtService jwtService,
                     UserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {


        String path = request.getServletPath();


        // IMPORTANT: skip login/register
        if(path.startsWith("/api/auth/")) {

            filterChain.doFilter(request,response);
            return;
        }


        String authHeader = request.getHeader("Authorization");


        if(authHeader == null ||
           !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request,response);
            return;
        }


        try {

            String token = authHeader.substring(7).trim();


            String email = jwtService.extractEmail(token);


            if(email != null &&
               SecurityContextHolder.getContext()
               .getAuthentication() == null) {


                UserDetails userDetails =
                        userDetailsService
                        .loadUserByUsername(email);



                if(jwtService.isTokenValid(token,email)) {


                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );


                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                            .buildDetails(request)
                    );


                    SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);
                }
            }


        } catch(Exception e) {

            System.out.println(
              "Invalid JWT : " + e.getMessage()
            );

        }


        filterChain.doFilter(request,response);

    }
}