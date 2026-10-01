// Dados simulados apenas para demonstrar a interface.
// SUBSTITUIR pela integração real via backend (SNMP / API do fabricante).
export const mockPrinters = [
  {
    id: "1",
    nome: "Impressora Recepção",
    status: "online",
    ip: "192.168.1.50",
    marca: "HP",
    modelo: "LaserJet Pro M404",
    setor: "Recepção",
    nivelToner: 78,
  },
  {
    id: "2",
    nome: "Impressora Financeiro",
    status: "alerta",
    ip: "192.168.1.51",
    marca: "Brother",
    modelo: "HL-L2350DW",
    setor: "Financeiro",
    nivelToner: 12,
  },
  {
    id: "3",
    nome: "Impressora TI",
    status: "offline",
    ip: "192.168.1.52",
    marca: "Epson",
    modelo: "L3250",
    setor: "Infraestrutura",
    nivelToner: null,
  },
];
