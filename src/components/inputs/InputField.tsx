/**
 * @description Campo de texto do painel (compatível com `register` do RHF) com label, erro acessível
 * (`aria-invalid` + `aria-describedby` → `role="alert"`) e visual de vidro.
 */
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  erro?: string;
  dica?: ReactNode;
  wrapperClassName?: string;
};

export const CLASSE_CAMPO =
  "w-full rounded-2xl bg-white/[0.06] px-4 py-3 text-[15px] text-(--texto) ring-1 ring-white/10 transition outline-none placeholder:text-(--texto-fraco) focus:bg-white/[0.09] focus:ring-2 focus:ring-(--destaque)/70 aria-[invalid=true]:ring-(--perigo)/80";

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
  { label, erro, dica, wrapperClassName, className, ...props },
  ref,
) {
  const id = useId();
  return (
    <Moldura id={id} label={label} erro={erro} dica={dica} wrapperClassName={wrapperClassName}>
      <input
        ref={ref}
        id={id}
        aria-invalid={Boolean(erro)}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className={`${CLASSE_CAMPO} ${className ?? ""}`}
        {...props}
      />
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
