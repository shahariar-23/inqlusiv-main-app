package com.inqlusiv.mainapp.modules.auth.dto;

public class LoginResponse {
    private String token;
    private String setupStatus;

    public LoginResponse(String token, String setupStatus) {
        this.token = token;
        this.setupStatus = setupStatus;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getSetupStatus() {
        return setupStatus;
    }

    public void setSetupStatus(String setupStatus) {
        this.setupStatus = setupStatus;
    }
}
