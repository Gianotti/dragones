export interface Person {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  whatsapp?: string;
  activo: boolean;
  fecha_alta: string;
}

export interface MonthlyGame {
  id: number;
  nombre_juego: string;
  mes: string;
  fecha_creacion: string;
}

export interface PickupStatus {
  id: number;
  person_id: number;
  game_id: number;
  estado: "pendiente" | "retirado";
  fecha_retiro?: string;
}

export interface Organizer {
  id: number;
  nombre: string;
  whatsapp: string;
}

export interface PersonStatus {
  pickup_id: number;
  person_id: number;
  nombre: string;
  apellido: string;
  email: string;
  estado: "pendiente" | "retirado";
  fecha_retiro?: string;
}

export interface LandingData {
  game_id?: number;
  nombre_juego?: string;
  mes?: string;
  persons: PersonStatus[];
  organizers: Organizer[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: string;
}

export type Role = "admin" | "landing";
