/**
 * @description Máscaras de telefone e CPF enquanto o cliente digita, e o dígito verificador do CPF (contrato de UX:
 * o back confere de novo com o `@CPF`). Para a API vão só os dígitos (`soDigitos`).
 */

export function soDigitos(valor: string, maximo = 11): string {
  return valor.replace(/\D/g, "").slice(0, maximo);
}

/** (74) 9999-8888 ou (74) 99999-8888. */
export function mascararTelefone(valor: string): string {
  const d = soDigitos(valor);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  const corte = d.length === 11 ? 7 : 6;
  return `(${d.slice(0, 2)}) ${d.slice(2, corte)}${d.length > corte ? `-${d.slice(corte)}` : ""}`;
}

/** 000.000.000-00. */
export function mascararCpf(valor: string): string {
  return soDigitos(valor)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** 11 dígitos, não todos iguais, e os dois verificadores conferem. */
export function cpfValido(valor: string): boolean {
  const d = soDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const verificador = (n: number) => {
    const soma = [...d.slice(0, n)].reduce((total, c, i) => total + Number(c) * (n + 1 - i), 0);
    return ((soma * 10) % 11) % 10;
  };
  return verificador(9) === Number(d[9]) && verificador(10) === Number(d[10]);
}
