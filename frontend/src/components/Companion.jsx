export default function Companion({ small = false }) {
  return <div className={`companion ${small ? 'small' : ''}`}><svg viewBox="0 0 240 210" role="img" aria-label="Pip, your little hamster companion, holding a heart">
    <ellipse cx="123" cy="190" rx="71" ry="10" fill="#1C1C1B" opacity=".2"/>
    <circle cx="67" cy="61" r="24" fill="#B7AC9B"/><circle cx="173" cy="61" r="24" fill="#B7AC9B"/>
    <circle cx="67" cy="61" r="13" fill="#979086"/><circle cx="173" cy="61" r="13" fill="#979086"/>
    <path d="M51 117C51 71 78 46 120 46s69 25 69 71v29c0 31-25 44-69 44s-69-13-69-44z" fill="#B7AC9B"/>
    <ellipse cx="120" cy="137" rx="56" ry="46" fill="#E2E2DE"/>
    <ellipse cx="77" cy="128" rx="14" ry="9" fill="#979086" opacity=".45"/><ellipse cx="163" cy="128" rx="14" ry="9" fill="#979086" opacity=".45"/>
    <g fill="none" stroke="#6A5D52" strokeWidth="4"><circle cx="91" cy="105" r="22"/><circle cx="149" cy="105" r="22"/><path d="M113 103h14M57 99l12 4m102 0 12-4"/></g>
    <g fill="#1C1C1B"><circle cx="94" cy="106" r="4"/><circle cx="146" cy="106" r="4"/><path d="M115 121q5-4 10 0l-5 5z"/></g>
    <path d="M111 131q9 10 18 0" fill="none" stroke="#6A5D52" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M120 178s-33-19-33-36c0-17 24-21 33-5 9-16 33-12 33 5 0 17-33 36-33 36" fill="#979086"/>
    <ellipse cx="86" cy="155" rx="14" ry="10" fill="#B7AC9B" transform="rotate(30 86 155)"/><ellipse cx="155" cy="155" rx="14" ry="10" fill="#B7AC9B" transform="rotate(-30 155 155)"/>
    <path d="m208 45 3 8 8 3-8 3-3 8-3-8-8-3 8-3zM27 113l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#E2E2DE"/>
  </svg></div>;
}
