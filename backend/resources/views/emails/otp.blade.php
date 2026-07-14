@php
    $isReset = ($purpose ?? 'registration') === 'password_reset';
    $title = $isReset ? 'Reset password' : 'Verifikasi email';
    $heading = $isReset ? 'Permintaan reset password.' : 'Selesaikan pendaftaran kamu.';
    $intro = $isReset
        ? 'Kami menerima permintaan untuk mereset password akun Summerhouses kamu. Masukkan kode di bawah pada halaman reset password untuk membuat password baru.'
        : 'Terima kasih sudah memulai pendaftaran. Masukkan kode 6 digit di bawah pada formulir verifikasi untuk menyelesaikan pembuatan akun.';
    $ctaCopy = $isReset ? 'Kembali ke halaman reset password' : 'Kembali ke halaman pendaftaran';
    $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:3000'), '/');
    $ctaUrl = $isReset ? $frontendUrl . '/forgot-password' : $frontendUrl . '/?auth=register';
    $expiry = $isReset ? '15 menit' : '10 menit';
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light only">
    <title>{{ $title }} - Summerhouses Bali</title>
    <style>
        @media only screen and (max-width: 600px) {
            .sh-shell { width: 100% !important; padding: 24px 16px !important; }
            .sh-card-inner { padding: 32px 24px !important; }
            .sh-display { font-size: 28px !important; line-height: 34px !important; }
            .sh-code { font-size: 32px !important; letter-spacing: 8px !important; padding-left: 8px !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;background:#FAFAF9;color:#1a1a1a;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <div style="display:none;font-size:1px;color:#FAFAF9;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
        {{ $title }} Summerhouses Bali - kode {{ $code }} berlaku {{ $expiry }}. Jangan bagikan kode ini.
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAFAF9;">
        <tr>
            <td align="center" valign="top">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="sh-shell" style="width:600px;max-width:600px;padding:48px 24px;">
                    <tr>
                        <td align="center" style="padding:0 0 32px;">
                            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;letter-spacing:-0.01em;color:#1a1a1a;line-height:1;">
                                Summerhouses
                            </p>
                            <p style="margin:8px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#446B4A;line-height:1;">
                                Bali Private Stays
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid rgba(26,26,26,0.08);">
                                <tr>
                                    <td class="sh-card-inner" style="padding:48px 48px 40px;">
                                        <p style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#446B4A;">
                                            {{ $title }}
                                        </p>

                                        <h1 class="sh-display" style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.1;font-weight:400;letter-spacing:-0.01em;color:#1a1a1a;">
                                            {{ $heading }}
                                        </h1>

                                        <p style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#1a1a1a;">
                                            Halo {{ $name }},
                                        </p>

                                        <p style="margin:0 0 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#666666;">
                                            {{ $intro }}
                                        </p>

                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAFAF9;border-radius:16px;border:1px solid rgba(68,107,74,0.14);">
                                            <tr>
                                                <td align="center" style="padding:28px 16px;">
                                                    <p style="margin:0 0 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#446B4A;">
                                                        Kode Verifikasi
                                                    </p>
                                                    <p class="sh-code" style="margin:0;font-family:'SF Mono','Courier New',Courier,monospace;font-size:40px;font-weight:600;letter-spacing:14px;color:#1a1a1a;line-height:1;padding-left:14px;">
                                                        {{ $code }}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin:24px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.65;color:#666666;">
                                            Kode berlaku <strong style="color:#1a1a1a;font-weight:700;">{{ $expiry }}</strong> sejak email ini dikirim. Demi keamanan akunmu, jangan teruskan atau bagikan kode ini kepada siapa pun, termasuk tim Summerhouses.
                                        </p>

                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 0;">
                                            <tr>
                                                <td align="left" style="border-radius:999px;background:#446B4A;">
                                                    <a href="{{ $ctaUrl }}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">
                                                        {{ $ctaCopy }}
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:0 48px 36px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td height="1" style="background:rgba(26,26,26,0.08);font-size:1px;line-height:1px;">&nbsp;</td>
                                            </tr>
                                        </table>
                                        <p style="margin:20px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.65;color:#666666;">
                                            @if($isReset)
                                                Jika kamu tidak meminta reset password, abaikan email ini. Password kamu tidak akan berubah.
                                            @else
                                                Jika kamu tidak mendaftar di Summerhouses, abaikan email ini. Akun tidak akan dibuat tanpa verifikasi kode.
                                            @endif
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:32px 24px 8px;">
                            <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:400;letter-spacing:-0.01em;color:#1a1a1a;line-height:1.4;">
                                Summerhouses Bali
                            </p>
                            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#666666;">
                                Curated private villas across Canggu, Pererenan, Ubud and Uluwatu.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
