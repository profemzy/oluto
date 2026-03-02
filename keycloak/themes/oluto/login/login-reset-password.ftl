<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        <h1 class="oluto-heading">Reset your password</h1>
        <p class="oluto-subheading">Enter your email and we'll send you a reset link.</p>
    <#elseif section = "form">
        <form id="kc-reset-password-form" action="${url.loginAction}" method="post">
            <div class="oluto-form-group">
                <label for="username" class="oluto-label">${msg("email")}</label>
                <input id="username" name="username" type="text" autofocus autocomplete="email"
                       class="oluto-input <#if messagesPerField.existsError('username')>oluto-input-error</#if>"
                       aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                       placeholder="you@company.com" />
                <#if messagesPerField.existsError('username')>
                    <span class="oluto-field-error">${kcSanitize(messagesPerField.getFirstError('username'))?no_esc}</span>
                </#if>
            </div>

            <button type="submit" class="oluto-btn-primary">
                Send reset link
            </button>
        </form>
    <#elseif section = "info">
        <p class="oluto-footer-text">
            Remember your password?
            <a href="${url.loginUrl}" class="oluto-link">Back to sign in</a>
        </p>
    </#if>
</@layout.registrationLayout>
