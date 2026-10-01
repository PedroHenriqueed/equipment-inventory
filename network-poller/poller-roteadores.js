// poller-roteadores.js
import { RouterOSAPI } from "node-routeros";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

async function verificarRoteador(roteador) {
  const conn = new RouterOSAPI({
    host: roteador.ip,
    user: roteador.usuario_api,
    password: roteador.senha_api,
    timeout: 5,
  });

  let status = "offline";
  let possuiLoop = false;
  let interfaceComLoop = null;

  try {
    await conn.connect();
    status = "online";

    // 1) Verifica status das portas de bridge (loop-protect é nativo do RouterOS)
    const bridgePorts = await conn.write("/interface/bridge/port/print");

    for (const porta of bridgePorts) {
      // RouterOS marca "loop-protect-status" como "blocking" quando detecta loop
      if (porta["loop-protect-status"] === "blocking") {
        possuiLoop = true;
        interfaceComLoop = porta.interface;
        break;
      }
    }

    // 2) Alternativa: se não usar bridge, verificar erros de CRC/colisão nas interfaces ethernet
    if (!possuiLoop) {
      const interfaces = await conn.write("/interface/ethernet/print", [
        "=stats=",
      ]);
      for (const iface of interfaces) {
        const errosRx = parseInt(iface["rx-error"] || 0);
        if (errosRx > 1000) {
          // limite ajustável conforme seu ambiente
          possuiLoop = true;
          interfaceComLoop = iface.name;
          break;
        }
      }
    }

    status = possuiLoop ? "loop" : "online";
    await conn.close();
  } catch (err) {
    console.error(`[${roteador.nome}] erro de conexão: ${err.message}`);
    status = "offline";
  }

  await supabase
    .from("roteadores")
    .update({
      status,
      possui_loop: possuiLoop,
      interface_com_loop: interfaceComLoop,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", roteador.id);

  console.log(`[${roteador.nome}] status=${status} loop=${possuiLoop}`);
}

async function main() {
  const { data: roteadores, error } = await supabase
    .from("roteadores")
    .select("*");
  if (error) {
    console.error("Erro ao buscar roteadores:", error.message);
    return;
  }
  for (const r of roteadores) {
    await verificarRoteador(r);
  }
}

main();
