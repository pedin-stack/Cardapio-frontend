/**
 * @description Identificação do cliente: na primeira visita pergunta "identificar-se ou continuar sem login"; quando
 * o cliente tenta comentar ou avaliar sem estar identificado, abre direto no formulário (nome, telefone e CPF).
 * Fechar conta como "sem login".
 */
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { SignInIcon } from "@phosphor-icons/react";

import { mensagemSeguraDeErro } from "@/api/mensagemErro";
import { BottomSheet } from "@/components/BottomSheet";
import { Botao } from "@/components/Botao";
import { InputField } from "@/components/inputs/InputField";
import { cpfValido, mascararCpf, mascararTelefone, soDigitos } from "@/utils/mascaras";

import type { ClienteCardapio } from "../hooks/useCliente";

type IdentificacaoSheetProps = {
  aberto: boolean;
  /** Pula a pergunta e abre no formulário (veio de comentar/avaliar). */
  formularioDireto: boolean;
  restaurante: string;
  cliente: ClienteCardapio;
};

type Erros = { nome?: string; telefone?: string; cpf?: string };

export function IdentificacaoSheet({ aberto, formularioDireto, restaurante, cliente }: IdentificacaoSheetProps) {
  const [passo, setPasso] = useState<"escolha" | "formulario">("escolha");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (aberto) setPasso(formularioDireto ? "formulario" : "escolha");
  }, [aberto, formularioDireto]);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const dados = { nome: nome.trim(), telefone: soDigitos(telefone), cpf: soDigitos(cpf) };
    const novos: Erros = {
      nome: dados.nome ? undefined : "Informe seu nome.",
      telefone: dados.telefone.length >= 10 ? undefined : "Informe o telefone com DDD.",
      cpf: cpfValido(dados.cpf) ? undefined : "CPF inválido.",
    };
    setErros(novos);
    if (novos.nome || novos.telefone || novos.cpf) return;
    setEnviando(true);
    try {
      await cliente.identificar(dados);
      toast.success(`Olá, ${dados.nome.split(" ")[0]}!`);
    } catch (erro) {
      toast.error(mensagemSeguraDeErro(erro, "Não foi possível concluir a identificação."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <BottomSheet isOpen={aberto} onClose={cliente.continuarSemLogin} titulo={passo === "escolha" ? "Boas-vindas ao cardápio" : "Identifique-se"}>
      {passo === "escolha" ? (
        <div className="flex flex-col gap-3">
          <p className="mb-2 text-(--texto-suave)">
            Identificado, você comenta e avalia os pratos de {restaurante}. Sem login, navega e curte normalmente.
          </p>
          <Botao icone={<SignInIcon size={18} weight="bold" aria-hidden />} onClick={() => setPasso("formulario")}>
            Identificar-me
          </Botao>
          <Botao variante="secundario" onClick={cliente.continuarSemLogin}>
            Continuar sem login
          </Botao>
        </div>
      ) : (
        <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
          <InputField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" maxLength={120} erro={erros.nome} />
          <InputField
            label="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(74) 99999-8888"
            erro={erros.telefone}
          />
          <InputField
            label="CPF"
            value={cpf}
            onChange={(e) => setCpf(mascararCpf(e.target.value))}
            inputMode="numeric"
            placeholder="000.000.000-00"
            erro={erros.cpf}
          />
          <p className="text-xs text-(--texto-fraco)">
            Nome, telefone e CPF ficam com {restaurante}. Nos comentários aparece só o seu primeiro nome.
          </p>
          <Botao type="submit" loading={enviando}>
            Entrar
          </Botao>
          <button type="button" onClick={cliente.continuarSemLogin} className="py-1 text-sm text-(--texto-suave)">
            Agora não
          </button>
        </form>
      )}
    </BottomSheet>
  );
}
