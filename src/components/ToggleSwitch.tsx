/**
 * @description Interruptor controlado com mola (role="switch").
 */
import { motion } from "framer-motion";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (valor: boolean) => void;
  rotulo: string;
  disabled?: boolean;
};

export function ToggleSwitch({ checked, onChange, rotulo, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={rotulo}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors disabled:opacity-50 ${checked ? "gradiente-destaque" : "bg-white/15"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 32 }}
        className={`block size-5 rounded-full bg-white shadow ${checked ? "ml-auto" : ""}`}
      />
    </button>
  );
}
