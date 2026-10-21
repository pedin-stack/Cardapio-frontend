/**
 * @description Campo de texto do painel (compatível com `register` do RHF) com label, erro acessível
 * (`aria-invalid` + `aria-describedby` → `role="alert"`) e visual de vidro. `type="password"` ganha o botão de
 * mostrar/ocultar a senha.
 */
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

type BaseProps = {
  label: string;
  erro?: string;
  dica?: ReactNode;
  wrapperClassName?: string;
};

export const CLASSE_CAMPO =
  "w-full rounded-2xl bg-(--superficie) px-4 py-3 text-[15px] text-(--texto) ring-1 ring-(--borda) transition outline-none placeholder:text-(--texto-fraco) focus:bg-(--superficie-forte) focus:ring-2 focus:ring-(--destaque)/70 aria-[invalid=true]:ring-(--perigo)/80";

function Moldura({ id, label, erro, dica, wrapperClassName, children }: BaseProps & { id: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName ?? ""}`}>
      <label htmlFor={id} className="text-sm font-medium text-(--texto-suave)">
        {label}
      </label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} role="alert" className="text-xs text-(--perigo)">
          {erro}
        </p>
      ) : (
        dica && <p className="text-xs text-(--texto-fraco)">{dica}</p>
      )}
    </div>
  );
}

export const InputField = forwardRef<HTMLInputElement, BaseProps & InputHTMLAttributes<HTMLInputElement>>(function InputField(
  { label, erro, dica, wrapperClassName, className, type, ...props },
  ref,
) {
  const id = useId();
  const ehSenha = type === "password";
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const campo = (
    <input
      ref={ref}
      id={id}
      type={ehSenha && senhaVisivel ? "text" : type}
      aria-invalid={Boolean(erro)}
      aria-describedby={erro ? `${id}-erro` : undefined}
      className={`${CLASSE_CAMPO} ${ehSenha ? "pr-12" : ""} ${className ?? ""}`}
      {...props}
    />
  );

  return (
    <Moldura id={id} label={label} erro={erro} dica={dica} wrapperClassName={wrapperClassName}>
      {ehSenha ? (
        <div className="relative">
          {campo}
          <button
            type="button"
            onClick={() => setSenhaVisivel((v) => !v)}
            aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={senhaVisivel}
            aria-controls={id}
            className="absolute inset-y-0 right-1 my-auto grid size-10 place-items-center rounded-full text-(--texto-suave) transition hover:text-(--texto) focus-visible:ring-2 focus-visible:ring-(--destaque)/70 focus-visible:outline-none"
          >
            {senhaVisivel ? <EyeSlashIcon size={20} aria-hidden /> : <EyeIcon size={20} aria-hidden />}
          </button>
        </div>
      ) : (
        campo
      )}
    </Moldura>
  );
});

export const TextareaField = forwardRef<HTMLTextAreaElement, BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextareaField({ label, erro, dica, wrapperClassName, className, ...props }, ref) {
    const id = useId();
    return (
      <Moldura id={id} label={label} erro={erro} dica={dica} wrapperClassName={wrapperClassName}>
        <textarea
          ref={ref}
          id={id}
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? `${id}-erro` : undefined}
          className={`${CLASSE_CAMPO} min-h-28 resize-y ${className ?? ""}`}
          {...props}
        />
      </Moldura>
    );
  },
);
