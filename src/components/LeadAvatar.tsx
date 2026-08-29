import React from 'react';

interface LeadAvatarProps {
  className?: string;
}

export const LeadAvatar: React.FC<LeadAvatarProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-20 h-24 rounded-2xl overflow-hidden border-2 border-[#c5a47e]/50 shadow-2xl shadow-black/80 bg-[#161616] p-0.5 ${className}`}>
      {/* Visual Portrait Rendering matching Shayan Ali Zafar in grey suit & white shirt */}
      <svg
        viewBox="0 0 200 240"
        className="w-full h-full object-cover rounded-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Neutral studio background gradient */}
          <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2ded9" />
            <stop offset="50%" stopColor="#d4ceca" />
            <stop offset="100%" stopColor="#c5beba" />
          </linearGradient>

          {/* Grey suit jacket gradient */}
          <linearGradient id="suitGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8d949c" />
            <stop offset="50%" stopColor="#7a8189" />
            <stop offset="100%" stopColor="#676d75" />
          </linearGradient>

          {/* Suit shadow / lapel gradient */}
          <linearGradient id="lapelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#737a82" />
            <stop offset="100%" stopColor="#5a6068" />
          </linearGradient>

          {/* Skin tone gradient */}
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e5be9e" />
            <stop offset="60%" stopColor="#d8ab87" />
            <stop offset="100%" stopColor="#c89670" />
          </linearGradient>

          {/* Hair gradient */}
          <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1815" />
            <stop offset="70%" stopColor="#15100e" />
            <stop offset="100%" stopColor="#0d0a08" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="200" height="240" fill="url(#bgGrad)" />

        {/* Ambient lighting overlay */}
        <circle cx="100" cy="80" r="110" fill="white" fillOpacity="0.18" />

        {/* Torso / Shoulders in Grey Blazer */}
        {/* Left shoulder */}
        <path
          d="M15 240 L15 160 C15 142 42 134 70 138 L85 240 Z"
          fill="url(#suitGrad)"
        />
        {/* Right shoulder */}
        <path
          d="M185 240 L185 160 C185 142 158 134 130 138 L115 240 Z"
          fill="url(#suitGrad)"
        />

        {/* White Dress Shirt (V-neck open collar) */}
        <path
          d="M75 140 L100 195 L125 140 L115 118 L85 118 Z"
          fill="#ffffff"
        />
        {/* Shirt Collar flaps */}
        <path
          d="M85 118 L72 142 L88 144 L96 122 Z"
          fill="#f4f4f4"
          stroke="#d8d8d8"
          strokeWidth="1"
        />
        <path
          d="M115 118 L128 142 L112 144 L104 122 Z"
          fill="#f4f4f4"
          stroke="#d8d8d8"
          strokeWidth="1"
        />
        {/* Shirt buttons & placket */}
        <line x1="100" y1="145" x2="100" y2="240" stroke="#e0e0e0" strokeWidth="1.5" />
        <circle cx="100" cy="165" r="2" fill="#c0c0c0" />
        <circle cx="100" cy="195" r="2" fill="#c0c0c0" />
        <circle cx="100" cy="225" r="2" fill="#c0c0c0" />

        {/* Suit Lapels & Front Jacket Cut */}
        <path
          d="M50 148 L88 200 L95 240 L45 240 L30 170 Z"
          fill="url(#lapelGrad)"
        />
        <path
          d="M150 148 L112 200 L105 240 L155 240 L170 170 Z"
          fill="url(#lapelGrad)"
        />
        {/* Lapel creases */}
        <path
          d="M62 145 L88 200 L78 240"
          stroke="#4b5057"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M138 145 L112 200 L122 240"
          stroke="#4b5057"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Neck */}
        <path
          d="M86 100 L86 132 C86 138 100 145 100 145 C100 145 114 138 114 132 L114 100 Z"
          fill="url(#skinGrad)"
        />
        {/* Neck shadow under jaw */}
        <path
          d="M86 100 C92 108 108 108 114 100 C114 112 86 112 86 100 Z"
          fill="#b8845e"
          fillOpacity="0.6"
        />

        {/* Head / Jaw */}
        <path
          d="M74 65 C74 42 85 30 100 30 C115 30 126 42 126 65 C126 88 116 104 100 104 C84 104 74 88 74 65 Z"
          fill="url(#skinGrad)"
        />

        {/* Ears */}
        <ellipse cx="73" cy="67" rx="4.5" ry="8" fill="#d29f79" />
        <ellipse cx="127" cy="67" rx="4.5" ry="8" fill="#d29f79" />

        {/* Dark Textured Hair */}
        <path
          d="M71 52 C71 30 83 18 100 18 C117 18 129 30 129 52 C129 55 125 45 120 40 C110 32 90 32 80 40 C75 45 71 55 71 52 Z"
          fill="url(#hairGrad)"
        />
        {/* Hair volume on top */}
        <path
          d="M73 44 C72 32 84 20 100 20 C116 20 128 32 127 44 C124 35 116 28 100 28 C84 28 76 35 73 44 Z"
          fill="#2a221d"
        />
        {/* Fringe / front hair strands */}
        <path
          d="M76 42 C82 36 94 38 98 44 C102 38 114 36 124 43 C120 38 110 32 100 33 C90 32 80 38 76 42 Z"
          fill="#17120f"
        />

        {/* Eyes & Eyebrows */}
        {/* Eyebrows */}
        <path d="M82 53 Q88 50 94 53" stroke="#1d1612" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M106 53 Q112 50 118 53" stroke="#1d1612" strokeWidth="2.5" strokeLinecap="round" />
        {/* Eyes */}
        <ellipse cx="88" cy="60" rx="3.5" ry="2.5" fill="#241b16" />
        <ellipse cx="112" cy="60" rx="3.5" ry="2.5" fill="#241b16" />
        <circle cx="89" cy="59" r="0.8" fill="#ffffff" />
        <circle cx="113" cy="59" r="0.8" fill="#ffffff" />

        {/* Nose */}
        <path d="M100 58 L98 72 L103 73" stroke="#b8845e" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Neat Mustache & Light Trimmed Beard */}
        <path
          d="M93 79 Q100 77 107 79 Q100 81 93 79 Z"
          fill="#2b201a"
        />
        {/* Mouth */}
        <path d="M94 84 Q100 87 106 84" stroke="#8d4b38" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Light Beard along jawline and chin */}
        <path
          d="M80 72 C80 92 88 98 100 98 C112 98 120 92 120 72 C118 88 112 94 100 94 C88 94 82 88 80 72 Z"
          fill="#1c1612"
          fillOpacity="0.45"
        />
        {/* Chin goatee patch */}
        <ellipse cx="100" cy="92" rx="4" ry="3" fill="#201813" fillOpacity="0.6" />
      </svg>
    </div>
  );
};
