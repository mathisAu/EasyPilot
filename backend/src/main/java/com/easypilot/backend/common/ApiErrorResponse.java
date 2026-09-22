package com.easypilot.backend.common;

import java.util.Map;

public record ApiErrorResponse(String message, Map<String, String> errors) {

    public static ApiErrorResponse of(String message) {
        return new ApiErrorResponse(message, null);
    }

    public static ApiErrorResponse of(String message, Map<String, String> errors) {
        return new ApiErrorResponse(message, errors);
    }
}
