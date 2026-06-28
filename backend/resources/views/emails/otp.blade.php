@php
    $isReset = ($purpose ?? 'registration') === 'password_reset';
    $title = $isReset ? 'Reset password' : 'Verifikasi email';
    $heading = $isReset ? 'Permintaan reset password.' : 'Selesaikan pendaftaran kamu.';
    $intro = $isReset
        ? 'Kami menerima permintaan untuk mereset password akun Summerhouses kamu. Masukkan kode di bawah pada halaman reset password untuk membuat password baru.'
        : 'Terima kasih sudah memulai pendaftaran. Masukkan kode 6 digit di bawah pada formulir verifikasi untuk menyelesaikan pembuatan akun.';
    $ctaCopy = $isReset ? 'Kembali ke halaman reset password' : 'Kembali ke halaman pendaftaran';
    $ctaUrl = $isReset
        ? rtrim(config('app.frontend_url', 'http://localhost:3000'), '/') . '/forgot-password'
        : rtrim(config('app.frontend_url', 'http://localhost:3000'), '/') . '/register';
@endphp
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <title>{{ $title }} — Summerhouses Bali</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td, p, a, h1, h2 { font-family: Georgia, 'Times New Roman', serif !important; }
    </style>
    <![endif]-->
    <style type="text/css">
        @media (prefers-color-scheme: dark) {
            body, .sh-bg { background-color: #f4efe6 !important; }
            .sh-card { background-color: #fffaf2 !important; }
            .sh-ink, .sh-code, .sh-display, .sh-wordmark { color: #173021 !important; }
            .sh-muted { color: #695c4d !important; }
            .sh-sage { color: #315f45 !important; }
        }
        a { text-decoration: none; }
        @media only screen and (max-width: 600px) {
            .sh-shell { width: 100% !important; padding: 24px 16px !important; }
            .sh-card-inner { padding: 32px 24px !important; }
            .sh-display { font-size: 28px !important; line-height: 34px !important; }
            .sh-code { font-size: 32px !important; letter-spacing: 8px !important; }
        }
    </style>
</head>
<body class="sh-bg" style="margin:0;padding:0;background-color:#f4efe6;color:#173021;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <!-- Preheader (hidden) -->
    <div style="display:none;font-size:1px;color:#f4efe6;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
        {{ $title }} Summerhouses Bali — kode {{ $code }} berlaku 10 menit. Jangan bagikan kode ini.
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="sh-bg" style="background-color:#f4efe6;">
        <tr>
            <td align="center" valign="top" style="padding:0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="sh-shell" style="width:600px;max-width:600px;padding:48px 24px;">

                    <!-- Wordmark header -->
                    <tr>
                        <td align="center" style="padding:0 0 32px;">
                            <p class="sh-wordmark" style="margin:0;font-family:Georgia,'Playfair Display',serif;font-size:22px;font-weight:400;letter-spacing:-0.01em;color:#173021;line-height:1;">
                                Summerhouses
                            </p>
                            <p class="sh-sage" style="margin:8px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#315f45;line-height:1;">
                                Bali Private Stays
                            </p>
                        </td>
                    </tr>

                    <!-- Editorial card -->
                    <tr>
                        <td>
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="sh-card" style="background-color:#fffaf2;border-radius:20px;overflow:hidden;border:1px solid rgba(23,48,33,0.08);">
                                <tr>
                                    <td class="sh-card-inner" style="padding:48px 48px 40px;">

                                        <!-- Eyebrow -->
                                        <p class="sh-sage" style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#315f45;">
                                            {{ $title }}
                                        </p>

                                        <!-- Display heading -->
                                        <h1 class="sh-display sh-ink" style="margin:0 0 24px;font-family:Georgia,'Playfair Display',serif;font-size:34px;line-height:1.1;font-weight:400;letter-spacing:-0.01em;color:#173021;">
                                            {{ $heading }}
                                        </h1>

                                        <!-- Greeting -->
                                        <p class="sh-ink" style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#173021;">
                                            Halo {{ $name }},
                                        </p>

                                        <!-- Body copy -->
                                        <p class="sh-muted" style="margin:0 0 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#695c4d;">
                                            {{ $intro }}
                                        </p>

                                        <!-- Gold hairline divider (signature accent) -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 16px;">
                                            <tr>
                                                <td height="1" style="background-color:#e9c176;font-size:1px;line-height:1px;">&nbsp;</td>
                                            </tr>
                                        </table>

                                        <!-- OTP block -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4efe6;border-radius:14px;border:1px solid rgba(23,48,33,0.08);">
                                            <tr>
                                                <td align="center" style="padding:28px 16px;">
                                                    <p class="sh-sage" style="margin:0 0 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#315f45;">
                                                        Kode Verifikasi
                                                    </p>
                                                    <p class="sh-code sh-ink" style="margin:0;font-family:'SF Mono','Courier New',Courier,monospace;font-size:40px;font-weight:500;letter-spacing:14px;color:#173021;line-height:1;padding-left:14px;">
                                                        {{ $code }}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Expiry meta -->
                                        <p class="sh-muted" style="margin:24px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.65;color:#695c4d;">
                                            Kode berlaku <strong style="color:#173021;font-weight:600;">{{ $isReset ? '15 menit' : '10 menit' }}</strong> sejak email ini dikirim. Demi keamanan akunmu, jangan teruskan atau bagikan kode ini ke siapa pun — termasuk tim Summerhouses.
                                        </p>

                                        @if($ctaUrl)
                                        <!-- CTA button -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 0;">
                                            <tr>
                                                <td align="left" style="border-radius:999px;background-color:#173021;">
                                                    <a href="{{ $ctaUrl }}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:500;color:#fffaf2;text-decoration:none;border-radius:999px;letter-spacing:0.01em;">
                                                        {{ $ctaCopy }} →
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        @endif

                                    </td>
                                </tr>

                                <!-- Card footer note -->
                                <tr>
                                    <td style="padding:0 48px 36px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td height="1" style="background-color:rgba(23,48,33,0.08);font-size:1px;line-height:1px;">&nbsp;</td>
                                            </tr>
                                        </table>
                                        <p class="sh-muted" style="margin:20px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.65;color:#695c4d;">
                                            @if($isReset)
                                                Jika kamu tidak meminta reset password, abaikan email ini — password kamu tidak akan berubah. Pertimbangkan mengganti password kalau curiga ada aktivitas mencurigakan.
                                            @else
                                                Jika kamu tidak mendaftar di Summerhouses, abaikan email ini. Akun tidak akan dibuat tanpa verifikasi kode.
                                            @endif
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding:32px 24px 8px;">
                            <p class="sh-wordmark" style="margin:0 0 6px;font-family:Georgia,'Playfair Display',serif;font-size:13px;font-weight:400;letter-spacing:-0.01em;color:#173021;line-height:1.4;">
                                Summerhouses Bali
                            </p>
                            <p class="sh-muted" style="margin:0 0 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#695c4d;">
                                Curated private villas across Canggu, Pererenan, Ubud &amp; Uluwatu.
                            </p>
                            <p class="sh-muted" style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#695c4d;">
                                © {{ date('Y') }} Summerhouses Bali. Email dikirim ke {{ explode('@', config('mail.from.address', ''))[1] ?? 'akun terdaftar' }}.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
