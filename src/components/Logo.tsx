/**
 * @description Marca MenuClip: ícone + nome ("Menu" no texto da página, "Clip" no laranja da marca). O tamanho
 * segue a fonte (`className="text-2xl"`).
 * ponytail: o play turquesa dentro do "M" do logotipo fica de fora (o ícone já traz o play); trocar por SVG quando
 * houver o arquivo vetorial.
 */
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.35em] font-display leading-none font-bold tracking-tight ${className ?? ""}`}>
      <Image src="/icone.png" alt="" width={96} height={96} className="size-[1.4em]" />
      <span>
        Menu<span className="text-(--mc-laranja)">Clip</span>
      </span>
    </span>
  );
}
