import { useState, type FormEvent } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  Braces,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  Download,
  Eye,
  FileBadge2,
  GitBranch,
  Globe,
  GraduationCap,
  Layers,
  Layout,
  Linkedin,
  Loader2,
  Mail,
  Medal,
  Network,
  Orbit,
  Palette,
  Search,
  Send,
  Server,
  Sigma,
  Table2,
  Terminal,
  Trophy,
  User,
  X,
  ZoomIn,
} from 'lucide-react';
import {
  CERTIFICATIONS_DATA,
  CertificationItem,
  HACKATHONS_DATA,
  HackathonItem,
} from '../data/certifications';
import { CONTACT_DATA, downloadPortfolioCvDocument } from '../data/contact';
import { PROFILE_DATA } from '../data/profile';
import { PROJECTS_DATA } from '../data/projects';
import { SKILL_CATEGORIES } from '../data/skills';
import { StationSectionKey } from '../data/stations';
import { PdfCvModal } from './PdfCvModal';
import { ProjectScreenshotGallery } from './ProjectScreenshotGallery';

interface StationContentRendererProps {
  sectionKey: StationSectionKey;
  focusTarget?: string;
}

function SkillIcon({ iconKey }: { iconKey: string }) {
  const cls = 'w-4 h-4 text-[#184354] shrink-0';
  switch (iconKey) {
    case 'code':
      return <Code2 className={cls} />;
    case 'braces':
      return <Braces className={cls} />;
    case 'layout':
      return <Layout className={cls} />;
    case 'palette':
      return <Palette className={cls} />;
    case 'atom':
      return <Orbit className={cls} />;
    case 'server':
      return <Server className={cls} />;
    case 'table':
      return <Table2 className={cls} />;
    case 'sigma':
      return <Sigma className={cls} />;
    case 'search':
      return <Search className={cls} />;
    case 'chart':
    case 'barChart':
      return <BarChart3 className={cls} />;
    case 'database':
      return <Database className={cls} />;
    case 'layers':
      return <Layers className={cls} />;
    case 'cpu':
      return <Cpu className={cls} />;
    case 'orbit':
      return <Orbit className={cls} />;
    case 'network':
      return <Network className={cls} />;
    case 'gitBranch':
      return <GitBranch className={cls} />;
    case 'terminal':
      return <Terminal className={cls} />;
    case 'notebook':
      return <BookOpen className={cls} />;
    default:
      return <Code2 className={cls} />;
  }
}

