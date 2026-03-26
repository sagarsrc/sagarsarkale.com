'use client';

const companies = [
  { name: 'quickcall.dev', logo: 'https://quickcall.dev/favicon-96x96.png' },
  { name: 'Yral', logo: 'https://media.licdn.com/dms/image/v2/D4D0BAQGaPIad-eFGDQ/company-logo_200_200/company-logo_200_200/0/1709024239252/yral_app_logo?e=2147483647&v=beta&t=g2EBsipTII2NUhSRAN81G32GvyLOs5_D010l49R3atc' },
  { name: 'People+AI', logo: 'https://pbs.twimg.com/profile_images/1705160569756479489/2b-7UAQ8_400x400.jpg' },
  { name: 'smallstep.ai', logo: 'https://framerusercontent.com/images/cm62IqDlxSYtaLaLmTfJGnJz0C4.png' },
  { name: 'Medpiper', logo: 'https://media.licdn.com/dms/image/v2/C560BAQHmTHY953vBpg/company-logo_200_200/company-logo_200_200/0/1630655040749/medpiper_logo?e=2147483647&v=beta&t=9L60d9u1Uu154a9qALEEbBEZ6PAunUqHNBguq_7O1eQ' },
  { name: 'Tekion', logo: 'https://logowik.com/content/uploads/images/tekion662.logowik.com.webp' },
  { name: 'Pratilipi', logo: 'https://cdn6.aptoide.com/imgs/c/3/9/c398854c8d038e8871111a74ff0ccda5_icon.png' },
];

export function ExperienceTicker() {
  const doubled = [...companies, ...companies];

  return (
    <div className="ticker-wrapper" aria-hidden="true">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span key={i} className="ticker-item">
            <img src={item.logo} alt="" className="ticker-logo" loading="lazy" />
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}
