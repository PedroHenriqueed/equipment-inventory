require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const snmp = require("net-snmp");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const COMMUNITY = process.env.SNMP_COMMUNITY || "public";
const TIMEOUT = Number(process.env.SNMP_TIMEOUT) || 2000;

const BASE_OIDS = {
  status: "1.3.6.1.2.1.25.3.5.1.1.1",
  supplyDescription: "1.3.6.1.2.1.43.11.1.1.6.1", // + índice
  supplyLevel: "1.3.6.1.2.1.43.11.1.1.9.1", // + índice
  supplyMax: "1.3.6.1.2.1.43.11.1.1.8.1", // + índice
  brotherToner1Low: "1.3.6.1.4.1.2435.2.3.9.1.1.2.10.1.0", // MIB privada Brother (Black Toner)
};

function statusFromCode(code) {
  switch (code) {
    case 1: // unknown, mas respondeu ao SNMP = está ligada
    case 2: // running
    case 3: // warning (ainda operacional)
      return "online";
    case 5: // down
      return "offline";
    case 4: // testing
    default:
      return "desconhecido";
  }
}


// Mapeia o status categórico da Brother para um valor percentual aproximado
function brotherTonerToPercent(code) {
  switch (code) {
    case 0:
      return 100; // Toner Full
    case 1:
      return 15; // Toner Low (valor aproximado/simbólico)
    case 2:
      return null; // No Toner Cartridge
    case 3:
      return 0; // Toner Empty
    default:
      return null;
  }
}

// Faz o walk na tabela de descrições e retorna o índice do suprimento de toner
function findTonerIndex(session) {
  return new Promise((resolve) => {
    const results = [];

    function feedCb(varbinds) {
      for (const vb of varbinds) {
        if (snmp.isVarbindError(vb)) continue;
        results.push({ oid: vb.oid, value: vb.value.toString() });
      }
    }

    function doneCb(error) {
      if (error) {
        resolve(null);
        return;
      }

      const match = results.find(({ value }) => {
        const desc = value.toLowerCase();
        return (
          desc.includes("toner") &&
          !desc.includes("waste") &&
          !desc.includes("drum") &&
          !desc.includes("fuser")
        );
      });

      if (!match) {
        resolve(null);
        return;
      }

      const parts = match.oid.split(".");
      const index = parts[parts.length - 1];
      resolve(index);
    }

    session.subtree(BASE_OIDS.supplyDescription, 20, feedCb, doneCb);
  });
}

function getValue(session, oid) {
  return new Promise((resolve) => {
    session.get([oid], (error, varbinds) => {
      if (error || !varbinds?.[0] || snmp.isVarbindError(varbinds[0])) {
        resolve(null);
        return;
      }
      resolve(varbinds[0].value);
    });
  });
}

async function getPrinterData(ip) {
  const session = snmp.createSession(ip, COMMUNITY, { timeout: TIMEOUT });

  try {
    const statusCode = await getValue(session, BASE_OIDS.status);

    if (statusCode === null) {
      return { status: "offline", nivel_toner: null };
    }

    // Descobre dinamicamente o índice do toner; se não achar, usa "1" como fallback
    let tonerIndex = await findTonerIndex(session);
    if (!tonerIndex) tonerIndex = "1";

    const tonerAtual = await getValue(
      session,
      `${BASE_OIDS.supplyLevel}.${tonerIndex}`,
    );
    const tonerMax = await getValue(
      session,
      `${BASE_OIDS.supplyMax}.${tonerIndex}`,
    );

    let nivel_toner = null;
    if (
      typeof tonerAtual === "number" &&
      typeof tonerMax === "number" &&
      tonerMax > 0 &&
      tonerAtual >= 0
    ) {
      nivel_toner = Math.round((tonerAtual / tonerMax) * 100);
    }

    // Fallback: se o padrão não retornou valor válido (ex: Brother retorna -3),
    // tenta a MIB privada da Brother (brToner1Low)
    if (nivel_toner === null) {
      const brotherCode = await getValue(session, BASE_OIDS.brotherToner1Low);
      if (typeof brotherCode === "number") {
        nivel_toner = brotherTonerToPercent(brotherCode);
      }
    }

    return { status: statusFromCode(statusCode), nivel_toner };
  } catch {
    return { status: "desconhecido", nivel_toner: null };
  } finally {
    session.close();
  }
}

async function run() {
  console.log("Buscando impressoras cadastradas no Supabase...");

  const { data: printers, error } = await supabase
    .from("printers")
    .select("id, ip");

  if (error) {
    console.error("Erro ao buscar impressoras no Supabase:", error.message);
    return;
  }

  if (!printers || printers.length === 0) {
    console.log("Nenhuma impressora cadastrada na tabela 'printers'.");
    return;
  }

  for (const printer of printers) {
    console.log(`Consultando ${printer.ip}...`);
    const result = await getPrinterData(printer.ip);

    const { error: updateError } = await supabase
      .from("printers")
      .update({
        status: result.status,
        nivel_toner: result.nivel_toner,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", printer.id);

    if (updateError) {
      console.error(
        `Erro ao atualizar impressora ${printer.id}:`,
        updateError.message,
      );
    } else {
      console.log(
        `✅ Impressora ${printer.ip}: ${result.status}, toner ${result.nivel_toner}%`,
      );
    }
  }
}

run()
  .then(() => {
    console.log("Execução finalizada.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Erro na execução:", err);
    process.exit(1);
  });
