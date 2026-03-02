<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password'); section>
    <#if section = "header">
        <h1 class="oluto-heading">Sign in to your account</h1>
        <p class="oluto-subheading">Welcome back. Enter your credentials to continue.</p>
    <#elseif section = "form">
        <form id="kc-form-login" action="${url.loginAction}" method="post">
            <div class="oluto-form-group">
                <label for="username" class="oluto-label">${msg("email")}</label>
                <input id="username" name="username" type="text" autofocus autocomplete="email"
                       value="${(login.username!'')}"
                       class="oluto-input <#if messagesPerField.existsError('username','password')>oluto-input-error</#if>"
                       aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                       placeholder="you@company.com" />
                <#if messagesPerField.existsError('username','password')>
                    <span class="oluto-field-error">${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}</span>
                </#if>
            </div>

            <div class="oluto-form-group">
                <div class="oluto-label-row">
                    <label for="password" class="oluto-label">${msg("password")}</label>
                    <#if realm.resetPasswordAllowed>
                        <a href="${url.loginResetCredentialsUrl}" class="oluto-link-small">Forgot password?</a>
                    </#if>
                </div>
                <input id="password" name="password" type="password" autocomplete="current-password"
                       class="oluto-input <#if messagesPerField.existsError('username','password')>oluto-input-error</#if>"
                       aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>" />
            </div>

            <#if realm.rememberMe && !usernameHidden??>
                <div class="oluto-checkbox-group">
                    <input id="rememberMe" name="rememberMe" type="checkbox"
                           <#if login.rememberMe??>checked</#if>
                           class="oluto-checkbox" />
                    <label for="rememberMe" class="oluto-checkbox-label">${msg("rememberMe")}</label>
                </div>
            </#if>

            <button type="submit" class="oluto-btn-primary">
                Sign in
            </button>
        </form>
    <#elseif section = "socialProviders">
        <#if realm.password && social?? && social.providers?has_content>
            <div class="oluto-divider">
                <span>or continue with</span>
            </div>
            <div class="oluto-social-providers">
                <#list social.providers as p>
                    <a id="social-${p.alias}" href="${p.loginUrl}" class="oluto-btn-social">
                        <#if p.iconClasses?has_content>
                            <i class="${p.iconClasses!}" aria-hidden="true"></i>
                        </#if>
                        <span>${p.displayName!}</span>
                    </a>
                </#list>
            </div>
        </#if>
    <#elseif section = "info">
        <#if realm.registrationAllowed>
            <p class="oluto-footer-text">
                Don't have an account?
                <a href="${url.registrationUrl}" class="oluto-link">Create one</a>
            </p>
        </#if>
    </#if>
</@layout.registrationLayout>
