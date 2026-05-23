/*
 * Shared email layout snippets — inline styles + head CSS for client compatibility.
 */

export const EMAIL_HEAD = `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    img.email-logo {
      display: block !important;
      width: 160px !important;
      max-width: 160px !important;
      height: auto !important;
      margin: 0 auto !important;
      border: 0;
    }
    @media only screen and (max-width: 600px) {
      img.email-logo {
        width: 120px !important;
        max-width: 120px !important;
      }
    }
  </style>
</head>`

/** Centered logo header row — pass absolute logo URL. */
export function emailLogoHeader(logoUrl) {
  return `
        <!-- Header -->
        <tr><td align="center" style="background-color:#143C44;padding:20px 32px;border-radius:8px 8px 0 0;">
          <table cellpadding="0" cellspacing="0" border="0" align="center" role="presentation" style="margin:0 auto;">
            <tr><td align="center">
              <img src="${logoUrl}" alt="Inspectrum Inspections" width="160" class="email-logo" style="display:block;width:160px;max-width:160px;height:auto;margin:0 auto;border:0;" />
            </td></tr>
          </table>
        </td></tr>`
}
