const snmp = require("net-snmp");

const session = snmp.createSession("192.168.88.60", "public", {
  timeout: 3000,
});

const oids = [
  "1.3.6.1.4.1.2435.2.3.9.1.1.2.10.1.0", // brToner1Low (com .0)
  "1.3.6.1.4.1.2435.2.3.9.1.1.2.10.1", // brToner1Low (sem .0)
];

session.get(oids, (error, varbinds) => {
  if (error) {
    console.log("Erro:", error.message);
  } else {
    varbinds.forEach((vb) => {
      if (snmp.isVarbindError(vb)) {
        console.log(vb.oid, "-> ERRO:", snmp.varbindError(vb));
      } else {
        console.log(vb.oid, "->", vb.value.toString());
      }
    });
  }
  session.close();
});
