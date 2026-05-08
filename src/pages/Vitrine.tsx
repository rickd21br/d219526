import { MobileShell } from "@/components/MobileShell";
import { ExternalLink, Megaphone, Store } from "lucide-react";
import { useEffect, useState } from "react";
import sv1 from "@/assets/vitrine-sv1.png";
import sv2 from "@/assets/vitrine-sv2.png";
import sv3 from "@/assets/vitrine-sv3.png";
import jp1 from "@/assets/vitrine-jp1.png";
import jp2 from "@/assets/vitrine-jp2.png";
import jp3 from "@/assets/vitrine-jp3.png";

function AutoCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), 3500);
    return () => clearInterval(id);
  }, [images.length]);
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black aspect-[3/4]">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${alt} ${i + 1}`}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const PRODUCTS = [
  {
    title: "Método Sociedade Viral",
    description: "Estratégias para crescer e viralizar no digital.",
    url: "https://kiwify.app/fCHyZSL?afid=xPHPNStm",
    images: [sv1, sv2, sv3],
    cta: "Acessar oferta",
  },
  {
    title: "Desafio 21 Dias — Jornada do Progresso",
    description: "Transforme sua relação com o dinheiro em 21 dias.",
    url: "https://kiwify.app/AaBECZ6?afid=4UF5JUi5",
    images: [jp1, jp2, jp3],
    cta: "Acessar oferta",
  },
  {
    title: "Anuncie aqui",
    description: "Seu produto em destaque para milhares de pessoas. Fale comigo no Instagram.",
    url: "https://instagram.com/eu.rickbr",
    images: [],
    cta: "Anunciar",
  },
];

const Vitrine = () => {
  return (
    <MobileShell>
      <header className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-red-500">Vitrine</p>
          <h1 className="text-lg font-bold">Vitrine de Infoprodutos</h1>
        </div>
      </header>

      <ul className="space-y-5">
        {PRODUCTS.map((p) => (
          <li
            key={p.url}
            className="overflow-hidden rounded-3xl border border-red-500/20 bg-card p-4 shadow-floating"
          >
            {p.images.length > 0 ? (
              <AutoCarousel images={p.images} alt={p.title} />
            ) : (
              <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-red-500/10 via-card to-red-700/10 p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg">
                  <Megaphone className="h-8 w-8" />
                </div>
                <p className="text-xl font-bold">Anuncie aqui</p>
                <p className="text-sm text-muted-foreground">
                  Coloque seu produto em destaque na vitrine para milhares de pessoas.
                </p>
              </div>
            )}
            <h2 className="mt-4 text-base font-bold leading-snug">{p.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98]"
            >
              {p.cta} <ExternalLink className="h-4 w-4" />
            </a>
          </li>
        ))}
      </ul>
    </MobileShell>
  );
};

export default Vitrine;
