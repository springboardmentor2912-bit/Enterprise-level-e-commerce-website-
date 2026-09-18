package shopstack_backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

/**
 * Last-resort safety net, not a replacement for the try/catch blocks
 * already in every controller. Those already handle expected business
 * failures (bad input, insufficient stock, unauthorized, etc.) with a
 * clean message. This only catches what slips past that: genuine bugs,
 * malformed requests, and infrastructure errors that would otherwise
 * surface as a raw stack trace or Spring's default error page.
 *
 * Response bodies here are plain strings (not a wrapped JSON object) to
 * match the convention every controller in this app already uses
 * (ResponseEntity.badRequest().body(e.getMessage())) — so frontend code
 * doing err.response?.data always gets a displayable string, whether the
 * exception was caught locally or fell through to here.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(safeMessage(e, "That request wasn't valid."));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalState(IllegalStateException e) {
        return ResponseEntity.badRequest().body(safeMessage(e, "That action couldn't be completed right now."));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<String> handleSecurity(SecurityException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(safeMessage(e, "You don't have permission to do that."));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDenied(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to do that.");
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> handleBadCredentials(BadCredentialsException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<String> handleAuthentication(org.springframework.security.core.AuthenticationException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please log in to continue.");
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleBadJson(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body("That request wasn't formatted correctly. Please try again.");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<String> handleTypeMismatch(MethodArgumentTypeMismatchException e) {
        return ResponseEntity.badRequest().body("One of the values in this request isn't valid.");
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<String> handleMethodNotAllowed(HttpRequestMethodNotSupportedException e) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body("That action isn't supported here.");
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<String> handleNotFound(NoHandlerFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("That page or resource doesn't exist.");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDataIntegrity(DataIntegrityViolationException e) {
        // e.g. a stale DB constraint or an unexpected duplicate/FK clash —
        // never expose the raw SQL error to the client. Logged server-side
        // for follow-up (this is exactly the class of error that surfaced
        // as a raw Postgres stack trace earlier in this project).
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("This action couldn't be completed because it conflicts with existing data.");
    }

    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    public ResponseEntity<String> handleConstraintViolation(jakarta.validation.ConstraintViolationException e) {
        return ResponseEntity.badRequest().body("One or more fields are invalid. Please check your input.");
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidation(org.springframework.web.bind.MethodArgumentNotValidException e) {
        String detail = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .orElse("One or more fields are invalid.");
        return ResponseEntity.badRequest().body(detail);
    }

    // Absolute last resort — a genuine, unanticipated bug. Full detail is
    // logged server-side; the client only ever sees a generic, safe
    // message, never a stack trace or internal class/query names.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleUnknown(Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Something went wrong on our end. Please try again in a moment.");
    }

    private String safeMessage(RuntimeException e, String fallback) {
        return (e.getMessage() != null && !e.getMessage().isBlank()) ? e.getMessage() : fallback;
    }
}
