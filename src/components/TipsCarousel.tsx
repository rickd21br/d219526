import { useEffect, useRef, useState } from "react";
import { Lightbulb } from "lucide-react";

const TIPS = [
  "Anote toda saída do dia. O que se mede, se controla.",
  "Antes de comprar, espere 24h. Vontade não é necessidade.",
  "Pague-se primeiro: separe um valor para você antes das contas.",
  "Revise assinaturas mensais. Cancele o que você não usa há 30 dias.",
  "Compare 3 preços antes de qualquer compra acima de R$100.",
  "Estabeleça um teto para 'supérfluos' por semana — e respeite.",
  "Cozinhe em casa pelo menos 5 vezes por semana.",
  "Negocie dívidas: ligue, peça desconto à vista. Quase sempre funciona.",
  "Crie uma reserva de emergência equivalente a 3 meses de gastos.",
  "Estude 15 min/dia sobre dinheiro. Constância vence intensidade.",
  "Evite parcelar o que se consome rápido (comida, lazer).",
  "Defina uma meta visível. Sem destino, todo caminho cansa.",
  "Use dinheiro vivo em categorias de risco (lazer, mercado).",
  "Revise seu orçamento toda segunda. 10 minutos mudam o mês.",
  "Diga 'não' sem culpa. Sua paz financeira vale mais que aprovação.",
];

// Loop infinito: triplicamos a lista e ficamos no bloco do meio.
const LOOP = [...TIPS, ...TIPS, ...TIPS];

export function TipsCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(TIPS.length); // começa no bloco do meio
  const pausedRef = useRef(false);

  // Centraliza inicialmente no bloco do meio
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-tip-card]");
    cards[TIPS.length]?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  // Auto-scroll
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      const cards = el.querySelectorAll<HTMLElement>("[data-tip-card]");
      const next = (activeIdx + 1) % LOOP.length;
      cards[next]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, 3500);
    return () => clearInterval(id);
  }, [activeIdx]);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-tip-card]"));
    let bestIdx = 0;
    let bestDist = Infinity;
    cards.forEach((c, i) => {
      const cc = c.offsetLeft + c.offsetWidth / 2;
      const d = Math.abs(center - cc);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    setActiveIdx(bestIdx);

    // Reposiciona invisivelmente quando chega nas bordas (loop infinito)
    if (bestIdx < TIPS.length / 2 || bestIdx > LOOP.length - TIPS.length / 2) {
      const target = TIPS.length + (bestIdx % TIPS.length);
      window.requestAnimationFrame(() => {
        cards[target]?.scrollIntoView({ inline: "center", block: "nearest" });
        setActiveIdx(target);
      });
    }
  };

  return (
    <section
      className="mt-5"
      onPointerDown={() => (pausedRef.current = true)}
      onPointerUp={() => (pausedRef.current = false)}
      onPointerLeave={() => (pausedRef.current = false)}
      aria-label="Dicas do dia"
    >
      <div className="mb-2 flex items-center gap-2 px-1">
        <Lightbulb className="h-4 w-4 text-amber-500" strokeWidth={2.5} />
        <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
          Dicas do dia
        </p>
      </div>

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-8 pb-3 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {LOOP.map((tip, i) => {
          const active = i === activeIdx;
          return (
            <div
              key={`${i}-${tip}`}
              data-tip-card
              className={[
                "min-w-[78%] snap-center rounded-3xl border bg-gradient-to-br from-amber-400/10 via-card to-card p-4 shadow-soft transition-all duration-500 ease-out sm:min-w-[64%]",
                active
                  ? "scale-100 opacity-100 border-amber-400/40 shadow-elevated"
                  : "scale-[0.88] opacity-60 border-amber-400/20",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-500">
                  <Lightbulb className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <p className="text-sm font-medium leading-snug text-card-foreground">{tip}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
