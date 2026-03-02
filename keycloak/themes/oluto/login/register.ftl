<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm'); section>
    <#if section = "header">
        <h1 class="oluto-heading">Create your account</h1>
        <p class="oluto-subheading">Start managing your finances with Oluto.</p>
    <#elseif section = "form">
        <form id="kc-register-form" action="${url.registrationAction}" method="post">
            <div class="oluto-form-row">
                <div class="oluto-form-group oluto-form-half">
                    <label for="firstName" class="oluto-label">${msg("firstName")}</label>
                    <input id="firstName" name="firstName" type="text" autocomplete="given-name"
                           value="${(register.formData.firstName!'')}"
                           class="oluto-input <#if messagesPerField.existsError('firstName')>oluto-input-error</#if>"
                           aria-invalid="<#if messagesPerField.existsError('firstName')>true</#if>" />
                    <#if messagesPerField.existsError('firstName')>
                        <span class="oluto-field-error">${kcSanitize(messagesPerField.getFirstError('firstName'))?no_esc}</span>
                    </#if>
                </div>
                <div class="oluto-form-group oluto-form-half">
                    <label for="lastName" class="oluto-label">${msg("lastName")}</label>
                    <input id="lastName" name="lastName" type="text" autocomplete="family-name"
                           value="${(register.formData.lastName!'')}"
                           class="oluto-input <#if messagesPerField.existsError('lastName')>oluto-input-error</#if>"
                           aria-invalid="<#if messagesPerField.existsError('lastName')>true</#if>" />
                    <#if messagesPerField.existsError('lastName')>
                        <span class="oluto-field-error">${kcSanitize(messagesPerField.getFirstError('lastName'))?no_esc}</span>
                    </#if>
                </div>
            </div>

            <div class="oluto-form-group">
                <label for="email" class="oluto-label">${msg("email")}</label>
                <input id="email" name="email" type="email" autocomplete="email"
                       value="${(register.formData.email!'')}"
                       class="oluto-input <#if messagesPerField.existsError('email')>oluto-input-error</#if>"
                       aria-invalid="<#if messagesPerField.existsError('email')>true</#if>"
                       placeholder="you@company.com" />
                <#if messagesPerField.existsError('email')>
                    <span class="oluto-field-error">${kcSanitize(messagesPerField.getFirstError('email'))?no_esc}</span>
                </#if>
            </div>

            <div class="oluto-form-group">
                <label for="password" class="oluto-label">${msg("password")}</label>
                <input id="password" name="password" type="password" autocomplete="new-password"
                       class="oluto-input <#if messagesPerField.existsError('password')>oluto-input-error</#if>"
                       aria-invalid="<#if messagesPerField.existsError('password')>true</#if>" />
                <#if messagesPerField.existsError('password')>
                    <span class="oluto-field-error">${kcSanitize(messagesPerField.getFirstError('password'))?no_esc}</span>
                </#if>
            </div>

            <div class="oluto-form-group">
                <label for="password-confirm" class="oluto-label">${msg("passwordConfirm")}</label>
                <input id="password-confirm" name="password-confirm" type="password" autocomplete="new-password"
                       class="oluto-input <#if messagesPerField.existsError('password-confirm')>oluto-input-error</#if>"
                       aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>" />
                <#if messagesPerField.existsError('password-confirm')>
                    <span class="oluto-field-error">${kcSanitize(messagesPerField.getFirstError('password-confirm'))?no_esc}</span>
                </#if>
            </div>

            <button type="submit" class="oluto-btn-primary">
                Create account
            </button>
        </form>
    <#elseif section = "info">
        <p class="oluto-footer-text">
            Already have an account?
            <a href="${url.loginUrl}" class="oluto-link">Sign in</a>
        </p>
    </#if>
</@layout.registrationLayout>
