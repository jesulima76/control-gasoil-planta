export interface CompraGasoil {
  id: string;
  fecha: string; // YYYY-MM-DD
  litros: number;
  precioUnitarioUSD: number;
  totalUSD: number;
  tasaBCV: number;
  totalBs: number;
  proveedor: string;
  numeroFactura: string;
  tanqueDestino: 'Tanque Principal (Nodriza)' | 'Tanque Planta' | 'Tambor / Reserva';
  metodoPago: string;
  notas?: string;
}

export type MotivoOperacion =
  | 'Falla de Red Pública'
  | 'Mantenimiento Preventivo'
  | 'Prueba Periódica'
  | 'Pico de Demanda / Sobrecarga'
  | 'Otro';

export interface RegistroPlanta {
  id: string;
  fecha: string; // YYYY-MM-DD
  horaInicio?: string;
  horaFin?: string;
  horometroInicial: number;
  horometroFinal: number;
  horasOperacion: number;
  litrosSurtidos: number;
  nivelTanqueDespues: number; // Litros en tanque
  consumoPorHora: number; // litrosSurtidos / horasOperacion
  motivo: MotivoOperacion;
  operador: string;
  tasaBCV: number;
  observaciones?: string;
}

export interface AppConfig {
  nombreEmpresa: string;
  modeloPlanta: string;
  potenciaKVA: number;
  capacidadTanquePrincipal: number; // e.g. 5000 Litros
  capacidadTanquePlanta: number; // e.g. 250 Litros
  alertaNivelBajoLitros: number; // e.g. 80 Litros
  tasaBCVActual: number; // Bolívares por USD
  intervaloMantenimientoHoras: number; // e.g. 250h
  ultimoMantenimientoHorometro: number;
}
