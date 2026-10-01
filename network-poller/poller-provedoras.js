// poller-provedoras.js
import ping from "ping";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

function classificarStatus(perda, latencia) {
  if (perda === 100) return "offline";
  if (perda > 10 || latencia > 150) return "instavel"; // sinal "fraco"
  return "online";
}

async function verificarProvedora(provedora) {
  // 5 pings pra ter uma amostra melhor de perda de pacotes
  const res = await ping.promise.probe(provedora.ip_teste, {
    timeout: 2,
    extra: ["-c", "5"], // Linux/Mac. No Windows use ["-n", "5"]
  });

  const perda = res.packetLoss === "unknown" ? 100 : parseFloat(res.packetLoss);
  const latencia = res.avg === "unknown" ? null : parseFloat(res.avg);
  const status = classificarStatus(perda, latencia);

  await supabase
    .from("provedoras")
    .update({
      status,
      latencia_ms: latencia,
      perda_pacotes: perda,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", provedora.id);

  console.log(
    `[${provedora.nome}] status=${status} perda=${perda}% lat=${latencia}ms`,
  );
}

async function main() {
  const { data: provedoras, error } = await supabase
    .from("provedoras")
    .select("*");
  if (error) {
    console.error("Erro ao buscar provedoras:", error.message);
    return;
  }
  for (const p of provedoras) {
    await verificarProvedora(p);
  }
}

main();
