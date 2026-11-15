export interface ContactData {
  email: string;
  emailConfigured: boolean;
  linkedin: string;
  linkedinConfigured: boolean;
  cvFileUrl: string;
  cvConfigured: boolean;
}

export const CONTACT_DATA: ContactData = {
  email: 'nauselleadou@gmail.com',
  emailConfigured: true,
  linkedin:
    'https://www.linkedin.com/in/nauselle-adou-8ab870298?utm_source=share_via&utm_content=profile&utm_medium=member_android',
  linkedinConfigured: true,
  cvFileUrl: '/assets/cv/CV_Adou_Marie_Nauselle.pdf',
  cvConfigured: true,
};

/**
 * Télécharge le CV PDF réel via Blob (compatible iframe/session) s'il est configuré,
 * sinon génère un dossier récapitulatif HTML.
 */
export async function downloadPortfolioCvDocument(params: {
  skillsSummary: string[];
  projectsSummary: { title: string; summary: string; tech: string }[];
  certificationsSummary: string[];
}): Promise<{ ok: boolean; error?: string }> {
  if (CONTACT_DATA.cvConfigured && CONTACT_DATA.cvFileUrl) {
    try {
      const response = await fetch(CONTACT_DATA.cvFileUrl, {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!response.ok) {
        return { ok: false, error: 'Le fichier CV est momentanément inaccessible.' };
      }

      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const isPdf =
        bytes.length >= 4 &&
        bytes[0] === 0x25 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x44 &&
        bytes[3] === 0x46;

      if (!isPdf) {
        return { ok: false, error: 'Le document récupéré n’est pas un fichier PDF valide.' };
      }

      const blob = new Blob([bytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'CV_Adou_Marie_Nauselle.pdf';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Impossible de lancer le téléchargement du CV PDF.' };
    }
  }

  const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>CV — Mon Voyage Numérique</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #0B1622; max-width: 820px; margin: 40px auto; padding: 0 24px; line-height: 1.55; }
    h1 { color: #0B1622; margin-bottom: 4px; }
    .subtitle { color: #184354; font-size: 14px; margin-bottom: 24px; border-bottom: 1px solid #D8CCB8; padding-bottom: 12px; }
    h2 { color: #184354; font-size: 16px; margin-top: 24px; border-bottom: 1px solid #EAE3D5; padding-bottom: 4px; }
    ul { padding-left: 18px; }
    li { margin-bottom: 6px; }
    a { color: #184354; }
    .note { margin-top: 28px; padding: 12px 16px; background: #F6F3EC; border: 1px solid #D8CCB8; border-radius: 8px; font-size: 13px; color: #4A5562; }
  </style>
</head>
<body>
  <h1>Dossier de Profil — Mon Voyage Numérique</h1>
  <div class="subtitle">Adou Marie Nauselle Kimberly Aude · Développement, Data Science & Intelligence Artificielle</div>

  <h2>Coordonnées</h2>
  <ul>
    <li><strong>E-mail :</strong> <a href="mailto:${CONTACT_DATA.email}">${CONTACT_DATA.email}</a></li>
    <li><strong>LinkedIn :</strong> <a href="${CONTACT_DATA.linkedin}" target="_blank" rel="noopener noreferrer">Profil LinkedIn</a></li>
  </ul>

  <h2>Compétences techniques</h2>
  <ul>
    ${params.skillsSummary.map((line) => `<li>${line}</li>`).join('\n    ')}
  </ul>

  <h2>Projets réalisés</h2>
  <ul>
    ${params.projectsSummary
      .map((p) => `<li><strong>${p.title}</strong> — ${p.summary}${p.tech ? ` (${p.tech})` : ''}</li>`)
      .join('\n    ')}
  </ul>

  <h2>Certifications et formations</h2>
  <ul>
    ${params.certificationsSummary.map((c) => `<li>${c}</li>`).join('\n    ')}
  </ul>

  <div class="note">
    Document généré depuis l’espace portfolio « Mon Voyage Numérique ». Pour associer un CV PDF final, renseignez <code>cvFileUrl</code> et <code>cvConfigured: true</code> dans <code>src/data/contact.ts</code>.
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'CV_Mon_Voyage_Numerique.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return { ok: true };
}