export function StationContentRenderer({ sectionKey, focusTarget }: StationContentRendererProps) {
  const [avatarError, setAvatarError] = useState(false);
  const [selectedSkillCat, setSelectedSkillCat] = useState<string>(
    focusTarget && SKILL_CATEGORIES.some((c) => c.id === focusTarget) ? focusTarget : 'all'
  );
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(
    focusTarget
      ? CERTIFICATIONS_DATA.find((c) => c.id === focusTarget) ?? CERTIFICATIONS_DATA[0]
      : CERTIFICATIONS_DATA[0]
  );
  const [selectedAccompSpace, setSelectedAccompSpace] = useState<'all' | 'certs' | 'hackathons'>(
    'all'
  );
  const [selectedHackathon, setSelectedHackathon] = useState<HackathonItem>(HACKATHONS_DATA[0]);
  const [zoomedCertImage, setZoomedCertImage] = useState<{ url: string; title: string } | null>(
    null
  );
  const [cvPreviewOpen, setCvPreviewOpen] = useState(false);
  const [cvDownloading, setCvDownloading] = useState(false);
  const [cvDownloadError, setCvDownloadError] = useState<string | null>(null);

  // Contact form state
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  if (sectionKey === 'about') {
    const { about } = PROFILE_DATA;
    return (
      <div className="space-y-6">
        {/* Presentation + Protagonist Portrait */}
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-[#D8CCB8] bg-[#0B1622] shrink-0">
            {!avatarError ? (
              <img
                src={PROFILE_DATA.avatarPath}
                alt="Portrait de Adou Marie Nauselle Kimberly Aude"
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#9EC0D1]">
                <User className="w-10 h-10" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="text-xs font-mono font-medium text-[#184354]">
              Présentation personnelle · {about.academicDomain}
            </div>
            <h4 className="font-editorial text-xl sm:text-2xl font-semibold text-[#0B1622]">
              {about.greeting}
            </h4>
            <p className="text-sm text-[#24292E] leading-relaxed whitespace-pre-line">
              {about.presentation}
            </p>
          </div>
        </div>

        {/* Academic Path */}
        <div className="pt-4 border-t border-[#D8CCB8] space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0B1622]">
            <GraduationCap className="w-4 h-4 text-[#184354]" aria-hidden="true" />
            <span>Parcours académique — {about.academicDomain}</span>
          </div>
          <p className="text-sm text-[#4A5562] leading-relaxed">{about.academicSummary}</p>
        </div>

        {/* Passions */}
        <div className="pt-4 border-t border-[#D8CCB8] space-y-3">
          <h4 className="text-sm font-bold text-[#0B1622]">
            Passions au cœur de mon parcours
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {about.passions.map((p) => (
              <div
                key={p.title}
                className="p-4 rounded-xl bg-white border border-[#D8CCB8] space-y-1.5"
              >
                <h5 className="text-sm font-semibold text-[#184354]">{p.title}</h5>
                <p className="text-xs text-[#4A5562] leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interests & Ambitions */}
        <div className="pt-4 border-t border-[#D8CCB8] grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#0B1622]">Centres d’intérêt</h4>
            <ul className="space-y-1.5 text-xs sm:text-sm text-[#4A5562]">
              {about.interests.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#184354] font-bold mt-0.5">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#0B1622]">Ambitions professionnelles</h4>
            <p className="text-xs sm:text-sm text-[#4A5562] leading-relaxed">
              {about.ambitionsSummary}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (sectionKey === 'skills') {
    const visibleCategories =
      selectedSkillCat === 'all'
        ? SKILL_CATEGORIES
        : SKILL_CATEGORIES.filter((cat) => cat.id === selectedSkillCat);

    return (
      <div className="space-y-5">
        {/* Interactive Category Tabs */}
        <div
          className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EAE3D5] rounded-xl border border-[#D8CCB8]"
          role="tablist"
          aria-label="Catégories de compétences"
        >
          <button
            type="button"
            onClick={() => setSelectedSkillCat('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              selectedSkillCat === 'all'
                ? 'bg-[#0B1622] text-[#F5F1E8] shadow-xs'
                : 'text-[#4A5562] hover:text-[#0B1622]'
            }`}
          >
            Toutes les catégories
          </button>
          {SKILL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedSkillCat(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                selectedSkillCat === cat.id
                  ? 'bg-[#0B1622] text-[#F5F1E8] shadow-xs'
                  : 'text-[#4A5562] hover:text-[#0B1622]'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Categorized Skills Grid */}
        <div className="space-y-6">
          {visibleCategories.map((cat) => (
            <div key={cat.id} className="space-y-3">
              <div>
                <h4 className="text-base font-bold text-[#0B1622]">{cat.title}</h4>
                <p className="text-xs text-[#4A5562]">{cat.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.items.map((skill) => (
                  <div
                    key={skill.name}
                    className="p-3.5 rounded-xl bg-white border border-[#D8CCB8] flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-[#F6F3EC] border border-[#D8CCB8] shrink-0">
                      <SkillIcon iconKey={skill.iconKey} />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-sm font-semibold text-[#0B1622]">{skill.name}</h5>
                      <p className="text-xs text-[#4A5562] leading-relaxed mt-0.5">
                        {skill.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sectionKey === 'projects') {
    const orderedProjects = focusTarget
      ? [
          ...PROJECTS_DATA.filter((p) => p.id === focusTarget),
          ...PROJECTS_DATA.filter((p) => p.id !== focusTarget),
        ]
      : PROJECTS_DATA;

    return (
      <div className="space-y-5">
        {orderedProjects.map((project, idx) => {
          const isHighlighted = focusTarget === project.id || (!focusTarget && idx === 0);
          return (
            <article
              key={project.id}
              className={`p-5 rounded-xl border transition-colors space-y-3.5 ${
                isHighlighted
                  ? 'bg-white border-[#184354] shadow-xs'
                  : 'bg-white/90 border-[#D8CCB8]'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-mono font-medium text-[#184354]">
                    {project.category}
                    {project.status === 'upcoming' ? ' · À renseigner ultérieurement' : ''}
                  </div>
                  <h4 className="text-lg font-bold text-[#0B1622] mt-0.5">{project.title}</h4>
                </div>
              </div>

              <p className="text-sm text-[#24292E] leading-relaxed">{project.summary}</p>

              <p className="text-xs text-[#4A5562] leading-relaxed">
                <strong className="text-[#0B1622] font-semibold">Objectif :</strong>{' '}
                {project.objective}
              </p>

              {project.valueAdded && (
                <p className="text-xs text-[#4A5562] leading-relaxed">
                  <strong className="text-[#0B1622] font-semibold">Valeur ajoutée :</strong>{' '}
                  {project.valueAdded}
                </p>
              )}

              {project.features.length > 0 && (
                <div className="pt-2 border-t border-[#EAE3D5] space-y-1.5">
                  <div className="text-xs font-semibold text-[#0B1622]">Fonctionnalités clés</div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#4A5562]">
                    {project.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-1.5">
                        <span className="text-[#184354] font-bold">·</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.technologies.length > 0 && (
                <div className="pt-2 border-t border-[#EAE3D5] text-xs text-[#184354]">
                  <span className="font-semibold text-[#0B1622]">Outils &amp; technologies : </span>
                  <span>{project.technologies.join(' · ')}</span>
                </div>
              )}

              {project.domain && (
                <div className="text-xs text-[#4A5562]">
                  <span className="font-semibold text-[#0B1622]">Domaine : </span>
                  <span>{project.domain}</span>
                </div>
              )}

              {/* Aperçu de l'application — Interactive Screenshot Gallery */}
              <ProjectScreenshotGallery
                projectTitle={project.title}
                screenshots={project.screenshots}
              />
            </article>
          );
        })}
      </div>
    );
  }

  if (sectionKey === 'certifications') {
    const showCerts = selectedAccompSpace === 'all' || selectedAccompSpace === 'certs';
    const showHackathons = selectedAccompSpace === 'all' || selectedAccompSpace === 'hackathons';

    return (
      <div className="space-y-6">
        {/* Interactive space selector */}
        <div
          className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EAE3D5] rounded-xl border border-[#D8CCB8]"
          role="tablist"
          aria-label="Espaces du Quai des Accomplissements"
        >
          <button
            type="button"
            onClick={() => setSelectedAccompSpace('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              selectedAccompSpace === 'all'
                ? 'bg-[#0B1622] text-[#F5F1E8] shadow-xs'
                : 'text-[#4A5562] hover:text-[#0B1622]'
            }`}
          >
            Vue complète
          </button>
          <button
            type="button"
            onClick={() => setSelectedAccompSpace('certs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              selectedAccompSpace === 'certs'
                ? 'bg-[#0B1622] text-[#F5F1E8] shadow-xs'
                : 'text-[#4A5562] hover:text-[#0B1622]'
            }`}
          >
            Espace A · Certifications &amp; formations
          </button>
          <button
            type="button"
            onClick={() => setSelectedAccompSpace('hackathons')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              selectedAccompSpace === 'hackathons'
                ? 'bg-[#0B1622] text-[#F5F1E8] shadow-xs'
                : 'text-[#4A5562] hover:text-[#0B1622]'
            }`}
          >
            Espace B · Hackathons &amp; compétitions
          </button>
        </div>

        {/* ESPACE A : Certifications et formations */}
        {showCerts && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-[#0B1622]">
                Espace A — Certifications, diplômes et formations
              </h4>
              <span className="text-xs font-mono text-[#184354] tabular-nums">
                {CERTIFICATIONS_DATA.length} titres
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CERTIFICATIONS_DATA.map((cert) => {
                const isSelected = selectedCert?.id === cert.id;
                return (
                  <button
                    key={cert.id}
                    type="button"
                    onClick={() => setSelectedCert(cert)}
                    className={`text-left p-4 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-white border-[#184354] shadow-xs'
                        : 'bg-white/75 border-[#D8CCB8] hover:border-[#184354]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-[#4A5562]">
                      <span>{cert.issuer}</span>
                      <Award
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-[#184354]' : 'text-[#6E8C7A]'
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="text-sm font-bold text-[#0B1622] leading-snug">{cert.title}</div>
                    <div className="text-xs text-[#184354]">{cert.domain}</div>
                  </button>
                );
              })}
            </div>

            {selectedCert && (
              <div className="p-5 rounded-xl bg-white border border-[#D8CCB8] space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium text-[#184354]">
                      Cadre de certification · {selectedCert.issuer}
                      {selectedCert.issuedDate ? ` · ${selectedCert.issuedDate}` : ''}
                    </div>
                    <h5 className="text-base font-bold text-[#0B1622] mt-0.5">
                      {selectedCert.title}
                    </h5>
                    {selectedCert.credentialCode && (
                      <div className="text-xs font-mono text-[#4A5562] mt-0.5">
                        {selectedCert.credentialCode}
                      </div>
                    )}
                  </div>
                  <FileBadge2 className="w-5 h-5 text-[#184354] shrink-0" aria-hidden="true" />
                </div>

                <p className="text-sm text-[#4A5562] leading-relaxed">{selectedCert.summary}</p>

                {selectedCert.proofImageUrl ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        setZoomedCertImage({
                          url: selectedCert.proofImageUrl!,
                          title: selectedCert.title,
                        })
                      }
                      className="group relative w-full rounded-xl overflow-hidden border border-[#D8CCB8] bg-[#F6F3EC] cursor-pointer text-left block"
                    >
                      <img
                        src={selectedCert.proofImageUrl}
                        alt={`Certificat : ${selectedCert.title}`}
                        referrerPolicy="no-referrer"
                        className="w-full max-h-72 object-contain bg-[#F6F3EC] p-2"
                      />
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1622]/90 text-[#F5F1E8] text-xs font-semibold group-hover:bg-[#184354] transition-colors">
                        <ZoomIn className="w-3.5 h-3.5 text-[#9EC0D1]" aria-hidden="true" />
                        <span>Agrandir le certificat</span>
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#F6F3EC] border border-dashed border-[#D8CCB8] text-xs text-[#4A5562]">
                    Emplacement prêt pour le justificatif officiel
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ESPACE B : Hackathons et compétitions */}
        {showHackathons && (
          <div className="space-y-4 pt-4 border-t border-[#D8CCB8]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-[#0B1622]">
                  Espace B — Hackathons et compétitions technologiques
                </h4>
                <p className="text-xs text-[#4A5562] mt-0.5">
                  Événements d’innovation, défis collaboratifs et distinctions obtenues.
                </p>
              </div>
              <span className="text-xs font-mono text-[#184354] tabular-nums">
                {HACKATHONS_DATA.length} événements
              </span>
            </div>

            {/* Interactive Hackathon Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {HACKATHONS_DATA.map((item) => {
                const isSelected = selectedHackathon.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedHackathon(item)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      item.isVictory
                        ? isSelected
                          ? 'bg-[#0B1622] text-[#F5F1E8] border-[#235D73] shadow-md'
                          : 'bg-white border-[#184354] hover:bg-[#F6F3EC]'
                        : isSelected
                          ? 'bg-[#184354] text-[#F5F1E8] border-[#184354] shadow-md'
                          : 'bg-white border-[#D8CCB8] hover:border-[#184354]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div
                          className={`text-xs font-mono font-bold ${
                            isSelected ? 'text-[#9EC0D1]' : 'text-[#184354]'
                          }`}
                        >
                          {item.isVictory ? 'Distinction · Victoire' : 'Distinction · Finaliste'}
                        </div>
                        <h5
                          className={`text-base font-extrabold ${
                            isSelected ? 'text-[#F5F1E8]' : 'text-[#0B1622]'
                          }`}
                        >
                          {item.eventTitle}
                        </h5>
                      </div>

                      <div
                        className={`p-2.5 rounded-lg shrink-0 ${
                          isSelected
                            ? 'bg-white/10 text-[#F5F1E8]'
                            : item.isVictory
                              ? 'bg-[#0B1622]/8 text-[#0B1622]'
                              : 'bg-[#EAE3D5] text-[#184354]'
                        }`}
                      >
                        {item.isVictory ? (
                          <Trophy className="w-5 h-5" aria-hidden="true" />
                        ) : (
                          <Medal className="w-5 h-5" aria-hidden="true" />
                        )}
                      </div>
                    </div>

                    <div
                      className={`text-xs font-semibold ${
                        isSelected ? 'text-[#F5F1E8]' : 'text-[#184354]'
                      }`}
                    >
                      {item.resultBadge}
                    </div>

                    <p
                      className={`text-xs leading-relaxed line-clamp-2 ${
                        isSelected ? 'text-[#D8CCB8]' : 'text-[#4A5562]'
                      }`}
                    >
                      {item.distinctionSummary}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Detailed Interactive Showcase for Selected Hackathon */}
            <div className="p-5 rounded-xl border border-[#D8CCB8] space-y-4 bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#EAE3D5]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#184354]">
                    {selectedHackathon.isVictory ? (
                      <Trophy className="w-4 h-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <Medal className="w-4 h-4 text-[#184354] shrink-0" aria-hidden="true" />
                    )}
                    <span>{selectedHackathon.resultBadge}</span>
                  </div>
                  <h5 className="text-lg font-extrabold text-[#0B1622]">
                    {selectedHackathon.eventTitle}
                  </h5>
                </div>
                <span className="text-xs font-medium text-[#4A5562]">
                  {selectedHackathon.isVictory
                    ? 'Distinction majeure du parcours'
                    : 'Équipe finaliste · Innovation'}
                </span>
              </div>

              <p className="text-sm text-[#24292E] leading-relaxed">
                {selectedHackathon.distinctionSummary}
              </p>

              {/* Key Highlights */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#0B1622]">Points marquants</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#4A5562]">
                  {selectedHackathon.highlights.map((hl) => (
                    <li key={hl} className="flex items-start gap-2">
                      <span className="text-[#184354] font-bold">·</span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clean Event Photos without "Photos de l'événement" header */}
              {selectedHackathon.photos.length > 0 && (
                <div className="pt-3 border-t border-[#EAE3D5]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedHackathon.photos.map((ph) => (
                      <button
                        key={ph.url}
                        type="button"
                        onClick={() =>
                          setZoomedCertImage({ url: ph.url, title: ph.caption })
                        }
                        className="group relative rounded-xl overflow-hidden border border-[#D8CCB8] bg-[#F6F3EC] text-left cursor-pointer shadow-xs hover:shadow-md transition-all"
                      >
                        <img
                          src={ph.url}
                          alt={ph.caption}
                          referrerPolicy="no-referrer"
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        <div className="px-3 py-2 text-xs text-[#24292E] bg-white border-t border-[#EAE3D5] flex items-center justify-between gap-2">
                          <span className="truncate">{ph.caption}</span>
                          <ZoomIn
                            className="w-3.5 h-3.5 text-[#184354] shrink-0"
                            aria-hidden="true"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Certificate / Photo Zoom Lightbox */}
        {zoomedCertImage && (
          <div
            className="fixed inset-0 z-50 bg-[#0B1622]/85 backdrop-blur-xs flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={zoomedCertImage.title}
            onClick={() => setZoomedCertImage(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-[#F6F3EC] rounded-2xl p-3 sm:p-4 shadow-2xl border border-[#D8CCB8]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 pb-3 px-1">
                <h6 className="text-sm font-bold text-[#0B1622] truncate">
                  {zoomedCertImage.title}
                </h6>
                <button
                  type="button"
                  onClick={() => setZoomedCertImage(null)}
                  className="p-1.5 rounded-lg bg-white hover:bg-[#EAE3D5] text-[#0B1622] border border-[#D8CCB8] cursor-pointer"
                  aria-label="Fermer l’aperçu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <img
                src={zoomedCertImage.url}
                alt={zoomedCertImage.title}
                referrerPolicy="no-referrer"
                className="w-full max-h-[76vh] object-contain rounded-xl bg-white"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (sectionKey === 'ambitions') {
    const { futureAmbitions } = PROFILE_DATA;
    return (
      <div className="space-y-5">
        <div className="p-5 rounded-xl bg-[#0B1622] text-[#F5F1E8] border border-[#235D73] space-y-2">
          <div className="text-xs font-mono font-semibold text-[#9EC0D1]">Cap sur l’avenir</div>
          <h4 className="font-editorial text-xl sm:text-2xl font-semibold text-[#F5F1E8]">
            {futureAmbitions.headline}
          </h4>
          <p className="text-sm text-[#D8CCB8] leading-relaxed">
            {futureAmbitions.innovationGoal}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-[#D8CCB8] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0B1622]">
              <BarChart3 className="w-4 h-4 text-[#184354]" aria-hidden="true" />
              <span>Intérêt pour la Data Science</span>
            </div>
            <p className="text-xs sm:text-sm text-[#4A5562] leading-relaxed">
              {futureAmbitions.dataScienceVision}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#D8CCB8] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0B1622]">
              <Cpu className="w-4 h-4 text-[#274D3A]" aria-hidden="true" />
              <span>Intérêt pour l’Intelligence Artificielle</span>
            </div>
            <p className="text-xs sm:text-sm text-[#4A5562] leading-relaxed">
              {futureAmbitions.aiVision}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-[#0B1622]">Objectifs professionnels</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#4A5562]">
              {futureAmbitions.professionalObjectives.map((obj) => (
                <li key={obj} className="flex items-start gap-2">
                  <span className="text-[#184354] font-bold">·</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-[#0B1622]">Domaines de progression souhaités</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#4A5562]">
              {futureAmbitions.growthDomains.map((dom) => (
                <li key={dom} className="flex items-start gap-2">
                  <span className="text-[#274D3A] font-bold">·</span>
                  <span>{dom}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Gare 06: Contact, CV & Final Message
  const handleDownloadCv = async () => {
    setCvDownloading(true);
    setCvDownloadError(null);
    const result = await downloadPortfolioCvDocument({
      skillsSummary: SKILL_CATEGORIES.map(
        (c) => `${c.title} : ${c.items.map((i) => i.name).join(', ')}`
      ),
      projectsSummary: PROJECTS_DATA.map((p) => ({
        title: p.title,
        summary: p.summary,
        tech: p.technologies.join(', '),
      })),
      certificationsSummary: CERTIFICATIONS_DATA.map((c) => c.title),
    });
    setCvDownloading(false);
    if (!result.ok && result.error) {
      setCvDownloadError(result.error);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !message.trim()) {
      setFormError('Veuillez renseigner votre nom, votre adresse e-mail et votre message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail.trim())) {
      setFormError('Veuillez saisir une adresse e-mail valide.');
      return;
    }
    setFormError('');
    setFormSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Closing Message */}
      <div className="p-5 rounded-xl bg-[#0B1622] border border-[#235D73] text-center space-y-2">
        <p className="font-editorial text-lg sm:text-xl font-medium text-[#F5F1E8] leading-relaxed">
          « {PROFILE_DATA.closingMessage} »
        </p>
      </div>

      {/* Contact Coordinates & CV */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#D8CCB8] space-y-3">
          <h4 className="text-sm font-bold text-[#0B1622]">Coordonnées</h4>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#4A5562]">
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#184354] shrink-0" aria-hidden="true" />
              <span className="font-medium text-[#0B1622]">E-mail :</span>
              {CONTACT_DATA.emailConfigured ? (
                <a
                  href={`mailto:${CONTACT_DATA.email}`}
                  className="text-[#184354] hover:underline truncate"
                >
                  {CONTACT_DATA.email}
                </a>
              ) : (
                <span className="text-[#636E7A] italic">{CONTACT_DATA.email}</span>
              )}
            </li>
            <li className="flex items-center gap-2.5">
              <span className="font-medium text-[#0B1622]">LinkedIn :</span>
              {CONTACT_DATA.linkedinConfigured ? (
                <a
                  href={CONTACT_DATA.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ouvrir le profil LinkedIn"
                  aria-label="Ouvrir le profil LinkedIn"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A66C2] hover:bg-[#084E96] text-white transition-colors shadow-xs"
                >
                  <Linkedin className="w-4 h-4" aria-hidden="true" />
                </a>
              ) : (
                <span className="text-[#636E7A] italic">{CONTACT_DATA.linkedin}</span>
              )}
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#D8CCB8] flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0B1622]">
              <Globe className="w-4 h-4 text-[#184354]" aria-hidden="true" />
              <span>Curriculum Vitae (PDF)</span>
            </div>
            <p className="text-xs text-[#4A5562] leading-relaxed">
              {CONTACT_DATA.cvConfigured
                ? 'Consultez en ligne ou téléchargez mon CV complet (formation, compétences, projets et certifications).'
                : 'Téléchargez un récapitulatif structuré du portfolio.'}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadCv}
                disabled={cvDownloading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0B1622] hover:bg-[#184354] disabled:opacity-60 text-[#F5F1E8] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                {cvDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#9EC0D1] shrink-0" aria-hidden="true" />
                ) : (
                  <Download className="w-4 h-4 text-[#9EC0D1] shrink-0" aria-hidden="true" />
                )}
                <span>{cvDownloading ? 'Préparation...' : 'Télécharger mon CV'}</span>
              </button>
              {CONTACT_DATA.cvConfigured && (
                <button
                  type="button"
                  onClick={() => setCvPreviewOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#EAE3D5] hover:bg-[#D8CCB8] text-[#0B1622] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Eye className="w-4 h-4 text-[#184354] shrink-0" aria-hidden="true" />
                  <span>Aperçu</span>
                </button>
              )}
            </div>
            {cvDownloadError && (
              <p className="text-xs text-[#B91C1C]" role="alert">
                {cvDownloadError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Functional Contact Form */}
      <div className="p-5 rounded-xl bg-white border border-[#D8CCB8] space-y-4">
        <h4 className="text-sm font-bold text-[#0B1622]">Envoyer un message</h4>
        {formSubmitted ? (
          <div className="p-4 rounded-xl bg-[#E6F0EC] border border-[#8AA694] text-[#1B3B2B] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Message enregistré avec succès</span>
            </div>
            <p className="text-xs leading-relaxed">
              Merci {senderName} ! Votre message concernant « {subject || 'Prise de contact'} » a
              bien été préparé.
            </p>
            <button
              type="button"
              onClick={() => {
                setFormSubmitted(false);
                setSenderName('');
                setSenderEmail('');
                setSubject('');
                setMessage('');
              }}
              className="text-xs font-semibold underline cursor-pointer"
            >
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-semibold text-[#0B1622] mb-1"
                >
                  Nom complet
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CCB8] bg-[#F6F3EC] text-sm text-[#0B1622] focus:outline-2 focus:outline-[#184354]"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-semibold text-[#0B1622] mb-1"
                >
                  Adresse e-mail
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CCB8] bg-[#F6F3EC] text-sm text-[#0B1622] focus:outline-2 focus:outline-[#184354]"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-subject"
                className="block text-xs font-semibold text-[#0B1622] mb-1"
              >
                Objet
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Opportunité, collaboration, question..."
                className="w-full px-3 py-2 rounded-lg border border-[#D8CCB8] bg-[#F6F3EC] text-sm text-[#0B1622] focus:outline-2 focus:outline-[#184354]"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block text-xs font-semibold text-[#0B1622] mb-1"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrivez votre message ici..."
                className="w-full px-3 py-2 rounded-lg border border-[#D8CCB8] bg-[#F6F3EC] text-sm text-[#0B1622] focus:outline-2 focus:outline-[#184354]"
                required
              />
            </div>

            {formError && (
              <p className="text-xs font-medium text-[#B91C1C]" role="alert">
                {formError}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#184354] hover:bg-[#102F3B] text-[#F5F1E8] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#9EC0D1]" aria-hidden="true" />
                <span>Envoyer le message</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* PDF CV Preview Modal (rendered via pdfjs-dist canvas) */}
      {cvPreviewOpen && CONTACT_DATA.cvConfigured && (
        <PdfCvModal
          pdfUrl={CONTACT_DATA.cvFileUrl}
          onClose={() => setCvPreviewOpen(false)}
          onDownloadPdf={handleDownloadCv}
          downloadingPdf={cvDownloading}
        />
      )}
    </div>
  );
}
