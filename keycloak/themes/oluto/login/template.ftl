<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html lang="${(locale.currentLanguageTag)!'en'}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>${msg("loginTitle",(realm.displayName!''))}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
</head>
<body class="oluto-body ${bodyClass}">
    <!-- Animated background orbs -->
    <div class="orb orb-cyan" aria-hidden="true"></div>
    <div class="orb orb-green" aria-hidden="true"></div>
    <div class="orb orb-teal" aria-hidden="true"></div>

    <div class="oluto-container">
        <!-- Logo -->
        <div class="oluto-logo">
            <a href="${properties.kcLogoLink!'#'}" class="oluto-logo-link">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <defs>
                        <linearGradient id="oluto-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stop-color="#14b8a6" />
                            <stop offset="50%" stop-color="#0d9488" />
                            <stop offset="100%" stop-color="#0f766e" />
                        </linearGradient>
                    </defs>
                    <rect x="2" y="2" width="32" height="32" rx="9" fill="url(#oluto-grad)" />
                    <path d="M12 24L24 12M24 12H16M24 12V20" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="oluto-wordmark">
                    <span class="oluto-name">Oluto</span>
                    <span class="oluto-tagline">Direct Your Wealth.</span>
                </div>
            </a>
        </div>

        <!-- Glass card -->
        <div class="oluto-card">
            <div class="oluto-card-header">
                <#nested "header">
            </div>

            <#-- Global alert messages (wrong credentials, account locked, etc.) -->
            <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                <div class="oluto-alert oluto-alert-${message.type}">
                    <#if message.type = 'success'>
                        <svg class="oluto-alert-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>
                    <#elseif message.type = 'error'>
                        <svg class="oluto-alert-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>
                    <#elseif message.type = 'warning'>
                        <svg class="oluto-alert-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>
                    <#else>
                        <svg class="oluto-alert-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" /></svg>
                    </#if>
                    <span>${kcSanitize(message.summary)?no_esc}</span>
                </div>
            </#if>

            <!-- Form content -->
            <#nested "form">

            <!-- Social providers (future OAuth) -->
            <#nested "socialProviders">
        </div>

        <!-- Footer links -->
        <#nested "info">
    </div>
</body>
</html>
</#macro>
