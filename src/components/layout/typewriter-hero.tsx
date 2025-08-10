
"use client";

import { TypeAnimation } from 'react-type-animation';

export function TypewriterHero() {
  return (
    <>
        <TypeAnimation
            sequence={[
                'Matematiğin keyifli dünyasına hoş geldiniz!',
                1000,
                'Konu anlatımları, testler ve oyunlarla öğrenmek artık daha eğlenceli.',
                1000,
                'Adım adım ilerleyin, başarıya kolayca ulaşın.',
                1000,
                'Berkan Matematik ile sayılar sizin dostunuz olsun!',
                1000,
            ]}
            wrapper="p"
            speed={50}
            className="mt-4 text-lg md:text-xl max-w-3xl text-foreground/80 font-bold"
            repeat={Infinity}
        />
    </>
  );
}
